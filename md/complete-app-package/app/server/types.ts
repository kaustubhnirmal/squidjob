import { Request } from 'express';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
      session?: any;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    username: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    designation?: string;
  };
}