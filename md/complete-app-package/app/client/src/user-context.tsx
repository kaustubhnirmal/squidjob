import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the user interface
interface User {
  id: number;
  username: string;
  name: string;
  email?: string;
  role?: string;
  status?: string;
}

// Define the context type
interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
}

// Create the context
export const UserContext = createContext<UserContextType | undefined>(undefined);

// Create the provider component
export function UserProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage if available
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('startender_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Clear invalid user IDs (0 or 1) that don't exist in the database
      if (user.id === 0 || user.id === 1) {
        localStorage.removeItem('startender_user');
        return null;
      }
      return user;
    }
    return null;
  });

  // Update localStorage when user changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('startender_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('startender_user');
    }
  }, [currentUser]);

  // Logout function
  const logout = async () => {
    try {
      // Call the logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      // Clear user data locally
      setCurrentUser(null);
      localStorage.removeItem('startender_user');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear the local user data even if API call fails
      setCurrentUser(null);
      localStorage.removeItem('startender_user');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the user context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}