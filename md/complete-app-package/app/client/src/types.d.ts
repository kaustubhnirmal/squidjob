// Global type definitions for the project

declare global {
  interface Window {
    // Legacy permission debug tracking
    __warnedPermissions?: Set<string>;
    __loggedPermissions?: Set<string>;
    __warnedRoutePermissions?: Set<string>;
    __erroredRoutePermissions?: Set<string>;
    
    // New centralized debug storage
    __warnedKeys?: Set<string>;
    __erroredKeys?: Set<string>;
    __loggedKeys?: Set<string>;
  }
}

export {};