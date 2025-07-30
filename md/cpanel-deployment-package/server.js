#!/usr/bin/env node

// Production server entry point for cPanel/shared hosting
// This file starts the Express server in production mode

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Import required modules
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  // Try to run the TypeScript server with tsx
  const { register } = await import('tsx/esm/api');
  register();
  
  // Import the TypeScript server
  const serverPath = resolve(__dirname, 'server', 'index.ts');
  await import(pathToFileURL(serverPath).href);
} catch (error) {
  console.error('Failed to start server with TypeScript:', error.message);
  console.log('Attempting to use compiled JavaScript version...');
  
  try {
    // Fallback to compiled JavaScript version
    const jsServerPath = resolve(__dirname, 'dist', 'server', 'index.js');
    await import(pathToFileURL(jsServerPath).href);
  } catch (jsError) {
    console.error('Failed to start server:', jsError.message);
    console.error('\nDeployment Requirements:');
    console.error('1. Ensure tsx is installed: npm install tsx');
    console.error('2. Ensure all dependencies are installed: npm install');
    console.error('3. Check Node.js version (requires Node.js 18+ for ES modules)');
    process.exit(1);
  }
}