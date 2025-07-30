// User-related interfaces
export interface User {
  id: number;
  username: string;
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  designation?: string;
}

// Common interfaces
export interface SelectOption {
  value: string;
  label: string;
}