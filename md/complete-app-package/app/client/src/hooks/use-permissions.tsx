import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@/user-context';
import { useQuery } from '@tanstack/react-query';
import { warnOnce, logOnce, errorOnce } from '@/lib/debug-utils';

// Define the permission structure
interface PermissionData {
  [key: string]: any; // This can be expanded to be more specific based on your permission structure
}

// Define the context value type
interface PermissionsContextValue {
  permissions: PermissionData;
  isLoading: boolean;
  error: Error | null;
  hasPermission: (module: string, action?: string) => boolean;
}

// Create the context with a default value
const PermissionsContext = createContext<PermissionsContextValue>({
  permissions: {},
  isLoading: true,
  error: null,
  hasPermission: () => false,
});

// Provider component
export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useUser();
  const [permissions, setPermissions] = useState<PermissionData>({});

  // Fetch permissions based on the user's role id
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/roles', currentUser?.id, 'permissions'],
    queryFn: async () => {
      if (!currentUser?.id) {
        return { permissions: {} };
      }
      
      // First get user role ID since we need to query based on that
      const roleResponse = await fetch(`/api/users/${currentUser.id}/role`);
      if (!roleResponse.ok) {
        throw new Error('Failed to fetch user role');
      }
      
      const roleData = await roleResponse.json();
      if (!roleData.roleId) {
        return { permissions: {} };
      }
      
      // Now get permissions for this role
      const permissionsResponse = await fetch(`/api/roles/${roleData.roleId}/permissions`);
      if (!permissionsResponse.ok) {
        throw new Error('Failed to fetch permissions');
      }
      
      return permissionsResponse.json();
    },
    enabled: !!currentUser?.id,
  });

  // Update permissions when data changes
  useEffect(() => {
    if (data) {
      logOnce('permissions-raw-data', "Raw data from API received");
      
      // Check if the data is in the format we expect
      if (data.permissions && typeof data.permissions === 'object') {
        logOnce('permissions-api-format', "Setting permissions from API data");
        setPermissions(data.permissions);
      } else if (data.id && data.roleId && data.permissions) {
        // This is the format returned by the API directly - the permissions field itself is also an object
        try {
          // In some cases, permissions might be a stringified JSON object
          const parsedPermissions = typeof data.permissions === 'string' 
            ? JSON.parse(data.permissions) 
            : data.permissions;
            
          logOnce('permissions-db-format', "Setting permissions from database record");
          setPermissions(parsedPermissions);
        } catch (error) {
          errorOnce('permissions-parse-error', "Failed to parse permissions:", error);
        }
      }
    }
  }, [data]);

  // Define universally accessible modules and actions for all users
  // Only admin will have access to everything - regular users need specific permissions
  const universalModules: Record<string, boolean> = {
    'profile': true,          // Profile is universally accessible
    'finance': true,          // Finance module is universally accessible
    'folders': true,          // Document management is universally accessible
    'briefCase': true         // Document brief case is universally accessible
  };
  
  // Add mapping for API permission keys to our frontend module names
  const permissionKeyMapping: Record<string, string> = {
    'tender': 'tender',
    'tenderTask': 'tenderTask',
    'addNewTender': 'addNewTender',
    'salesDashboard': 'salesDashboard',
    'financeDashboard': 'financeDashboard',
    'tenderResult': 'tenderResults',
    'approvals': 'approvals',
    'folders': 'folders',
    'briefCase': 'briefCase',
    'finance': 'finance',
    'mis': 'mis',
    'utility': 'utility',
    'analytics': 'analytics',
    'department': 'department',
    'designation': 'designation',
    'role': 'role',
    'oem': 'oemManagement',
    'userMaster': 'userMaster',
    'checklist': 'checklist',
    'admin': 'admin'
  };

  // Check if a user has permission for a specific module and optional action
  const hasPermission = (module: string, action?: string): boolean => {
    // If no user is logged in, they have no permissions
    if (!currentUser) {
      return false;
    }

    // Admin has all permissions EXCEPT for explicit admin permission checks
    // Log once to help with debugging
    logOnce('admin-check', `Checking admin access for ${currentUser.username} with role ${currentUser.role}`);
    
    // Check for admin by username or role - but only for non-admin permission checks
    // For 'admin' permission specifically, we handle this in the special case below
    if (module !== 'admin' && (
        currentUser.username === 'admin' || 
        currentUser.username === 'poonam.amale' || 
        currentUser.username === 'kn@starinxs.com' ||
        currentUser.role === 'Admin' ||
        currentUser.role === '1' ||  // Role ID might be stored as string
        (currentUser as any).roleId === 1)) {  // Or as a separate property, use type assertion
      return true;
    }
    
    // Special case for 'admin' permission - only admin users should have this
    if (module === 'admin') {
      // Only allow admin users - check both role and known admin usernames
      const isAdmin = currentUser.role === 'Admin' || 
                     currentUser.username === 'admin' || 
                     currentUser.username === 'poonam.amale' ||
                     currentUser.username === 'kn@starinxs.com';
      
      console.log('ADMIN CHECK DETAILS:', {
        module: module,
        currentUser: currentUser,
        role: currentUser.role,
        username: currentUser.username,
        isAdmin: isAdmin,
        allUserData: JSON.stringify(currentUser, null, 2)
      });
      
      // For non-admin users, explicitly deny admin permission
      if (!isAdmin) {
        console.log(`DENYING admin permission for non-admin user: ${currentUser.username} (role: ${currentUser.role})`);
        return false;
      }
      
      return true;
    }
    
    // Basic modules that all authenticated users can access
    if (universalModules[module]) {
      return true;
    }

    // Special handling for document management sub-permissions
    if (module === 'folders' || module === 'folder') {
      const docMgmtData = permissions['documentManagement'];
      if (docMgmtData?.selected && docMgmtData?.permissions?.folder?.selected) {
        return true;
      }
    }
    
    if (module === 'documentBriefCase' || module === 'briefCase') {
      const docMgmtData = permissions['documentManagement'];
      if (docMgmtData?.selected && docMgmtData?.permissions?.documentBriefCase?.selected) {
        return true;
      }
    }
    
    if (module === 'checklist') {
      // Check for checklist permission in document management
      const docMgmtData = permissions['documentManagement'];
      if (docMgmtData?.selected && docMgmtData?.permissions?.checklist?.selected) {
        return true;
      }
      
      // Check for standalone checklist permission
      const checklistData = permissions['checklist'];
      if (checklistData?.selected) {
        return true;
      }
      
      // Check for checklist permission in settings
      const settingsData = permissions['settings'];
      if (settingsData?.selected && settingsData?.permissions?.checklist?.selected) {
        return true;
      }
    }

    // Debug logging for approval permissions specifically
    if (module === 'approvals') {
      console.log('Checking approval permissions for:', currentUser.username);
      console.log('Current permissions object:', permissions);
      console.log('Looking for approval permission key in permissions');
    }

    // Special case for Tender Manager role (role ID 11)
    // Hard-coded permissions for Tender Manager for specific modules they need to access
    const roleId = parseInt(String(currentUser.role || '0'), 10);
    if (roleId === 11) {
      // Modules that a Tender Manager should see based on requirements
      const tenderManagerModules = [
        'salesDashboard', 'tender', 'tenderResults', 'tenderTask', 
        'folders', 'briefCase', 'approvals', 'addNewTender'
      ];
      
      if (tenderManagerModules.includes(module)) {
        // Use our utility function to log only once
        logOnce(
          `tender-manager-${module}`, 
          `Granting permission for Tender Manager to module: ${module}`
        );
        return true;
      }
    }

    // Defensive programming - handle potential undefined
    if (!permissions) {
      return false;
    }

    // Map frontend module name to the permission key in the database
    // First find the permission key that maps to this module
    let permissionKey = module;
    
    // Look through the reverse mapping to find the key
    for (const [key, value] of Object.entries(permissionKeyMapping)) {
      if (value === module) {
        permissionKey = key;
        break;
      }
    }
    
    // Now check if this permission key exists in the permissions object
    const moduleData = permissions[permissionKey];
    if (!moduleData) {
      // Use our utility function to warn only once
      warnOnce(
        `perm-missing-${permissionKey}`,
        `Permission key ${permissionKey} not found in permissions`
      );
      return false;
    }

    // First check if the module itself is selected
    if (moduleData.selected !== true) {
      // Use our utility function to warn only once
      warnOnce(
        `perm-not-selected-${permissionKey}`,
        `Permission ${permissionKey} is not selected in user permissions`
      );
      return false;
    }

    // If no specific action is required, the module being selected is enough
    if (!action) {
      return true;
    }

    // Check if the specific action is permitted
    if (moduleData.permissions && moduleData.permissions[action]) {
      // Check if the action has a selected property
      if (typeof moduleData.permissions[action].selected === 'boolean') {
        return moduleData.permissions[action].selected === true;
      }
      // If no selected property exists, assume the presence of the action means it's allowed
      return true;
    }

    // Special case for modules with simple structure
    // Let's be more defensive about potentially undefined or falsy values
    try {
      return !!moduleData[action];
    } catch (e) {
      // If there's any issue with checking the action, fail safe for Finance module
      if (module === 'finance') {
        return true; // Always allow finance actions
      }
      return false;
    }
  };

  return (
    <PermissionsContext.Provider value={{ permissions, isLoading, error, hasPermission }}>
      {children}
    </PermissionsContext.Provider>
  );
}

// Custom hook to use the permissions context
export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}