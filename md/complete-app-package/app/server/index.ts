import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import seed from "./seed";

// OpenAI API key is configured (not logging for security)

const app = express();

// Trust proxy configuration for Replit environment
app.set('trust proxy', 1); // Trust first proxy only (more secure than true)

// CORS configuration for deployment
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['*']; // Allow all origins if not specified

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // If allowedOrigins includes '*', allow all origins
    if (allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow localhost and IP-based origins for development/deployment
    if (origin.includes('localhost') || origin.match(/^https?:\/\/\d+\.\d+\.\d+\.\d+/)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: process.env.CORS_CREDENTIALS !== 'false', // Allow credentials by default
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition'], // For file downloads
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

// Security middleware with CORS-compatible CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "*"], // Allow all origins for API calls
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow cross-origin requests
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || 'unknown', // Use IP for rate limiting
  skip: (req) => req.path.startsWith('/api/health'), // Skip health checks
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many login attempts from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || 'unknown',
  skipSuccessfulRequests: true, // Don't count successful requests
});

app.use('/api/auth/login', loginLimiter);
// app.use('/api/', limiter); // Disabled for development to prevent 429 errors

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  let dbConnected = false;
  
  try {
    // Test database connection with retry logic
    console.log("Testing database connection...");
    const { db, pool } = await import("./db");
    
    // Test with a simple query with retries
    let retries = 3;
    while (retries > 0) {
      try {
        console.log(`Database connection attempt ${4 - retries}/3...`);
        await db.execute("SELECT 1 as test");
        console.log("Database connection successful");
        dbConnected = true;
        break;
      } catch (error) {
        retries--;
        console.warn(`Database connection attempt failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        if (retries > 0) {
          console.log(`Retrying in 2 seconds... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    if (dbConnected) {
      // Seed the database with initial data
      await seed();
      console.log("Database seeded successfully");
    } else {
      throw new Error("Failed to connect to database after 3 attempts");
    }
  } catch (error) {
    console.error("Database connection or seeding error:", error);
    console.log("Starting server without database connection...");
    console.log("The app will continue to work with limited functionality");
  }
  
  try {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error("Express error handler caught:", err);
      res.status(status).json({ message });
      // Don't throw the error again - this causes the server to crash
      // throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error("Critical error during server startup:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace available');
    // Exit with error code but log the error first
    process.exit(1);
  }
})().catch((error) => {
  console.error("Unhandled promise rejection in main function:", error);
  console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace available');
  process.exit(1);
});
