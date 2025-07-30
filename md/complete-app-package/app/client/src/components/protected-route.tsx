import React from 'react';
import { Route, Redirect } from 'wouter';
import { useUser } from '@/user-context';
import { usePermissions } from '@/hooks/use-permissions';
import { Spinner } from '@/components/ui/spinner';
import { warnOnce, errorOnce } from '@/lib/debug-utils';

interface ProtectedRouteProps {
  path: string;
  module?: string;
  action?: string;
  component: React.ComponentType<any>;
}

export function ProtectedRoute({ path, module, action, component: Component }: ProtectedRouteProps) {
  const { currentUser } = useUser();
  const { hasPermission, isLoading } = usePermissions();

  // Define universal routes that all authenticated users can access
  const universalRoutes = [
    '/unauthorized', 
    '/404',
    '/profile',
    '/settings?tab=profile',
    '/',                                  // Main dashboard
    '/finance-dashboard',                 // Finance dashboard
    '/sales-dashboard',                   // Sales dashboard
    '/my-tenders',                        // My Tender page - universal access for all users
    '/finance-management',                // Finance management
    '/finance-management/new-request',    // New request
    '/finance-management/approve-request',// Approve request 
    '/finance-management/denied-request', // Denied request
    '/finance-management/complete-request'// Complete request
  ];
  
  // Check if current path is a universal route
  const isUniversalRoute = universalRoutes.includes(path);

  // Create a wrapper to render the component only if authenticated and authorized
  const ProtectedComponent = (props: any) => {
    // If user is not logged in, redirect to login
    if (!currentUser) {
      return <Redirect to="/login" />;
    }

    // Always allow admin access to everything
    // Check for admin in multiple ways to be thorough
    if (currentUser?.username === 'admin' || 
        currentUser?.username === 'poonam.amale' || 
        currentUser?.role === 'Admin') {
      return <Component {...props} />;
    }
    
    // Universal routes don't need specific permissions
    if (isUniversalRoute) {
      return <Component {...props} />;
    }

    // If no module is required for this route, allow access
    if (!module) {
      return <Component {...props} />;
    }

    // Show loading state while permissions are being fetched
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <Spinner />
        </div>
      );
    }

    // Safe permission check - if in doubt, allow access to basic modules
    // The actual content within modules will have more granular checks
    try {
      const permitted = hasPermission(module, action);
      if (!permitted) {
        // Use our utility function to warn only once
        const routePermKey = `route-${path}-${module}-${action || 'none'}`;
        warnOnce(
          routePermKey,
          `User ${currentUser?.username} attempted to access ${path} but lacks permission: ${module}${action ? '.' + action : ''}`
        );
        return <Redirect to="/unauthorized" />;
      }
    } catch (error) {
      // Use our utility function to log errors only once
      const routeErrorKey = `route-error-${path}-${module}-${action || 'none'}`;
      errorOnce(routeErrorKey, 'Permission checking error:', error);
      
      // If we can't determine permissions, allow access to basic modules
      // but redirect for more sensitive modules
      const sensitiveModules = ['admin', 'users', 'roles']; // Removed finance from sensitive modules
      if (module && sensitiveModules.includes(module)) {
        return <Redirect to="/unauthorized" />;
      }
    }

    // All checks passed, render the component
    return <Component {...props} />;
  };

  // Return the route with the protected component
  return <Route path={path} component={ProtectedComponent} />;
}