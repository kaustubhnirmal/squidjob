#!/usr/bin/env node

/**
 * Alternative production server starter for cPanel hosting
 * This file provides additional compatibility for different hosting environments
 */

const { spawn } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

// Set production environment
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

console.log('Starting Tender Management System in production mode...');
console.log('Node.js version:', process.version);
console.log('Working directory:', process.cwd());

// Check for required files
const serverTs = path.join(__dirname, 'server', 'index.ts');
const serverJs = path.join(__dirname, 'dist', 'server', 'index.js');
const packageJson = path.join(__dirname, 'package.json');

if (!existsSync(packageJson)) {
  console.error('Error: package.json not found. Please ensure all files are deployed correctly.');
  process.exit(1);
}

if (!existsSync(serverTs) && !existsSync(serverJs)) {
  console.error('Error: Server files not found. Please ensure server/index.ts is deployed.');
  process.exit(1);
}

// Try different startup methods
const startupMethods = [
  // Method 1: Use tsx for TypeScript
  () => {
    console.log('Attempting to start with tsx...');
    return spawn('npx', ['tsx', 'server/index.ts'], {
      stdio: 'inherit',
      cwd: __dirname
    });
  },
  
  // Method 2: Use node with ES modules
  () => {
    console.log('Attempting to start with node ES modules...');
    return spawn('node', ['--loader', 'tsx/esm', 'server/index.ts'], {
      stdio: 'inherit',
      cwd: __dirname
    });
  },
  
  // Method 3: Use compiled JavaScript if available
  () => {
    if (existsSync(serverJs)) {
      console.log('Attempting to start with compiled JavaScript...');
      return spawn('node', ['dist/server/index.js'], {
        stdio: 'inherit',
        cwd: __dirname
      });
    }
    return null;
  },
  
  // Method 4: Direct node execution
  () => {
    console.log('Attempting direct node execution...');
    return spawn('node', ['server.js'], {
      stdio: 'inherit',
      cwd: __dirname
    });
  }
];

let currentMethod = 0;

function tryStartServer() {
  if (currentMethod >= startupMethods.length) {
    console.error('\nAll startup methods failed. Please check the following:');
    console.error('1. Ensure Node.js version is 18 or higher');
    console.error('2. Run: npm install');
    console.error('3. Ensure tsx is installed: npm install tsx');
    console.error('4. Check file permissions');
    console.error('5. Verify database credentials in .env file');
    process.exit(1);
  }

  const method = startupMethods[currentMethod];
  const child = method();
  
  if (!child) {
    currentMethod++;
    tryStartServer();
    return;
  }

  child.on('error', (error) => {
    console.error(`Startup method ${currentMethod + 1} failed:`, error.message);
    currentMethod++;
    tryStartServer();
  });

  child.on('exit', (code, signal) => {
    if (code !== 0) {
      console.error(`Process exited with code ${code}, signal ${signal}`);
      currentMethod++;
      tryStartServer();
    }
  });
}

// Start the server
tryStartServer();