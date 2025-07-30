import path from 'path';

export const config = {
  databaseUrl: process.env.DATABASE_URL as string,
  sessionSecret: process.env.SESSION_SECRET as string,
};

// Utility function to normalize file paths for storage and retrieval
export function normalizeFilePath(filePath: string): string {
  // Convert to relative path if it's absolute
  if (path.isAbsolute(filePath)) {
    return path.relative(process.cwd(), filePath);
  }
  return filePath;
}

// Utility function to resolve file paths for file operations
export function resolveFilePath(filePath: string): string {
  // Convert to absolute path if it's relative
  if (!path.isAbsolute(filePath)) {
    return path.join(process.cwd(), filePath);
  }
  return filePath;
} 