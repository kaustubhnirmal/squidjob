#!/usr/bin/env node

/**
 * Production Startup Script for Tender Management System
 * Handles multiple Node.js environments and configurations
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'production',
  maxRetries: 3,
  retryDelay: 5000
};

// Startup methods in order of preference
const STARTUP_METHODS = [
  { name: 'tsx', command: 'npx tsx server/index.ts' },
  { name: 'ts-node', command: 'npx ts-node server/index.ts' },
  { name: 'node', command: 'node server/index.js' },
  { name: 'npm', command: 'npm start' }
];

class ProductionStarter {
  constructor() {
    this.retryCount = 0;
    this.currentMethodIndex = 0;
  }

  async start() {
    console.log('🚀 Starting Tender Management System...');
    console.log(`📍 Environment: ${CONFIG.nodeEnv}`);
    console.log(`🌐 Host: ${CONFIG.host}:${CONFIG.port}`);
    
    await this.checkEnvironment();
    await this.tryStartupMethods();
  }

  async checkEnvironment() {
    console.log('🔍 Checking environment...');
    
    // Check if .env file exists
    if (!fs.existsSync('.env')) {
      console.log('⚠️  .env file not found. Using environment variables or defaults.');
    }

    // Check if uploads directory exists
    const uploadsDir = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadsDir)) {
      console.log(`📁 Creating uploads directory: ${uploadsDir}`);
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Check database connection
    if (!process.env.DATABASE_URL) {
      console.log('⚠️  DATABASE_URL not set in environment variables');
    }

    console.log('✅ Environment check completed');
  }

  async tryStartupMethods() {
    if (this.currentMethodIndex >= STARTUP_METHODS.length) {
      throw new Error('❌ All startup methods failed. Please check the installation.');
    }

    const method = STARTUP_METHODS[this.currentMethodIndex];
    console.log(`🔄 Attempting startup method: ${method.name}`);

    try {
      await this.runCommand(method.command);
    } catch (error) {
      console.log(`❌ Startup method ${method.name} failed:`, error.message);
      this.currentMethodIndex++;
      
      if (this.retryCount < CONFIG.maxRetries) {
        console.log(`🔄 Retrying in ${CONFIG.retryDelay / 1000} seconds...`);
        setTimeout(() => {
          this.retryCount++;
          this.tryStartupMethods();
        }, CONFIG.retryDelay);
      } else {
        await this.tryStartupMethods();
      }
    }
  }

  runCommand(command) {
    return new Promise((resolve, reject) => {
      console.log(`▶️  Executing: ${command}`);
      
      const [cmd, ...args] = command.split(' ');
      const child = spawn(cmd, args, {
        stdio: 'inherit',
        shell: true,
        env: {
          ...process.env,
          NODE_ENV: CONFIG.nodeEnv,
          PORT: CONFIG.port,
          HOST: CONFIG.host
        }
      });

      // Handle successful startup
      const startupTimeout = setTimeout(() => {
        console.log('✅ Application started successfully!');
        console.log(`🌐 Access the application at: http://${CONFIG.host}:${CONFIG.port}`);
        resolve();
      }, 3000);

      child.on('error', (error) => {
        clearTimeout(startupTimeout);
        reject(error);
      });

      child.on('exit', (code) => {
        clearTimeout(startupTimeout);
        if (code !== 0) {
          reject(new Error(`Process exited with code ${code}`));
        }
      });

      // Handle process termination
      process.on('SIGINT', () => {
        console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
        child.kill('SIGINT');
        process.exit(0);
      });

      process.on('SIGTERM', () => {
        console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
        child.kill('SIGTERM');
        process.exit(0);
      });
    });
  }
}

// Health check endpoint setup
function setupHealthCheck() {
  const http = require('http');
  
  const healthServer = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid
      }));
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  const healthPort = parseInt(CONFIG.port) + 1;
  healthServer.listen(healthPort, () => {
    console.log(`🏥 Health check available at: http://${CONFIG.host}:${healthPort}/health`);
  });
}

// Start the application
async function main() {
  try {
    const starter = new ProductionStarter();
    setupHealthCheck();
    await starter.start();
  } catch (error) {
    console.error('💥 Fatal error during startup:', error.message);
    console.error('\n📋 Troubleshooting steps:');
    console.error('1. Ensure Node.js 18+ is installed');
    console.error('2. Run "npm install" to install dependencies');
    console.error('3. Check that DATABASE_URL is properly configured');
    console.error('4. Verify file permissions and directory access');
    console.error('5. Check the troubleshooting guide in the documentation');
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { ProductionStarter, CONFIG };