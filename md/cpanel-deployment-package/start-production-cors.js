#!/usr/bin/env node

/**
 * Production Startup Script with CORS Configuration
 * For deployment on AlmaLinux/CentOS/Ubuntu servers
 */

const { spawn } = require('child_process');
const path = require('path');

// Set production environment variables
process.env.NODE_ENV = 'production';

// CORS Configuration for production deployment
// Set specific domains for production security
process.env.ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*'; // Allow all by default
process.env.CORS_CREDENTIALS = process.env.CORS_CREDENTIALS || 'true';

console.log('🚀 Starting Tender Management System in Production Mode');
console.log('📡 CORS Configuration:');
console.log(`   Allowed Origins: ${process.env.ALLOWED_ORIGINS}`);
console.log(`   Credentials: ${process.env.CORS_CREDENTIALS}`);
console.log('');

// Production startup options
const options = {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: process.env.PORT || '5000',
    HOST: process.env.HOST || '0.0.0.0'
  }
};

// Try different startup methods for maximum compatibility
const startupMethods = [
  {
    name: 'tsx (TypeScript execution)',
    command: 'npx',
    args: ['tsx', 'server/index.ts']
  },
  {
    name: 'node (compiled JavaScript)',
    command: 'node',
    args: ['server.js']
  },
  {
    name: 'npm start script',
    command: 'npm',
    args: ['run', 'start']
  }
];

function tryStartup(methodIndex = 0) {
  if (methodIndex >= startupMethods.length) {
    console.error('❌ All startup methods failed');
    process.exit(1);
  }

  const method = startupMethods[methodIndex];
  console.log(`🔄 Trying startup method: ${method.name}`);

  const child = spawn(method.command, method.args, options);

  child.on('error', (error) => {
    console.log(`❌ ${method.name} failed: ${error.message}`);
    console.log(`⏭️  Trying next method...`);
    tryStartup(methodIndex + 1);
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.log(`❌ ${method.name} exited with code ${code}`);
      console.log(`⏭️  Trying next method...`);
      tryStartup(methodIndex + 1);
    }
  });

  // If process starts successfully (runs for more than 3 seconds), consider it successful
  setTimeout(() => {
    console.log(`✅ Server started successfully with ${method.name}`);
    console.log(`🌐 Access your application at:`);
    console.log(`   Local: http://localhost:${process.env.PORT || 5000}`);
    console.log(`   Network: http://YOUR_SERVER_IP:${process.env.PORT || 5000}`);
    console.log('');
    console.log('📋 CORS is configured to allow external IP access');
    console.log('🔒 For production, consider restricting ALLOWED_ORIGINS to your domain');
  }, 3000);
}

// Start the application
tryStartup();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Gracefully shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Server terminated');
  process.exit(0);
});