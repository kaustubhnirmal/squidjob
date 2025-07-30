import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Pencil, Users, X, Loader2, UserCheck, Check, Settings } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/user-context";

// Type definitions based on our schema
interface Role {
  id: number;
  name: string;
  createdBy: string;
  createdAt: Date;
  status: string;
}

interface RolePermission {
  id: number;
  roleId: number;
  permissions: Record<string, any>;
  updatedBy: string;
  updatedAt: Date;
}

export function RoleSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRightsModalOpen, setIsRightsModalOpen] = useState(false);
  const [isAssignRightsModalOpen, setIsAssignRightsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  // Get current user from context
  const { currentUser } = useUser();
  
  const [newRole, setNewRole] = useState({ 
    name: "",
    status: "Active",
    createdBy: currentUser?.username || "System" // Use current user's username
  });
  
  // Fetch roles from API
  const { 
    data: roles = [], 
    isLoading: isLoadingRoles,
    error: rolesError
  } = useQuery<Role[]>({
    queryKey: ['/api/roles'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch users for assigning rights
  const {
    data: users = [],
    isLoading: isLoadingUsers
  } = useQuery<any[]>({
    queryKey: ['/api/users'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Define module permissions structure
  const [modulePermissions, setModulePermissions] = useState<ModulePermissions>({
    addNewTender: { selected: false },
    tenderTask: {
      selected: false,
      permissions: {
        requestToFinanceTeam: { selected: false },
        assignToTeam: { selected: false },
        kickOfCall: { selected: false },
        requestForApproval: { selected: false },
        startBidding: { selected: false },
        tenderStatus: { selected: false },
        uploadDocument: { selected: false }
      }
    },
    oem: {
      selected: false,
      permissions: {
        create: { selected: false },
        edit: { selected: false },
        delete: { selected: false },
        updateStatus: { selected: false }
      }
    },
    dealers: {
      selected: false,
      permissions: {
        create: { selected: false },
        edit: { selected: false },
        delete: { selected: false }
      }
    },
    mis: {
      selected: false,
      permissions: {
        financeMisReport: { selected: false }
      }
    },
    utility: {
      selected: false,
      permissions: {
        bulkTenderUpload: { selected: false }
      }
    },
    profile: {
      selected: false,
      permissions: {
        addProfile: { selected: false },
        editProfile: { selected: false },
        addUser: { selected: false },
        deleteProfile: { selected: false }
      }
    },
    analytics: {
      selected: false,
      permissions: {
        companyProfile: { selected: false },
        misReport: { selected: false },
        competitors: { selected: false },
        comparison: { selected: false },
        tenderResult: { selected: false }
      }
    },
    salesDashboard: { selected: false },
    financeDashboard: { selected: false },
    tender: { selected: false },
    tenderResult: { selected: false },
    finance: {
      selected: false,
      permissions: {
        approvalSelf: { selected: false },
        updatePaymentDetails: { selected: false },
        reassign: { selected: false }
      }
    },
    folders: {
      selected: false,
      permissions: {
        createFolder: { selected: false },
        deleteFolder: { selected: false },
        renameFolder: { selected: false }
      }
    },
    briefCase: {
      selected: false,
      permissions: {
        addNewFile: { selected: false },
        editFile: { selected: false },
        deleteFile: { selected: false }
      }
    },
    approvals: {
      selected: false,
      permissions: {
        financeApproval: { selected: false },
        tenderApproval: { selected: false }
      }
    },
    userMaster: {
      selected: false,
      permissions: {
        create: { selected: false },
        edit: { selected: false },
        delete: { selected: false },
        changePassword: { selected: false }
      }
    },
    department: {
      selected: false,
      permissions: {
        create: { selected: false },
        edit: { selected: false },
        delete: { selected: false }
      }
    },
    designation: {
      selected: false,
      permissions: {
        create: { selected: false },
        edit: { selected: false },
        delete: { selected: false }
      }
    },
    role: {
      selected: false,
      permissions: {
        create: { selected: false },
        edit: { selected: false },
        delete: { selected: false },
        assignEditRights: { selected: false }
      }
    }
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  // Only show roles created by the currently logged-in user
  const userFilteredRoles = roles.filter(role => 
    // Filter out roles created by "Kaustubh Nirmal"
    !role.createdBy.includes("Kaustubh Nirmal")
  );
  
  const totalPages = Math.ceil(userFilteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, userFilteredRoles.length);
  
  const filteredRoles = userFilteredRoles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const paginatedRoles = filteredRoles.slice(startIndex, endIndex);
  
  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (role: { name: string; status: string; createdBy: string }) => {
      const response = await apiRequest("POST", "/api/roles", role);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setNewRole({ 
        name: "", 
        status: "Active", 
        createdBy: currentUser?.name || "System" 
      });
      setIsAddModalOpen(false);
      toast({
        title: "Success",
        description: "Role added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create role",
        variant: "destructive",
      });
    },
  });

  const handleAddRole = () => {
    if (newRole.name.trim() === "") {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }
    
    createRoleMutation.mutate(newRole);
  };
  
  interface Role {
    id: number;
    name: string;
    createdBy: string;
    createdDate: string;
    status: string;
  }

  // Permission interfaces to fix TypeScript errors
  interface PermissionItem {
    selected: boolean;
  }

  interface PermissionsObject {
    [key: string]: PermissionItem;
  }

  interface ModuleItem {
    selected: boolean;
    permissions?: PermissionsObject;
  }

  interface ModulePermissions {
    [key: string]: ModuleItem;
  }
  
  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  
  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setIsEditModalOpen(true);
  };
  
  const handleUpdateRole = () => {
    if (!editingRole) return;
    
    updateRoleMutation.mutate({
      id: editingRole.id,
      data: {
        name: editingRole.name,
        status: editingRole.status
      }
    });
    
    setIsEditModalOpen(false);
    setEditingRole(null);
  };
  
  const handleDeleteRole = (role: Role) => {
    // In a real app, this would confirm before deleting
    toast({
      title: "Delete Role",
      description: `Deleting role: ${role.name}`,
    });
  };
  
  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Role> }) => {
      const response = await apiRequest("PUT", `/api/roles/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    },
  });
  
  // Save permissions mutation
  const savePermissionsMutation = useMutation({
    mutationFn: async ({ roleId, permissions, updatedBy }: { 
      roleId: number, 
      permissions: any,
      updatedBy: string 
    }) => {
      const response = await apiRequest("POST", `/api/roles/${roleId}/permissions`, {
        permissions,
        updatedBy
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success", 
        description: "Role permissions updated successfully"
      });
      setIsRightsModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update permissions",
        variant: "destructive",
      });
    }
  });
  
  // Define the mutation for assigning roles to users
  const assignRoleToUsersMutation = useMutation({
    mutationFn: async ({ roleId, userIds, updatedBy }: {
      roleId: number,
      userIds: number[],
      updatedBy: string
    }) => {
      const response = await apiRequest("POST", `/api/roles/${roleId}/assign`, {
        userIds,
        updatedBy
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role assigned to selected users successfully"
      });
      setIsAssignRightsModalOpen(false);
      setSelectedUsers([]);
      // Invalidate users query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign role to users",
        variant: "destructive",
      });
    }
  });
  
  // Initialize default permissions with the correct structure that matches the component
  const getDefaultPermissions = () => {
    // Create a complete default structure that matches our initial state
    const defaultState = {
      addNewTender: { selected: false },
      tenderTask: {
        selected: false,
        permissions: {
          requestToFinanceTeam: { selected: false },
          assignToTeam: { selected: false },
          kickOfCall: { selected: false },
          requestForApproval: { selected: false },
          startBidding: { selected: false },
          tenderStatus: { selected: false },
          uploadDocument: { selected: false }
        }
      },
      oem: {
        selected: false,
        permissions: {
          create: { selected: false },
          edit: { selected: false },
          delete: { selected: false },
          updateStatus: { selected: false }
        }
      },
      dealers: {
        selected: false,
        permissions: {
          create: { selected: false },
          edit: { selected: false },
          delete: { selected: false }
        }
      },
      mis: {
        selected: false,
        permissions: {
          financeMisReport: { selected: false }
        }
      },
      utility: {
        selected: false,
        permissions: {
          bulkTenderUpload: { selected: false }
        }
      },
      profile: {
        selected: false,
        permissions: {
          addProfile: { selected: false },
          editProfile: { selected: false },
          addUser: { selected: false },
          deleteProfile: { selected: false }
        }
      },
      analytics: {
        selected: false,
        permissions: {
          companyProfile: { selected: false },
          misReport: { selected: false },
          competitors: { selected: false },
          comparison: { selected: false },
          tenderResult: { selected: false }
        }
      },
      salesDashboard: { selected: false },
      financeDashboard: { selected: false },
      tender: { selected: false },
      tenderResult: { selected: false },
      finance: {
        selected: false,
        permissions: {
          approvalSelf: { selected: false },
          updatePaymentDetails: { selected: false },
          reassign: { selected: false },
          emdPayment: { selected: false },
          securityDeposit: { selected: false },
          bankGuarantee: { selected: false }
        }
      },
      folders: {
        selected: false,
        permissions: {
          createFolder: { selected: false },
          deleteFolder: { selected: false },
          renameFolder: { selected: false }
        }
      },
      briefCase: {
        selected: false,
        permissions: {
          addNewFile: { selected: false },
          editFile: { selected: false },
          deleteFile: { selected: false }
        }
      },
      approvals: {
        selected: false,
        permissions: {
          financeApproval: { selected: false },
          tenderApproval: { selected: false }
        }
      },
      userMaster: {
        selected: false,
        permissions: {
          create: { selected: false },
          edit: { selected: false },
          delete: { selected: false },
          changePassword: { selected: false }
        }
      },
      department: {
        selected: false,
        permissions: {
          create: { selected: false },
          edit: { selected: false },
          delete: { selected: false }
        }
      },
      designation: {
        selected: false,
        permissions: {
          create: { selected: false },
          edit: { selected: false },
          delete: { selected: false }
        }
      },
      role: {
        selected: false,
        permissions: {
          create: { selected: false },
          edit: { selected: false },
          delete: { selected: false },
          assignEditRights: { selected: false }
        }
      }
    };
    
    // Return a fresh copy to avoid any reference issues
    return JSON.parse(JSON.stringify(defaultState));
  };

  // Safer accessor for module permissions 
  // This will be used for all permission accesses throughout the component
  const getModulePermission = (moduleKey: string): { selected: boolean; permissions?: Record<string, { selected: boolean }> } => {
    if (!modulePermissions[moduleKey]) {
      return { selected: false };
    }
    return modulePermissions[moduleKey];
  };
  
  // Safer accessor for permission values
  const getPermissionValue = (moduleKey: string, permissionKey?: string): boolean => {
    const module = getModulePermission(moduleKey);
    
    // If no specific permission key, return the module's selected state
    if (!permissionKey) {
      return !!module.selected;
    }
    
    // Safely check if permissions object exists and if the specific permission exists
    if (!module.permissions || !module.permissions[permissionKey]) {
      return false;
    }
    
    return !!module.permissions[permissionKey].selected;
  };
  
  // Function to safely check if a permission exists and if it's selected
  const isPermissionSelected = (module: string, permission?: string): boolean => {
    return getPermissionValue(module, permission);
  };
  
  // Function to safely update a permission
  const safeUpdatePermission = (
    originalPermissions: ModulePermissions,
    moduleKey: string,
    permissionKey: string | undefined,
    value: boolean
  ): ModulePermissions => {
    const newPermissions = { ...originalPermissions };
    
    // Ensure the module exists
    if (!newPermissions[moduleKey]) {
      newPermissions[moduleKey] = { selected: false };
    }
    
    // If no specific permission, just set the module's selected state
    if (!permissionKey) {
      newPermissions[moduleKey].selected = value;
      return newPermissions;
    }
    
    // Ensure the permissions object exists
    const module = newPermissions[moduleKey];
    if (!module.permissions) {
      // Create a new object with both the original properties and a new permissions object
      newPermissions[moduleKey] = {
        ...module,
        permissions: {}
      };
    }
    
    // Now safely set the permission value
    // Use type assertion to help TypeScript understand the structure
    const typedModule = newPermissions[moduleKey] as { 
      selected: boolean; 
      permissions: Record<string, { selected: boolean }> 
    };
    
    typedModule.permissions[permissionKey] = { selected: value };
    
    return newPermissions;
  };
  
  // Function to update a module and all its child permissions
  const safeUpdateModuleWithChildren = (
    permissions: ModulePermissions,
    moduleKey: string,
    value: boolean
  ): ModulePermissions => {
    // First ensure the permissions structure is valid
    let newPermissions = ensurePermissionsExist({...permissions});
    
    // Update the module-level permission
    newPermissions = safeUpdatePermission(newPermissions, moduleKey, undefined, value);
    
    // Get default permissions to know what child permissions exist for this module
    const defaultPerms = getDefaultPermissions();
    const defaultModule = defaultPerms[moduleKey as keyof typeof defaultPerms];
    
    // Check if this module has child permissions that need to be updated
    if (defaultModule && 
        typeof defaultModule === 'object' && 
        'permissions' in defaultModule &&
        defaultModule.permissions) {
      
      // Type assertion to safely work with the permissions object
      const defaultModuleWithPermissions = defaultModule as { 
        selected: boolean;
        permissions: Record<string, { selected: boolean }> 
      };
      
      // Iterate over all child permissions and update them
      Object.keys(defaultModuleWithPermissions.permissions).forEach(permKey => {
        newPermissions = safeUpdatePermission(
          newPermissions,
          moduleKey,
          permKey,
          value
        );
      });
    }
    
    return newPermissions;
  };

  // Function to ensure all required permission objects exist to prevent undefined errors
  // This is a critical function that ensures we don't access undefined properties
  const ensurePermissionsExist = (permissions: ModulePermissions): ModulePermissions => {
    // Create a deep copy of permissions to avoid any reference issues
    const result: ModulePermissions = JSON.parse(JSON.stringify(permissions));
    
    // Get the structure from our initial state to ensure all modules and permissions are properly defined
    const initialState = {
      addNewTender: { selected: false },
      tenderTask: {
        selected: false,
        permissions: {
          requestToFinanceTeam: { selected: false },
          assignToTeam: { selected: false },
          kickOfCall: { selected: false },
          requestForApproval: { selected: false },
          startBidding: { selected: false },
          tenderStatus: { selected: false },
          uploadDocument: { selected: false }
        }
      },
      oem: {
        selected: false,
        permissions: {
          create: { selected: false },
          edit: { selected: false },
          delete: { selected: false },
          updateStatus: { selected: false }
        }
      },
      dealers: {
        selected: false,
        permissions: {
          create: { selected: false },
          edit: { selected: false },
          delete: { selected: false }
        }
      },
      mis: {
        selected: false,
        permissions: {
          financeMisReport: { selected: false }
        }
      },
      utility: {
        selected: false,
        permissions: {
          bulkTenderUpload: { selected: false }
        }
      },
      profile: {
        selected: false,
        permissions: {
          addProfile: { selected: false },
          editProfile: { selected: false },
          addUser: { selected: false },
          deleteProfile: { selected: false }
        }
      },
      analytics: {
        selected: false,
        permissions: {
          companyProfile: { selected: false },
          misReport: { selected: false },
          competitors: { selected: false },
          comparison: { selected: false },
          tenderResult: { selected: false }
        }
      },
      salesDashboard: { selected: false },
      financeDashboard: { selected: false },
      tender: { selected: false },
      tenderResult: { selected: false },
      finance: {
        selected: false,
        permissions: {
          approvalSelf: { selected: false },
          updatePaymentDetails: { selected: false },
          reassign: { selected: false }
        }
      },
      folders: {
        selected: false,
        permissions: {
          createFolder: { selected: false },
          deleteFolder: { selected: false },
          renameFolder: { selected: false }
        }
      },
      briefCase: {
        selected: false,
        permissions: {
          addNewFile: { selected: false },
          editFile: { selected: false },
          deleteFile: { selected: false }
        }
      },
      approvals: {
        selected: false,
        permissions: {
          financeApproval: { selected: false },
          tenderApproval: { selected: false }
        }
      },
      userMaster: {
        selected: false,
        permissions: {
          create: { selected: false },
          edit: { selected: false },
          delete: { selected: false },
          changePassword: { selected: false }
        }
      },
      department: {
        selected: false,
        permissions: {
          create: { selected: false },
          edit: { selected: false },
          delete: { selected: false }
        }
      },
      designation: {
        selected: false,
        permissions: {
          create: { selected: false },
          edit: { selected: false },
          delete: { selected: false }
        }
      },
      role: {
        selected: false,
        permissions: {
          create: { selected: false },
          edit: { selected: false },
          delete: { selected: false },
          assignEditRights: { selected: false }
        }
      }
    };
    
    // For each module in the initial state, ensure it exists in the result
    Object.keys(initialState).forEach(moduleKey => {
      const initialModule = (initialState as any)[moduleKey];
      
      // If module doesn't exist in result, add it with default values
      if (!result[moduleKey]) {
        result[moduleKey] = { selected: false };
      }
      
      // If the module has permissions in the initial state
      if (initialModule && initialModule.permissions) {
        // Make sure permissions object exists
        if (!result[moduleKey].permissions) {
          result[moduleKey].permissions = {};
        }
        
        // For each permission in the module, ensure it exists in the result
        Object.keys(initialModule.permissions).forEach(permKey => {
          if (!result[moduleKey].permissions) {
            result[moduleKey].permissions = {};
          }
          
          if (!result[moduleKey].permissions![permKey]) {
            result[moduleKey].permissions![permKey] = { selected: false };
          }
        });
      }
    });
    
    return result;
  };

  // Fetch permissions when a role is selected
  useEffect(() => {
    if (selectedRole) {
      // First, reset to default permissions
      setModulePermissions(getDefaultPermissions());
      
      // Then fetch the permissions for the selected role
      const fetchPermissions = async () => {
        try {
          const response = await fetch(`/api/roles/${selectedRole.id}/permissions`);
          const data = await response.json();
          
          // If permissions exist, set them, otherwise keep the defaults
          if (data && data.permissions && Object.keys(data.permissions).length > 0) {
            // Ensure all required permission objects exist
            const safePermissions = ensurePermissionsExist(data.permissions);
            setModulePermissions(safePermissions);
          }
        } catch (error) {
          console.error("Error fetching permissions:", error);
        }
      };
      
      fetchPermissions();
    }
  }, [selectedRole]);

  const handleStatusToggle = (role: Role) => {
    const newStatus = role.status === "Active" ? "Inactive" : "Active";
    updateRoleMutation.mutate({ 
      id: role.id, 
      data: { status: newStatus } 
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Role Management</h2>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddModalOpen(true)}>
          <span className="mr-1">+</span> Add New Role
        </Button>
      </div>
      
      <div className="bg-white rounded-md shadow">
        <div className="p-4">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">#</TableHead>
                <TableHead>ROLE NAME</TableHead>
                <TableHead>CREATED BY</TableHead>
                <TableHead>CREATED DATE & TIME</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="text-right">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRoles.map((role, index) => (
                <TableRow key={role.id}>
                  <TableCell className="text-center">{startIndex + index + 1}</TableCell>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.createdBy}</TableCell>
                  <TableCell>{role.createdDate}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      role.status === "Active" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {role.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditRole(role)}
                        className="text-blue-500"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleStatusToggle(role)}
                        className="text-green-500"
                        title={role.status === "Active" ? "Deactivate" : "Activate"}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setSelectedRole(role);
                          setIsAssignRightsModalOpen(true);
                        }}
                        className="flex items-center justify-center w-7 h-7 bg-gray-800 hover:bg-gray-900 rounded-full cursor-pointer text-white"
                        title="Assign/Edit Rights"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-8 w-16 rounded-md border border-input bg-background px-2"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {Math.max(1, totalPages)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Previous Page</span>
              Prev
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className={currentPage === 1 ? "bg-blue-100 text-blue-800" : ""}
            >
              1
            </Button>
            
            {totalPages > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(2)}
                className={currentPage === 2 ? "bg-blue-100 text-blue-800" : ""}
              >
                2
              </Button>
            )}
            
            {/* Show ellipsis for more pages */}
            {totalPages > 2 && currentPage > 3 && <span>...</span>}
            
            {/* Show current page if it's not 1 or 2 or last */}
            {currentPage > 2 && currentPage < totalPages && (
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-100 text-blue-800"
              >
                {currentPage}
              </Button>
            )}
            
            {totalPages > 3 && currentPage < totalPages - 1 && <span>...</span>}
            
            {totalPages > 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                className={currentPage === totalPages ? "bg-blue-100 text-blue-800" : ""}
              >
                {totalPages}
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
            >
              <span className="sr-only">Next Page</span>
              Next
            </Button>
          </div>
        </div>
      </div>
      
      {/* Add Role Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 m-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Role</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="role-name">Role Name</Label>
                <Input 
                  id="role-name" 
                  placeholder="Enter role name" 
                  value={newRole.name}
                  onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="role-status">Status</Label>
                <select 
                  id="role-status" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newRole.status}
                  onChange={(e) => setNewRole({...newRole, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRole}>
                  Add Role
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Role Modal */}
      {isEditModalOpen && editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 m-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Role</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-role-name">Role Name</Label>
                <Input 
                  id="edit-role-name" 
                  placeholder="Enter role name" 
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({...editingRole, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-role-status">Status</Label>
                <select 
                  id="edit-role-status" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editingRole.status}
                  onChange={(e) => setEditingRole({...editingRole, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateRole}>
                  Update Role
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role & Rights Management Modal */}
      {isRightsModalOpen && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Role & Rights Management</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsRightsModalOpen(false)}
                className="hover:bg-gray-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Assign/Edit Rights Modal - For second image implementation */}
      {isAssignRightsModalOpen && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                Role & Rights Management
              </h3>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsAssignRightsModalOpen(false)}
                className="text-gray-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex h-[calc(90vh-4rem)] overflow-hidden">
              {/* Left side - Role list */}
              <div className="w-1/3 border-r overflow-hidden flex flex-col">
                <div className="p-4 border-b">
                  <h4 className="font-medium">Role</h4>
                </div>
                <div className="overflow-y-auto flex-grow">
                  <Table>
                    <TableHeader className="bg-[#0076a8]">
                      <TableRow>
                        <TableHead className="text-white text-center w-12">#</TableHead>
                        <TableHead className="text-white">ROLE NAME</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRoles.map((role, index) => (
                        <TableRow 
                          key={role.id} 
                          className={`hover:bg-gray-100 cursor-pointer ${selectedRole.id === role.id ? 'bg-blue-50' : ''}`}
                          onClick={() => setSelectedRole(role)}
                        >
                          <TableCell className="text-center">{startIndex + index + 1}</TableCell>
                          <TableCell>{role.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="p-2 border-t flex justify-between items-center">
                  <div>
                    <select
                      className="border rounded p-1 text-sm"
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    >
                      <option value="10">Show 10</option>
                      <option value="25">Show 25</option>
                      <option value="50">Show 50</option>
                    </select>
                  </div>
                  <div className="text-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              </div>
              
              {/* Right side - Permissions section */}
              <div className="w-2/3 overflow-y-auto bg-white p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Module</h4>
                  <div className="flex items-center">
                    <Checkbox 
                      id="select-all-modules" 
                      className="mr-2"
                      checked={Object.values(modulePermissions).every(p => p.selected)}
                      onCheckedChange={(checked) => {
                        // Update all module permissions
                        const newPermissions = {...modulePermissions};
                        Object.keys(newPermissions).forEach(key => {
                          // Don't select Analytics and Utility
                          if (key !== 'analytics' && key !== 'utility') {
                            newPermissions[key].selected = !!checked;
                          }
                        });
                        setModulePermissions(newPermissions);
                      }}
                    />
                    <Label htmlFor="select-all-modules">Select All</Label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {/* Sales Dashboard */}
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="module-sales-dashboard" 
                        className="mr-2"
                        checked={getPermissionValue('salesDashboard', undefined)}
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdateModuleWithChildren(modulePermissions, 'salesDashboard', !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="module-sales-dashboard">Sales Dashboard</Label>
                    </div>
                  </div>
                  
                  {/* Finance Dashboard */}
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="module-finance-dashboard" 
                        className="mr-2"
                        checked={getPermissionValue('financeDashboard', undefined)}
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdateModuleWithChildren(modulePermissions, 'financeDashboard', !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="module-finance-dashboard">Finance Dashboard</Label>
                    </div>
                  </div>
                  
                  {/* Tender */}
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="module-tender" 
                        className="mr-2"
                        checked={getPermissionValue('tender', undefined)}
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdateModuleWithChildren(modulePermissions, 'tender', !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="module-tender">Tender</Label>
                    </div>
                  </div>
                  
                  {/* Tender Result */}
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="module-tender-result" 
                        className="mr-2"
                        checked={getPermissionValue('tenderResult', undefined)}
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdateModuleWithChildren(modulePermissions, 'tenderResult', !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="module-tender-result">Tender Result</Label>
                    </div>
                  </div>
                  
                  {/* Tender Task */}
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="module-tender-task" 
                        className="mr-2"
                        checked={getPermissionValue('tenderTask', undefined)}
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdateModuleWithChildren(modulePermissions, 'tenderTask', !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="module-tender-task">Tender Task</Label>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 pl-6 mt-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="tender-task-request-finance" 
                          className="mr-2"
                          checked={getPermissionValue('tenderTask', 'requestToFinanceTeam')}
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'tenderTask', 'requestToFinanceTeam', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="tender-task-request-finance" className="text-sm">Request To Finance Team</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="tender-task-assign-team" 
                          className="mr-2"
                          checked={getPermissionValue('tenderTask', 'assignToTeam')}
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'tenderTask', 'assignToTeam', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="tender-task-assign-team" className="text-sm">Assign To Team</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="tender-task-kick-off" 
                          className="mr-2"
                          checked={getPermissionValue('tenderTask', 'kickOfCall')}
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'tenderTask', 'kickOfCall', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="tender-task-kick-off" className="text-sm">Kick Off Call</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="tender-task-request-approval" 
                          className="mr-2"
                          checked={getPermissionValue('tenderTask', 'requestForApproval')}
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'tenderTask', 'requestForApproval', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="tender-task-request-approval" className="text-sm">Request For Approval</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="tender-task-start-bidding" 
                          className="mr-2"
                          checked={getPermissionValue('tenderTask', 'startBidding')}
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'tenderTask', 'startBidding', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="tender-task-start-bidding" className="text-sm">Start Bidding</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="tender-task-tender-status" 
                          className="mr-2"
                          checked={getPermissionValue('tenderTask', 'tenderStatus')}
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'tenderTask', 'tenderStatus', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="tender-task-tender-status" className="text-sm">Tender Status</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="tender-task-upload-doc" 
                          className="mr-2"
                          checked={getPermissionValue('tenderTask', 'uploadDocument')}
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'tenderTask', 'uploadDocument', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="tender-task-upload-doc" className="text-sm">Upload Document</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Finance */}
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="module-finance" 
                        className="mr-2"
                        checked={getPermissionValue('finance', undefined)}
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdateModuleWithChildren(modulePermissions, 'finance', !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="module-finance">Finance</Label>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 pl-6 mt-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="finance-approve-self" 
                          className="mr-2"
                          checked={getPermissionValue('finance', 'approveSelf')}
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'finance', 'approveSelf', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="finance-approve-self" className="text-sm">Approve Self</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="finance-update-payment" 
                          className="mr-2"
                          checked={getPermissionValue('finance', 'updatePaymentDetails')}
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'finance', 'updatePaymentDetails', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="finance-update-payment" className="text-sm">Update Payment Details</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="finance-reassign" 
                          className="mr-2"
                          checked={getPermissionValue('finance', 'reassign')}
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'finance', 'reassign', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="finance-reassign" className="text-sm">Reassign</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Folders */}
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="module-folders" 
                        className="mr-2"
                        checked={getPermissionValue('folders', undefined)}
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdateModuleWithChildren(modulePermissions, 'folders', !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="module-folders">Folders</Label>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 pl-6 mt-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="folders-create" 
                          className="mr-2"
                          checked={getPermissionValue('folders', 'createFolder')}
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'folders', 'createFolder', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="folders-create" className="text-sm">Create Folder</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="folders-delete" 
                          className="mr-2"
                          checked={getPermissionValue('folders', 'deleteFolder')}
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'folders', 'deleteFolder', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="folders-delete" className="text-sm">Delete Folder</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="folders-rename" 
                          className="mr-2"
                          checked={getPermissionValue('folders', 'renameFolder')}
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'folders', 'renameFolder', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="folders-rename" className="text-sm">Rename Folder</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Brief Case */}
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="module-brief-case" 
                        className="mr-2"
                        checked={getPermissionValue('briefCase', undefined)}
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdateModuleWithChildren(modulePermissions, 'briefCase', !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="module-brief-case">Brief Case</Label>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 pl-6 mt-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="brief-case-add-file" 
                          className="mr-2"
                          checked={getPermissionValue('briefCase', 'addNewFile')}
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'briefCase', 'addNewFile', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="brief-case-add-file" className="text-sm">Add New File</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="brief-case-edit-file" 
                          className="mr-2"
                          checked={getPermissionValue('briefCase', 'editFile')}
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'briefCase', 'editFile', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="brief-case-edit-file" className="text-sm">Edit File</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="brief-case-delete-file" 
                          className="mr-2"
                          checked={getPermissionValue('briefCase', 'deleteFile')}
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'briefCase', 'deleteFile', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="brief-case-delete-file" className="text-sm">Delete File</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Approvals */}
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="module-approvals" 
                        className="mr-2"
                        checked={getPermissionValue('approvals', undefined)}
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdateModuleWithChildren(modulePermissions, 'approvals', !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="module-approvals">Approvals</Label>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 pl-6 mt-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="approvals-finance" 
                          className="mr-2"
                          checked={getPermissionValue('approvals', 'financeApproval')}
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'approvals', 'financeApproval', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="approvals-finance" className="text-sm">Finance Approval</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="approvals-tender" 
                          className="mr-2"
                          checked={getPermissionValue('approvals', 'tenderApproval')}
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'approvals', 'tenderApproval', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="approvals-tender" className="text-sm">Tender Approval</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* User Master */}
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="module-user-master" 
                        className="mr-2"
                        checked={getPermissionValue('userMaster', undefined)}
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdateModuleWithChildren(modulePermissions, 'userMaster', !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="module-user-master">User Master</Label>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 pl-6 mt-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="user-master-create" 
                          className="mr-2"
                          checked={getPermissionValue('userMaster', 'create')}
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'userMaster', 'create', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="user-master-create" className="text-sm">Create</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="user-master-edit" 
                          className="mr-2"
                          checked={getPermissionValue('userMaster', 'edit')}
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'userMaster', 'edit', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="user-master-edit" className="text-sm">Edit</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="user-master-delete" 
                          className="mr-2"
                          checked={getPermissionValue('userMaster', 'delete')}
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'userMaster', 'delete', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="user-master-delete" className="text-sm">Delete</Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6 space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAssignRightsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-[#0076a8] hover:bg-[#00608a]"
                    onClick={() => {
                      if (selectedRole) {
                        updateRolePermissionsMutation.mutate({
                          roleId: selectedRole.id,
                          permissions: modulePermissions,
                          updatedBy: currentUser?.username || "System"
                        });
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Original Rights Modal */}
      {false && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Role & Rights Management</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsRightsModalOpen(false)}
                className="hover:bg-gray-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="select-all" 
                    className="mr-2"
                    checked={Object.keys(modulePermissions).every(module => isPermissionSelected(module))}
                    onCheckedChange={(checked) => {
                      // Create a safe copy of permissions to work with
                      let newPermissions = ensurePermissionsExist({...modulePermissions});
                      const defaultPerms = getDefaultPermissions();
                      
                      // First, update all top-level module selections
                      Object.keys(defaultPerms).forEach(module => {
                        // Update the module's selected status
                        newPermissions = safeUpdatePermission(newPermissions, module, undefined, !!checked);
                        
                        // Check if this module has child permissions to update
                        const defaultModule = defaultPerms[module];
                        const hasPermissions = defaultModule && 
                                              typeof defaultModule === 'object' && 
                                              'permissions' in defaultModule;
                        
                        if (hasPermissions) {
                          // Get all child permissions for this module from the default structure
                          const defaultModuleTyped = defaultModule as { 
                            selected: boolean; 
                            permissions: Record<string, { selected: boolean }> 
                          };
                          
                          // Update each child permission
                          Object.keys(defaultModuleTyped.permissions).forEach(permName => {
                            newPermissions = safeUpdatePermission(
                              newPermissions, 
                              module, 
                              permName, 
                              !!checked
                            );
                          });
                        }
                      });
                      
                      setModulePermissions(newPermissions);
                    }}
                  />
                  <Label htmlFor="select-all" className="text-sm font-semibold">Select All</Label>
                </div>
              </div>

              <div className="border rounded-md">
                <div className="p-4 border-b">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Label htmlFor="module" className="font-semibold w-32">Module</Label>
                    </div>
                    <div>
                      <Label htmlFor="actions" className="font-semibold">Actions</Label>
                    </div>
                  </div>
                </div>

                {/* Sales Dashboard */}
                <div className="p-4 border-b">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Checkbox 
                        id="sales-dashboard" 
                        className="mr-2"
                        checked={isPermissionSelected('salesDashboard')} 
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdatePermission(modulePermissions, 'salesDashboard', undefined, !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="sales-dashboard">Sales Dashboard</Label>
                    </div>
                  </div>
                </div>

                {/* Finance Dashboard */}
                <div className="p-4 border-b">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Checkbox 
                        id="finance-dashboard" 
                        className="mr-2"
                        checked={isPermissionSelected('financeDashboard')} 
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdatePermission(modulePermissions, 'financeDashboard', undefined, !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="finance-dashboard">Finance Dashboard</Label>
                    </div>
                  </div>
                </div>

                {/* Tender */}
                <div className="p-4 border-b">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Checkbox 
                        id="tender" 
                        className="mr-2"
                        checked={isPermissionSelected('tender')} 
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdatePermission(modulePermissions, 'tender', undefined, !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="tender">Tender</Label>
                    </div>
                  </div>
                </div>

                {/* Tender Result */}
                <div className="p-4 border-b">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Checkbox 
                        id="tender-result" 
                        className="mr-2"
                        checked={isPermissionSelected('tenderResult')} 
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdatePermission(modulePermissions, 'tenderResult', undefined, !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="tender-result">Tender Result</Label>
                    </div>
                  </div>
                </div>

                {/* Tender Task */}
                <div className="p-4 border-b">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Checkbox 
                        id="tender-task" 
                        className="mr-2"
                        checked={isPermissionSelected('tenderTask')} 
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdateModuleWithChildren(modulePermissions, 'tenderTask', !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="tender-task">Tender Task</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="request-to-finance" 
                          className="mr-2"
                          checked={isPermissionSelected('tenderTask', 'requestToFinanceTeam')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'tenderTask', 'requestToFinanceTeam', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="request-to-finance" className="text-sm">Request To FinanceTeam</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="assign-to-team" 
                          className="mr-2"
                          checked={isPermissionSelected('tenderTask', 'assignToTeam')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'tenderTask', 'assignToTeam', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="assign-to-team" className="text-sm">Assign To Team</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="kick-of-call" 
                          className="mr-2"
                          checked={isPermissionSelected('tenderTask', 'kickOfCall')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'tenderTask', 'kickOfCall', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="kick-of-call" className="text-sm">Kick Of Call</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="request-for-approval" 
                          className="mr-2"
                          checked={isPermissionSelected('tenderTask', 'requestForApproval')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'tenderTask', 'requestForApproval', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="request-for-approval" className="text-sm">Request For Approval</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="start-bidding" 
                          className="mr-2"
                          checked={isPermissionSelected('tenderTask', 'startBidding')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'tenderTask', 'startBidding', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="start-bidding" className="text-sm">Start Bidding</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="tender-status" 
                          className="mr-2"
                          checked={isPermissionSelected('tenderTask', 'tenderStatus')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'tenderTask', 'tenderStatus', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="tender-status" className="text-sm">Tender Status</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="upload-document" 
                          className="mr-2"
                          checked={isPermissionSelected('tenderTask', 'uploadDocument')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'tenderTask', 'uploadDocument', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="upload-document" className="text-sm">Upload Document</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Finance */}
                <div className="p-4 border-b">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Checkbox 
                        id="finance" 
                        className="mr-2"
                        checked={isPermissionSelected('finance')} 
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdateModuleWithChildren(modulePermissions, 'finance', !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="finance">Finance</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="approval-self" 
                          className="mr-2"
                          checked={isPermissionSelected('finance', 'approvalSelf')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'finance', 'approvalSelf', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="approval-self" className="text-sm">Approval Self</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="update-payment-details" 
                          className="mr-2"
                          checked={isPermissionSelected('finance', 'updatePaymentDetails')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'finance', 'updatePaymentDetails', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="update-payment-details" className="text-sm">Update Payment Details</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="reassign" 
                          className="mr-2"
                          checked={isPermissionSelected('finance', 'reassign')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'finance', 'reassign', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="reassign" className="text-sm">Reassign</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Folders */}
                <div className="p-4 border-b">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Checkbox 
                        id="folders" 
                        className="mr-2"
                        checked={isPermissionSelected('folders')} 
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdateModuleWithChildren(modulePermissions, 'folders', !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="folders">Folders</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="create-folder" 
                          className="mr-2"
                          checked={getPermissionValue('folders', 'createFolder')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'folders', 'createFolder', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="create-folder" className="text-sm">Create Folder</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="delete-folder" 
                          className="mr-2"
                          checked={getPermissionValue('folders', 'deleteFolder')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'folders', 'deleteFolder', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="delete-folder" className="text-sm">Delete Folder</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="rename-folder" 
                          className="mr-2"
                          checked={getPermissionValue('folders', 'renameFolder')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'folders', 'renameFolder', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="rename-folder" className="text-sm">Rename Folder</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Brief Case */}
                <div className="p-4 border-b">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Checkbox 
                        id="brief-case" 
                        className="mr-2"
                        checked={isPermissionSelected('briefCase')} 
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdateModuleWithChildren(modulePermissions, 'briefCase', !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="brief-case">Brief Case</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="add-new-file" 
                          className="mr-2"
                          checked={getPermissionValue('briefCase', 'addNewFile')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'briefCase', 'addNewFile', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="add-new-file" className="text-sm">Add New File</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="edit-file" 
                          className="mr-2"
                          checked={getPermissionValue('briefCase', 'editFile')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'briefCase', 'editFile', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="edit-file" className="text-sm">Edit File</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="delete-file" 
                          className="mr-2"
                          checked={getPermissionValue('briefCase', 'deleteFile')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'briefCase', 'deleteFile', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="delete-file" className="text-sm">Delete File</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Approvals */}
                <div className="p-4 border-b">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Checkbox 
                        id="approvals" 
                        className="mr-2"
                        checked={isPermissionSelected('approvals')} 
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdateModuleWithChildren(modulePermissions, 'approvals', !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="approvals">Approvals</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="finance-approval" 
                          className="mr-2"
                          checked={getPermissionValue('approvals', 'financeApproval')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'approvals', 'financeApproval', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="finance-approval" className="text-sm">Finance Approval</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="tender-approval" 
                          className="mr-2"
                          checked={getPermissionValue('approvals', 'tenderApproval')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'approvals', 'tenderApproval', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="tender-approval" className="text-sm">Tender Approval</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* UserMaster */}
                <div className="p-4 border-b">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Checkbox 
                        id="user-master" 
                        className="mr-2"
                        checked={isPermissionSelected('userMaster')} 
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdateModuleWithChildren(modulePermissions, 'userMaster', !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="user-master">UserMaster</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="user-create" 
                          className="mr-2"
                          checked={getPermissionValue('userMaster', 'create')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'userMaster', 'create', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="user-create" className="text-sm">Create</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="user-edit" 
                          className="mr-2"
                          checked={getPermissionValue('userMaster', 'edit')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'userMaster', 'edit', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="user-edit" className="text-sm">Edit</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="user-delete" 
                          className="mr-2"
                          checked={getPermissionValue('userMaster', 'delete')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'userMaster', 'delete', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="user-delete" className="text-sm">Delete</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="change-password" 
                          className="mr-2"
                          checked={getPermissionValue('userMaster', 'changePassword')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'userMaster', 'changePassword', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="change-password" className="text-sm">Change Password</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Department */}
                <div className="p-4 border-b">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Checkbox 
                        id="department" 
                        className="mr-2"
                        checked={isPermissionSelected('department')} 
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdateModuleWithChildren(modulePermissions, 'department', !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="department">Department</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="department-create" 
                          className="mr-2"
                          checked={getPermissionValue('department', 'create')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'department', 'create', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="department-create" className="text-sm">Create</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="department-edit" 
                          className="mr-2"
                          checked={getPermissionValue('department', 'edit')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'department', 'edit', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="department-edit" className="text-sm">Edit</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="department-delete" 
                          className="mr-2"
                          checked={getPermissionValue('department', 'delete')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'department', 'delete', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="department-delete" className="text-sm">Delete</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Designation */}
                <div className="p-4 border-b">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Checkbox 
                        id="designation" 
                        className="mr-2"
                        checked={isPermissionSelected('designation')} 
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdateModuleWithChildren(modulePermissions, 'designation', !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="designation">Designation</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="designation-create" 
                          className="mr-2"
                          checked={getPermissionValue('designation', 'create')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'designation', 'create', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="designation-create" className="text-sm">Create</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="designation-edit" 
                          className="mr-2"
                          checked={getPermissionValue('designation', 'edit')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'designation', 'edit', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="designation-edit" className="text-sm">Edit</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="designation-delete" 
                          className="mr-2"
                          checked={getPermissionValue('designation', 'delete')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'designation', 'delete', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="designation-delete" className="text-sm">Delete</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role */}
                <div className="p-4 border-b">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Checkbox 
                        id="role-module" 
                        className="mr-2"
                        checked={isPermissionSelected('role')} 
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdateModuleWithChildren(modulePermissions, 'role', !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="role-module">Role</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="role-create" 
                          className="mr-2"
                          checked={getPermissionValue('role', 'create')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'role', 'create', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="role-create" className="text-sm">Create</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="role-edit" 
                          className="mr-2"
                          checked={getPermissionValue('role', 'edit')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'role', 'edit', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="role-edit" className="text-sm">Edit</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="role-delete" 
                          className="mr-2"
                          checked={getPermissionValue('role', 'delete')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'role', 'delete', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="role-delete" className="text-sm">Delete</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="assign-edit-rights" 
                          className="mr-2"
                          checked={getPermissionValue('role', 'assignEditRights')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'role', 'assignEditRights', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="assign-edit-rights" className="text-sm">Assign/Edit Rights</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add New Tender */}
                <div className="p-4 border-b">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Checkbox 
                        id="add-new-tender" 
                        className="mr-2"
                        checked={isPermissionSelected('addNewTender')} 
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdateModuleWithChildren(modulePermissions, 'addNewTender', !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="add-new-tender">Add New Tender</Label>
                    </div>
                  </div>
                </div>

                {/* OEM */}
                <div className="p-4 border-b">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Checkbox 
                        id="oem" 
                        className="mr-2"
                        checked={isPermissionSelected('oem')} 
                        onCheckedChange={(checked) => {
                          setModulePermissions(
                            safeUpdateModuleWithChildren(modulePermissions, 'oem', !!checked)
                          );
                        }}
                      />
                      <Label htmlFor="oem">OEM</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="oem-create" 
                          className="mr-2"
                          checked={getPermissionValue('oem', 'create')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'oem', 'create', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="oem-create" className="text-sm">Create</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="oem-edit" 
                          className="mr-2"
                          checked={getPermissionValue('oem', 'edit')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'oem', 'edit', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="oem-edit" className="text-sm">Edit</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="oem-delete" 
                          className="mr-2"
                          checked={getPermissionValue('oem', 'delete')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'oem', 'delete', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="oem-delete" className="text-sm">Delete</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="update-status" 
                          className="mr-2"
                          checked={getPermissionValue('oem', 'updateStatus')} 
                          onCheckedChange={(checked) => {
                            setModulePermissions(
                              safeUpdatePermission(modulePermissions, 'oem', 'updateStatus', !!checked)
                            );
                          }}
                        />
                        <Label htmlFor="update-status" className="text-sm">Update Status</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsRightsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => {
                    // Save role permissions to the server
                    savePermissionsMutation.mutate({
                      roleId: selectedRole.id,
                      permissions: modulePermissions,
                      updatedBy: currentUser?.name || "System" // Use current user's name
                    });
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role & Rights Management Modal */}
      {isAssignRightsModalOpen && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                Role & Rights Management
              </h3>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsAssignRightsModalOpen(false)}
                className="text-gray-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-row">
              {/* Left side - Role list */}
              <div className="w-1/3 border-r overflow-hidden">
                <div className="p-4">
                  <h4 className="font-medium mb-2">Role</h4>
                </div>
                <div className="overflow-y-auto" style={{ height: 'calc(90vh - 140px)' }}>
                  <Table>
                    <TableHeader className="bg-blue-600 sticky top-0">
                      <TableRow>
                        <TableHead className="text-white text-center w-12">#</TableHead>
                        <TableHead className="text-white">ROLE NAME</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRoles.map((role, index) => (
                        <TableRow 
                          key={role.id} 
                          className={`hover:bg-gray-100 cursor-pointer ${selectedRole.id === role.id ? 'bg-blue-50' : ''}`}
                          onClick={() => setSelectedRole(role)}
                        >
                          <TableCell className="text-center">{startIndex + index + 1}</TableCell>
                          <TableCell>{role.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="p-2 border-t flex justify-between items-center">
                  <div>
                    <select
                      className="border rounded p-1 text-sm"
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    >
                      <option value="10">Show 10</option>
                      <option value="25">Show 25</option>
                      <option value="50">Show 50</option>
                    </select>
                  </div>
                  <div className="text-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              </div>
              
              {/* Right side - Permissions */}
              <div className="w-2/3 overflow-hidden flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                  <h4 className="font-medium">Module</h4>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">Actions</h4>
                    <Checkbox 
                      id="select-all" 
                      className="ml-4" 
                      onCheckedChange={(checked) => {
                        // Implement select all functionality
                        const updatedPermissions = { ...modulePermissions };
                        // Iterate through all modules and set all permissions to the checked value
                        Object.keys(updatedPermissions).forEach(moduleKey => {
                          updatedPermissions[moduleKey].selected = !!checked;
                          if (updatedPermissions[moduleKey].permissions) {
                            Object.keys(updatedPermissions[moduleKey].permissions || {}).forEach(permKey => {
                              updatedPermissions[moduleKey].permissions![permKey].selected = !!checked;
                            });
                          }
                        });
                        setModulePermissions(updatedPermissions);
                      }} 
                    />
                    <label htmlFor="select-all" className="text-sm">Select All</label>
                  </div>
                </div>
                
                <div className="overflow-y-auto p-4" style={{ height: 'calc(90vh - 180px)' }}>
                  {/* Sales Dashboard */}
                  <div className="border-b py-3 flex">
                    <div className="flex items-center w-1/3">
                      <Checkbox 
                        id="sales-dashboard" 
                        checked={getPermissionValue('salesDashboard')}
                        onCheckedChange={(checked) => {
                          const updatedPermissions = { ...modulePermissions };
                          updatedPermissions.salesDashboard.selected = !!checked;
                          setModulePermissions(updatedPermissions);
                        }}
                        className="mr-2" 
                      />
                      <label htmlFor="sales-dashboard">Sales Dashboard</label>
                    </div>
                  </div>
                  
                  {/* Finance Dashboard */}
                  <div className="border-b py-3 flex">
                    <div className="flex items-center w-1/3">
                      <Checkbox 
                        id="finance-dashboard" 
                        checked={getPermissionValue('financeDashboard')}
                        onCheckedChange={(checked) => {
                          const updatedPermissions = { ...modulePermissions };
                          updatedPermissions.financeDashboard.selected = !!checked;
                          setModulePermissions(updatedPermissions);
                        }}
                        className="mr-2" 
                      />
                      <label htmlFor="finance-dashboard">Finance Dashboard</label>
                    </div>
                  </div>
                  
                  {/* Tender */}
                  <div className="border-b py-3 flex">
                    <div className="flex items-center w-1/3">
                      <Checkbox 
                        id="tender" 
                        checked={getPermissionValue('tender')}
                        onCheckedChange={(checked) => {
                          const updatedPermissions = { ...modulePermissions };
                          updatedPermissions.tender.selected = !!checked;
                          setModulePermissions(updatedPermissions);
                        }}
                        className="mr-2" 
                      />
                      <label htmlFor="tender">Tender</label>
                    </div>
                  </div>
                  
                  {/* Tender Result */}
                  <div className="border-b py-3 flex">
                    <div className="flex items-center w-1/3">
                      <Checkbox 
                        id="tender-result" 
                        checked={getPermissionValue('tenderResult')}
                        onCheckedChange={(checked) => {
                          const updatedPermissions = { ...modulePermissions };
                          updatedPermissions.tenderResult.selected = !!checked;
                          setModulePermissions(updatedPermissions);
                        }}
                        className="mr-2" 
                      />
                      <label htmlFor="tender-result">Tender Result</label>
                    </div>
                  </div>
                  
                  {/* Tender Task */}
                  <div className="border-b py-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="tender-task" 
                        checked={getPermissionValue('tenderTask')}
                        onCheckedChange={(checked) => {
                          const updatedPermissions = { ...modulePermissions };
                          updatedPermissions.tenderTask.selected = !!checked;
                          // Also update all child permissions
                          if (updatedPermissions.tenderTask.permissions) {
                            Object.keys(updatedPermissions.tenderTask.permissions).forEach(key => {
                              updatedPermissions.tenderTask.permissions![key].selected = !!checked;
                            });
                          }
                          setModulePermissions(updatedPermissions);
                        }}
                        className="mr-2" 
                      />
                      <label htmlFor="tender-task">Tender Task</label>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 pl-6">
                      <div className="flex items-center">
                        <Checkbox 
                          id="request-to-finance-team" 
                          checked={getPermissionValue('tenderTask', 'requestToFinanceTeam')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.tenderTask.permissions) {
                              updatedPermissions.tenderTask.permissions.requestToFinanceTeam.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="request-to-finance-team" className="text-sm">Request To Finance Team</label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="assign-to-team" 
                          checked={getPermissionValue('tenderTask', 'assignToTeam')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.tenderTask.permissions) {
                              updatedPermissions.tenderTask.permissions.assignToTeam.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="assign-to-team" className="text-sm">Assign To Team</label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="kick-off-call" 
                          checked={getPermissionValue('tenderTask', 'kickOfCall')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.tenderTask.permissions) {
                              updatedPermissions.tenderTask.permissions.kickOfCall.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="kick-off-call" className="text-sm">Kick Off Call</label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="request-for-approval" 
                          checked={getPermissionValue('tenderTask', 'requestForApproval')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.tenderTask.permissions) {
                              updatedPermissions.tenderTask.permissions.requestForApproval.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="request-for-approval" className="text-sm">Request For Approval</label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="start-bidding" 
                          checked={getPermissionValue('tenderTask', 'startBidding')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.tenderTask.permissions) {
                              updatedPermissions.tenderTask.permissions.startBidding.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="start-bidding" className="text-sm">Start Bidding</label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="tender-status" 
                          checked={getPermissionValue('tenderTask', 'tenderStatus')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.tenderTask.permissions) {
                              updatedPermissions.tenderTask.permissions.tenderStatus.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="tender-status" className="text-sm">Tender Status</label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Finance */}
                  <div className="border-b py-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="finance" 
                        checked={getPermissionValue('finance')}
                        onCheckedChange={(checked) => {
                          const updatedPermissions = { ...modulePermissions };
                          updatedPermissions.finance.selected = !!checked;
                          // Also update all child permissions
                          if (updatedPermissions.finance.permissions) {
                            Object.keys(updatedPermissions.finance.permissions).forEach(key => {
                              updatedPermissions.finance.permissions![key].selected = !!checked;
                            });
                          }
                          setModulePermissions(updatedPermissions);
                        }}
                        className="mr-2" 
                      />
                      <label htmlFor="finance">Finance</label>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 pl-6">
                      <div className="flex items-center">
                        <Checkbox 
                          id="approve-self" 
                          checked={getPermissionValue('finance', 'approvalSelf')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.finance.permissions) {
                              updatedPermissions.finance.permissions.approvalSelf.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="approve-self" className="text-sm">Approve Self</label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="update-payment-details" 
                          checked={getPermissionValue('finance', 'updatePaymentDetails')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.finance.permissions) {
                              updatedPermissions.finance.permissions.updatePaymentDetails.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="update-payment-details" className="text-sm">Update Payment Details</label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="reassign" 
                          checked={getPermissionValue('finance', 'reassign')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.finance.permissions) {
                              updatedPermissions.finance.permissions.reassign.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="reassign" className="text-sm">Reassign</label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Department */}
                  <div className="border-b py-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="department" 
                        checked={getPermissionValue('department')}
                        onCheckedChange={(checked) => {
                          const updatedPermissions = { ...modulePermissions };
                          updatedPermissions.department.selected = !!checked;
                          if (updatedPermissions.department.permissions) {
                            Object.keys(updatedPermissions.department.permissions).forEach(key => {
                              updatedPermissions.department.permissions![key].selected = !!checked;
                            });
                          }
                          setModulePermissions(updatedPermissions);
                        }}
                        className="mr-2" 
                      />
                      <label htmlFor="department">Department</label>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 pl-6">
                      <div className="flex items-center">
                        <Checkbox 
                          id="department-create" 
                          checked={getPermissionValue('department', 'create')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.department.permissions) {
                              updatedPermissions.department.permissions.create.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="department-create" className="text-sm">Create</label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="department-edit" 
                          checked={getPermissionValue('department', 'edit')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.department.permissions) {
                              updatedPermissions.department.permissions.edit.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="department-edit" className="text-sm">Edit</label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="department-delete" 
                          checked={getPermissionValue('department', 'delete')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.department.permissions) {
                              updatedPermissions.department.permissions.delete.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="department-delete" className="text-sm">Delete</label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Designation */}
                  <div className="border-b py-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="designation" 
                        checked={getPermissionValue('designation')}
                        onCheckedChange={(checked) => {
                          const updatedPermissions = { ...modulePermissions };
                          updatedPermissions.designation.selected = !!checked;
                          if (updatedPermissions.designation.permissions) {
                            Object.keys(updatedPermissions.designation.permissions).forEach(key => {
                              updatedPermissions.designation.permissions![key].selected = !!checked;
                            });
                          }
                          setModulePermissions(updatedPermissions);
                        }}
                        className="mr-2" 
                      />
                      <label htmlFor="designation">Designation</label>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 pl-6">
                      <div className="flex items-center">
                        <Checkbox 
                          id="designation-create" 
                          checked={getPermissionValue('designation', 'create')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.designation.permissions) {
                              updatedPermissions.designation.permissions.create.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="designation-create" className="text-sm">Create</label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="designation-edit" 
                          checked={getPermissionValue('designation', 'edit')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.designation.permissions) {
                              updatedPermissions.designation.permissions.edit.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="designation-edit" className="text-sm">Edit</label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="designation-delete" 
                          checked={getPermissionValue('designation', 'delete')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.designation.permissions) {
                              updatedPermissions.designation.permissions.delete.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="designation-delete" className="text-sm">Delete</label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Role */}
                  <div className="border-b py-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="role-module" 
                        checked={getPermissionValue('role')}
                        onCheckedChange={(checked) => {
                          const updatedPermissions = { ...modulePermissions };
                          updatedPermissions.role.selected = !!checked;
                          if (updatedPermissions.role.permissions) {
                            Object.keys(updatedPermissions.role.permissions).forEach(key => {
                              updatedPermissions.role.permissions![key].selected = !!checked;
                            });
                          }
                          setModulePermissions(updatedPermissions);
                        }}
                        className="mr-2" 
                      />
                      <label htmlFor="role-module">Role</label>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 pl-6">
                      <div className="flex items-center">
                        <Checkbox 
                          id="role-create" 
                          checked={getPermissionValue('role', 'create')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.role.permissions) {
                              updatedPermissions.role.permissions.create.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="role-create" className="text-sm">Create</label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="role-edit" 
                          checked={getPermissionValue('role', 'edit')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.role.permissions) {
                              updatedPermissions.role.permissions.edit.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="role-edit" className="text-sm">Edit</label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="role-delete" 
                          checked={getPermissionValue('role', 'delete')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.role.permissions) {
                              updatedPermissions.role.permissions.delete.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="role-delete" className="text-sm">Delete</label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="assign-edit-rights" 
                          checked={getPermissionValue('role', 'assignEditRights')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.role.permissions) {
                              updatedPermissions.role.permissions.assignEditRights.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="assign-edit-rights" className="text-sm">Assign/Edit Rights</label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Add New Tender */}
                  <div className="border-b py-3 flex">
                    <div className="flex items-center w-1/3">
                      <Checkbox 
                        id="add-new-tender" 
                        checked={getPermissionValue('addNewTender')}
                        onCheckedChange={(checked) => {
                          const updatedPermissions = { ...modulePermissions };
                          updatedPermissions.addNewTender.selected = !!checked;
                          setModulePermissions(updatedPermissions);
                        }}
                        className="mr-2" 
                      />
                      <label htmlFor="add-new-tender">Add New Tender</label>
                    </div>
                  </div>
                  
                  {/* OEM */}
                  <div className="border-b py-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="oem" 
                        checked={getPermissionValue('oem')}
                        onCheckedChange={(checked) => {
                          const updatedPermissions = { ...modulePermissions };
                          updatedPermissions.oem.selected = !!checked;
                          if (updatedPermissions.oem.permissions) {
                            Object.keys(updatedPermissions.oem.permissions).forEach(key => {
                              updatedPermissions.oem.permissions![key].selected = !!checked;
                            });
                          }
                          setModulePermissions(updatedPermissions);
                        }}
                        className="mr-2" 
                      />
                      <label htmlFor="oem">OEM</label>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 pl-6">
                      <div className="flex items-center">
                        <Checkbox 
                          id="oem-create" 
                          checked={getPermissionValue('oem', 'create')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.oem.permissions) {
                              updatedPermissions.oem.permissions.create.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="oem-create" className="text-sm">Create</label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="oem-edit" 
                          checked={getPermissionValue('oem', 'edit')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.oem.permissions) {
                              updatedPermissions.oem.permissions.edit.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="oem-edit" className="text-sm">Edit</label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="oem-delete" 
                          checked={getPermissionValue('oem', 'delete')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.oem.permissions) {
                              updatedPermissions.oem.permissions.delete.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="oem-delete" className="text-sm">Delete</label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="oem-update-status" 
                          checked={getPermissionValue('oem', 'updateStatus')}
                          onCheckedChange={(checked) => {
                            const updatedPermissions = { ...modulePermissions };
                            if (updatedPermissions.oem.permissions) {
                              updatedPermissions.oem.permissions.updateStatus.selected = !!checked;
                            }
                            setModulePermissions(updatedPermissions);
                          }}
                          className="mr-2" 
                        />
                        <label htmlFor="oem-update-status" className="text-sm">Update Status</label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsAssignRightsModalOpen(false)}
                    className="mr-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      savePermissionsMutation.mutate({
                        roleId: selectedRole.id,
                        permissions: modulePermissions,
                        updatedBy: currentUser?.name || "System"
                      });
                    }}
                    disabled={savePermissionsMutation.isPending}
                  >
                    {savePermissionsMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}