/**
 * Debug utilities for development - these functions will only log in development mode
 * and will maintain memory of what has been logged to prevent console spam.
 */

// Initialize storage if not already present
const initializeStorage = (storageKey: string): Set<string> => {
  if (!window[storageKey as keyof Window]) {
    (window as any)[storageKey] = new Set<string>();
  }
  return (window as any)[storageKey] as Set<string>;
};

/**
 * Log a warning only once per key
 */
export const warnOnce = (key: string, message: string): void => {
  if (process.env.NODE_ENV !== 'development') return;
  
  const warned = initializeStorage('__warnedKeys');
  
  if (!warned.has(key)) {
    console.warn(message);
    warned.add(key);
  }
};

/**
 * Log an error only once per key
 */
export const errorOnce = (key: string, message: string, error?: any): void => {
  if (process.env.NODE_ENV !== 'development') return;
  
  const errored = initializeStorage('__erroredKeys');
  
  if (!errored.has(key)) {
    if (error) {
      console.error(message, error);
    } else {
      console.error(message);
    }
    errored.add(key);
  }
};

/**
 * Log info only once per key
 */
export const logOnce = (key: string, message: string): void => {
  if (process.env.NODE_ENV !== 'development') return;
  
  const logged = initializeStorage('__loggedKeys');
  
  if (!logged.has(key)) {
    console.log(message);
    logged.add(key);
  }
};