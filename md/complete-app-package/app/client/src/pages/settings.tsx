import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Pencil, Trash2, UserPlus, X, Settings, Check } from "lucide-react";
import { useLocation, Redirect } from "wouter";
import { RoleSettings } from "@/components/settings/role-settings";
import { UserManagement } from "@/components/settings/user-management";
import { usePermissions } from "@/hooks/use-permissions";
import { useUser } from "@/user-context";
import { Spinner } from "@/components/ui/spinner";
import { EmailTest } from "@/components/email/email-test";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { MainLayout } from "@/components/layout/main-layout";


// Available departments for selection in dropdowns
const departmentsList = [
  "Business Development", "Sales", "Finance", "Operations", 
  "Marketing", "Human Resources", "IT", "Software", "Management", "Account"
];

// Available roles for selection in dropdowns
const rolesList = [
  "Admin", "SuperAdmin", "User", "Finance Head", "Tender Manager", "Sales Executive"
];

// Map of tab ids to permission modules
const tabPermissionMap: Record<string, string> = {
  'department': 'department',
  'designation': 'designation',
  'role': 'role',
  'user-management': 'userMaster',
  // Profile doesn't need a specific permission; it's available to all authenticated users
  'profile': 'profile'
};

export default function SettingsPage() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const { hasPermission, isLoading } = usePermissions();
  const { currentUser } = useUser();
  
  // Set active tab based on URL path or query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    
    // Check if this is a direct route to a settings page
    if (location === '/department') {
      setActiveTab('department');
    } else if (location === '/designation') {
      setActiveTab('designation');
    } else if (location === '/role') {
      setActiveTab('role');
    } else if (location === '/user-management') {
      setActiveTab('user-management');
    } else if (tabParam && ['department', 'designation', 'role', 'user-management', 'email-test'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else {
      // Default to department tab
      setActiveTab('department');
    }
  }, [location, isLoading]);

  // Get tabs - all tabs are now available to everyone
  const getAvailableTabs = () => {
    const tabs = [
      { id: 'department', label: 'Department', permission: 'department' },
      { id: 'designation', label: 'Designation', permission: 'designation' },
      { id: 'role', label: 'Role', permission: 'role' },
      { id: 'user-management', label: 'User Management', permission: 'userMaster' },
      { id: 'email-test', label: 'Email Test', permission: 'admin' }
    ];
    
    // Return all tabs for all users - no permissions filtering
    return tabs;
  };

  // Function to render the content based on the active tab
  const renderContent = () => {
    // Render content based on active tab
    switch(activeTab) {
      case "department":
        return <DepartmentSettings />;
      case "designation":
        return <DesignationSettings />;
      case "role":
        return <RoleManagementSettings />;
      case "user-management":
        return <UserManagementSettings />;
      case "email-test":
        return <EmailTestSettings />;
      default:
        return <div className="text-center p-8">Please select a settings tab to continue</div>;
    }
  };

  // Function to navigate to a specific settings tab
  const navigateToTab = (tab: string) => {
    window.location.href = `/settings?tab=${tab}`;
  };

  // Show loading state while permissions are being loaded
  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      </div>
    );
  }

  const availableTabs = getAvailableTabs();

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Removed Settings heading as requested */}
      
      {/* Content Area */}
      <div className="bg-white rounded-lg">
        {renderContent()}
      </div>
    </div>
  );
}

// Department Settings
function DepartmentSettings() {
  const { toast } = useToast();
  const { currentUser } = useUser();
  const queryClient = useQueryClient();
  
  // Fetch departments from API
  const { data: departments = [], isLoading: departmentsLoading } = useQuery({
    queryKey: ["/api/departments"],
    queryFn: async () => {
      const response = await fetch("/api/departments");
      if (!response.ok) throw new Error("Failed to fetch departments");
      const data = await response.json();
      // Format dates and ensure all required fields are present
      return data.map((dept: any) => ({
        ...dept,
        createdAt: dept.createdAt ? new Date(dept.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric'
        }) + ' ' + new Date(dept.createdAt).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit'
        }) : new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) + ' ' + new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        createdBy: dept.createdBy || "System",
        status: dept.status || "Active"
      }));
    }
  });
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ name: "" });

  const handleAddDepartment = async () => {
    if (newDepartment.name.trim() === "") return;
    
    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newDepartment.name,
          createdBy: 2  // Use authenticated user ID (Poonam Amale)
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add department");
      }

      // Refresh the departments list
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      
      setNewDepartment({ name: "" });
      setIsAddModalOpen(false);
      
      toast({
        title: "Department Added",
        description: `${newDepartment.name} has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add department. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditDepartment = async () => {
    if (!selectedDepartment || newDepartment.name.trim() === "") return;
    
    try {
      const response = await fetch(`/api/departments/${selectedDepartment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newDepartment.name
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update department");
      }

      // Refresh the departments list
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      
      setNewDepartment({ name: "" });
      setIsAddModalOpen(false);
      setIsEditMode(false);
      setSelectedDepartment(null);
      
      toast({
        title: "Department Updated",
        description: `Department has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update department. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedDepartment) return;
    
    const newStatus = selectedDepartment.status === "Active" ? "Inactive" : "Active";
    
    try {
      const response = await fetch(`/api/departments/${selectedDepartment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update department status");
      }

      // Refresh the departments list
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      
      setIsConfirmModalOpen(false);
      setSelectedDepartment(null);
      
      toast({
        title: `Department ${newStatus}`,
        description: `Department has been ${newStatus.toLowerCase()} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update department status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (department: any) => {
    setSelectedDepartment(department);
    setNewDepartment({ name: department.name });
    setIsEditMode(true);
    setIsAddModalOpen(true);
  };

  const handleStatusClick = (department: any) => {
    setSelectedDepartment(department);
    setIsConfirmModalOpen(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Implement search functionality here
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Department</CardTitle>
        </div>
        <Button className="gap-1 bg-[#0076a8] hover:bg-[#005e86]" onClick={() => {
          setIsEditMode(false);
          setNewDepartment({ name: "" });
          setIsAddModalOpen(true);
        }}>
          <PlusCircle className="h-4 w-4" />
          Add Department
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Input 
            className="max-w-xs" 
            placeholder="Search..." 
            onChange={handleSearch}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>DEPARTMENT</TableHead>
              <TableHead>CREATED BY</TableHead>
              <TableHead>CREATED DATE & TIME</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead>ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((dept, index) => (
              <TableRow key={dept.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{dept.name}</TableCell>
                <TableCell>{dept.createdBy}</TableCell>
                <TableCell>{dept.createdAt}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${dept.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {dept.status}
                  </span>
                </TableCell>
                <TableCell className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-500" 
                    onClick={() => handleEditClick(dept)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-8 w-8 ${dept.status === 'Active' ? 'text-green-500' : 'text-gray-500'}`}
                    onClick={() => handleStatusClick(dept)}
                  >
                    <span className="text-sm">✓</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Show</span>
            <select className="border rounded text-sm p-1">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              <span className="sr-only">Previous</span>
              <span className="h-4 w-4">«</span>
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-white">
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              <span className="sr-only">Next</span>
              <span className="h-4 w-4">»</span>
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Add/Edit Department Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 m-4">
            <h3 className="text-lg font-semibold mb-4">{isEditMode ? "Edit Department" : "Add Department"}</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dept-name">Department Name</Label>
                <Input 
                  id="dept-name" 
                  placeholder="Enter department name" 
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditMode(false);
                    setSelectedDepartment(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-[#0076a8] hover:bg-[#005e86]"
                  onClick={isEditMode ? handleEditDepartment : handleAddDepartment}
                >
                  {isEditMode ? "Update" : "Submit"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Confirmation Modal */}
      {isConfirmModalOpen && selectedDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 m-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Status Change</h3>
            <p>
              Are you sure you want to {selectedDepartment.status === "Active" ? "inactive" : "active"} this department?
            </p>
            <div className="flex justify-end space-x-3 pt-4 mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setSelectedDepartment(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                className={selectedDepartment.status === "Active" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
                onClick={handleToggleStatus}
              >
                {selectedDepartment.status === "Active" ? "Inactive" : "Active"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// Designation Settings
function DesignationSettings() {
  const { toast } = useToast();
  const { currentUser } = useUser();
  const queryClient = useQueryClient();
  
  // Fetch designations from API
  const { data: designations = [], isLoading: designationsLoading } = useQuery({
    queryKey: ["/api/designations"],
    queryFn: async () => {
      const response = await fetch("/api/designations");
      if (!response.ok) throw new Error("Failed to fetch designations");
      const data = await response.json();
      // Format dates and ensure all required fields are present
      return data.map((desig: any) => ({
        ...desig,
        createdAt: desig.createdAt ? new Date(desig.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric'
        }) + ' ' + new Date(desig.createdAt).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit'
        }) : new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) + ' ' + new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        createdBy: desig.createdBy || "System",
        status: desig.status || "Active"
      }));
    }
  });
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newDesignation, setNewDesignation] = useState({ name: "" });

  const handleAddDesignation = async () => {
    if (newDesignation.name.trim() === "") return;
    
    try {
      const response = await fetch("/api/designations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newDesignation.name,
          departmentId: 2,  // Default to Finance department 
          createdBy: 2      // Use authenticated user ID (Poonam Amale)
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add designation");
      }

      // Refresh the designations list
      queryClient.invalidateQueries({ queryKey: ["/api/designations"] });
      
      setNewDesignation({ name: "" });
      setIsAddModalOpen(false);
      
      toast({
        title: "Designation Added",
        description: `${newDesignation.name} has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add designation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditDesignation = async () => {
    if (!selectedDesignation || newDesignation.name.trim() === "") return;
    
    try {
      const response = await fetch(`/api/designations/${selectedDesignation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newDesignation.name
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update designation");
      }

      // Refresh the designations list
      queryClient.invalidateQueries({ queryKey: ["/api/designations"] });
      
      setNewDesignation({ name: "" });
      setIsAddModalOpen(false);
      setIsEditMode(false);
      setSelectedDesignation(null);
      
      toast({
        title: "Designation Updated",
        description: `Designation has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update designation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedDesignation) return;
    
    const newStatus = selectedDesignation.status === "Active" ? "Inactive" : "Active";
    
    try {
      const response = await fetch(`/api/designations/${selectedDesignation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update designation status");
      }

      // Refresh the designations list
      queryClient.invalidateQueries({ queryKey: ["/api/designations"] });
      
      setIsConfirmModalOpen(false);
      setSelectedDesignation(null);
      
      toast({
        title: `Designation ${newStatus}`,
        description: `Designation has been ${newStatus.toLowerCase()} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update designation status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (designation: any) => {
    setSelectedDesignation(designation);
    setNewDesignation({ name: designation.name });
    setIsEditMode(true);
    setIsAddModalOpen(true);
  };

  const handleStatusClick = (designation: any) => {
    setSelectedDesignation(designation);
    setIsConfirmModalOpen(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Implement search functionality here
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Designation</CardTitle>
        </div>
        <Button className="gap-1 bg-[#0076a8] hover:bg-[#005e86]" onClick={() => {
          setIsEditMode(false);
          setNewDesignation({ name: "" });
          setIsAddModalOpen(true);
        }}>
          <PlusCircle className="h-4 w-4" />
          Add Designation
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Input 
            className="max-w-xs" 
            placeholder="Search..." 
            onChange={handleSearch}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>DESIGNATION NAME</TableHead>
              <TableHead>CREATED BY</TableHead>
              <TableHead>CREATED DATE & TIME</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead>ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {designations.map((desig, index) => (
              <TableRow key={desig.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{desig.name}</TableCell>
                <TableCell>{desig.createdBy}</TableCell>
                <TableCell>{desig.createdAt}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${desig.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {desig.status}
                  </span>
                </TableCell>
                <TableCell className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-500" 
                    onClick={() => handleEditClick(desig)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-8 w-8 ${desig.status === 'Active' ? 'text-green-500' : 'text-gray-500'}`}
                    onClick={() => handleStatusClick(desig)}
                  >
                    <span className="text-sm">✓</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Show</span>
            <select className="border rounded text-sm p-1">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              <span className="sr-only">Previous</span>
              <span className="h-4 w-4">«</span>
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-white">
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              <span className="sr-only">Next</span>
              <span className="h-4 w-4">»</span>
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Add/Edit Designation Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 m-4">
            <h3 className="text-lg font-semibold mb-4">{isEditMode ? "Edit Designation" : "Add Designation"}</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="desig-name">Designation Name</Label>
                <Input 
                  id="desig-name" 
                  placeholder="Enter designation name" 
                  value={newDesignation.name}
                  onChange={(e) => setNewDesignation({...newDesignation, name: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditMode(false);
                    setSelectedDesignation(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-[#0076a8] hover:bg-[#005e86]"
                  onClick={isEditMode ? handleEditDesignation : handleAddDesignation}
                >
                  {isEditMode ? "Update" : "Submit"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Confirmation Modal */}
      {isConfirmModalOpen && selectedDesignation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 m-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Status Change</h3>
            <p>
              Are you sure you want to {selectedDesignation.status === "Active" ? "inactive" : "active"} this designation?
            </p>
            <div className="flex justify-end space-x-3 pt-4 mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setSelectedDesignation(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                className={selectedDesignation.status === "Active" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
                onClick={handleToggleStatus}
              >
                {selectedDesignation.status === "Active" ? "Inactive" : "Active"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// Role Management Settings
function RoleManagementSettings() {
  const { toast } = useToast();
  const { currentUser } = useUser();
  const queryClient = useQueryClient();
  
  // Fetch roles from API
  const { data: allRoles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["/api/roles"],
    queryFn: async () => {
      const response = await fetch("/api/roles");
      if (!response.ok) throw new Error("Failed to fetch roles");
      const data = await response.json();
      // Format dates and ensure all required fields are present
      return data.map((role: any) => ({
        ...role,
        createdAt: role.createdAt ? new Date(role.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric'
        }) + ' ' + new Date(role.createdAt).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit'
        }) : new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) + ' ' + new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        createdBy: role.createdBy || "System",
        status: role.status || "Active"
      }));
    }
  });
  
  // Show all roles from database - no filtering
  const filteredRoles = allRoles;
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAssignRightsModalOpen, setIsAssignRightsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newRole, setNewRole] = useState({ name: "" });
  
  // Function to get default permissions structure
  const getDefaultPermissions = () => {
    return {
      salesDashboard: { selected: false },
      financeDashboard: { selected: false },
      tender: {
        selected: false,
        permissions: {
          allTenders: { selected: false },
          importTender: { selected: false },
          addModifyTender: { selected: false },
          tenderResult: { selected: false }
        }
      },
      tenderTask: {
        selected: false,
        permissions: {
          myTender: { selected: false },
          inProcessTender: { selected: false },
          assignedToTeam: { selected: false },
          submittedTender: { selected: false },
          droppedTender: { selected: false },
          rejectedTender: { selected: false }
        }
      },
      financeManagement: {
        selected: false,
        permissions: {
          newRequest: { selected: false },
          approvedRequest: { selected: false },
          deniedRequest: { selected: false },
          completeRequest: { selected: false }
        }
      },
      mis: {
        selected: false,
        permissions: {
          financeMIS: { selected: false },
          salesMIS: { selected: false },
          loginMIS: { selected: false }
        }
      },
      documentManagement: {
        selected: false,
        permissions: {
          documentBriefCase: { selected: false },
          folder: { selected: false }
        }
      },
      task: { selected: false },
      approvals: {
        selected: false,
        permissions: {
          financeApproval: { selected: false },
          tenderApproval: { selected: false }
        }
      },
      bidManagement: {
        selected: false,
        permissions: {
          companyManagement: { selected: false },
          bidParticipation: { selected: false },
          documentCompilationExports: { selected: false }
        }
      },
      settings: {
        selected: false,
        permissions: {
          department: { selected: false },
          designation: { selected: false },
          role: { selected: false },
          userManagement: { selected: false }
        }
      },
      oemManagement: {
        selected: false,
        permissions: {
          dealer: { selected: false },
          oem: { selected: false }
        }
      }
    };
  };
  
  // Module permissions for rights management - Initialize with defaults, will be updated when role is selected
  const [modulePermissions, setModulePermissions] = useState(() => getDefaultPermissions());

  const handleAddRole = async () => {
    if (newRole.name.trim() === "") return;
    
    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newRole.name,
          createdBy: currentUser?.name || "System"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add role");
      }

      // Refresh the roles list
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      
      setNewRole({ name: "" });
      setIsAddModalOpen(false);
      
      toast({
        title: "Role Added",
        description: `${newRole.name} has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditRole = async () => {
    if (!selectedRole || newRole.name.trim() === "") return;
    
    try {
      const response = await fetch(`/api/roles/${selectedRole.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newRole.name
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      // Refresh the roles list
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      
      setNewRole({ name: "" });
      setIsAddModalOpen(false);
      setIsEditMode(false);
      setSelectedRole(null);
      
      toast({
        title: "Role Updated",
        description: `Role has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedRole) return;
    
    const newStatus = selectedRole.status === "Active" ? "Inactive" : "Active";
    
    try {
      const response = await fetch(`/api/roles/${selectedRole.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role status");
      }

      // Refresh the roles list
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      
      setIsConfirmModalOpen(false);
      setSelectedRole(null);
      
      toast({
        title: `Role ${newStatus}`,
        description: `Role has been ${newStatus.toLowerCase()} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (role: any) => {
    setSelectedRole(role);
    setNewRole({ name: role.name });
    setIsEditMode(true);
    setIsAddModalOpen(true);
  };

  const handleStatusClick = (role: any) => {
    setSelectedRole(role);
    setIsConfirmModalOpen(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Implement search functionality here
  };

  // Function to check if all permissions are selected
  const isAllPermissionsSelected = () => {
    const allModules = Object.values(modulePermissions);
    return allModules.every(module => {
      if (typeof module === 'object' && module.selected !== undefined) {
        if (module.permissions) {
          return module.selected && Object.values(module.permissions).every((perm: any) => perm.selected);
        }
        return module.selected;
      }
      return false;
    });
  };

  // Function to handle select all permissions
  const handleSelectAllPermissions = (checked: boolean) => {
    const newPermissions = { ...modulePermissions };
    
    Object.keys(newPermissions).forEach(moduleKey => {
      const module = newPermissions[moduleKey as keyof typeof newPermissions];
      if (typeof module === 'object' && 'selected' in module) {
        module.selected = checked;
        if (module.permissions) {
          Object.keys(module.permissions).forEach(permKey => {
            (module.permissions as any)[permKey].selected = checked;
          });
        }
      }
    });
    
    setModulePermissions(newPermissions);
  };

  // Function to load existing permissions for a role
  const loadRolePermissions = async (roleId: number) => {
    try {
      // First set default permissions to ensure all properties exist
      const defaultPerms = getDefaultPermissions();
      setModulePermissions(defaultPerms);
      
      const response = await fetch(`/api/roles/${roleId}/permissions`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.permissions) {
          // Deep merge saved permissions with defaults to ensure all properties exist
          const mergedPermissions = deepMergePermissions(defaultPerms, data.permissions);
          setModulePermissions(mergedPermissions);
        }
      }
    } catch (error) {
      console.error("Failed to load permissions:", error);
      // Fallback to default permissions on error
      setModulePermissions(getDefaultPermissions());
    }
  };

  // Helper function to deep merge permissions while preserving structure
  const deepMergePermissions = (defaults: any, saved: any): any => {
    const result = JSON.parse(JSON.stringify(defaults)); // Deep copy defaults
    
    for (const key in saved) {
      if (saved.hasOwnProperty(key) && result.hasOwnProperty(key)) {
        if (typeof saved[key] === 'object' && saved[key] !== null && !Array.isArray(saved[key])) {
          if (saved[key].hasOwnProperty('selected')) {
            // This is a permission object with selected property
            result[key].selected = saved[key].selected;
            
            // If it has sub-permissions, merge them too
            if (saved[key].permissions && result[key].permissions) {
              for (const subKey in saved[key].permissions) {
                if (result[key].permissions.hasOwnProperty(subKey)) {
                  result[key].permissions[subKey].selected = saved[key].permissions[subKey].selected;
                }
              }
            }
          }
        }
      }
    }
    
    return result;
  };

  // Function to save role permissions to database
  const saveRolePermissions = async () => {
    if (!selectedRole) return;

    try {
      const response = await fetch(`/api/roles/${selectedRole.id}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          permissions: modulePermissions,
          updatedBy: currentUser?.name || "System"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save permissions");
      }

      toast({
        title: "Permissions Saved",
        description: "Role permissions have been updated successfully.",
      });
      setIsAssignRightsModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save permissions. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Role</CardTitle>
        </div>
        <Button className="gap-1 bg-[#0076a8] hover:bg-[#005e86]" onClick={() => {
          setIsEditMode(false);
          setNewRole({ name: "" });
          setIsAddModalOpen(true);
        }}>
          <PlusCircle className="h-4 w-4" />
          Add New Role
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Input 
            className="max-w-xs" 
            placeholder="Search..." 
            onChange={handleSearch}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>ROLE NAME</TableHead>
              <TableHead>CREATED BY</TableHead>
              <TableHead>CREATED DATE & TIME</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead>ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoles.map((role: any, index) => (
              <TableRow key={role.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{role.name}</TableCell>
                <TableCell>{role.createdBy}</TableCell>
                <TableCell>{role.createdAt}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${role.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {role.status}
                  </span>
                </TableCell>
                <TableCell className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-500" 
                    onClick={() => handleEditClick(role)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-8 w-8 ${role.status === 'Active' ? 'text-green-500' : 'text-gray-500'}`}
                    onClick={() => handleStatusClick(role)}
                  >
                    <span className="text-sm">✓</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setSelectedRole(role);
                      setIsAssignRightsModalOpen(true);
                      loadRolePermissions(role.id);
                    }}
                    className="flex items-center justify-center w-7 h-7 bg-blue-600 hover:bg-blue-700 rounded cursor-pointer text-white"
                    title="Assign/Edit Rights"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Show</span>
            <select className="border rounded text-sm p-1">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              <span className="sr-only">Previous</span>
              <span className="h-4 w-4">«</span>
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-white">
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              <span className="sr-only">Next</span>
              <span className="h-4 w-4">»</span>
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Add/Edit Role Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 m-4">
            <h3 className="text-lg font-semibold mb-4">{isEditMode ? "Edit Role" : "Add New Role"}</h3>
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
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditMode(false);
                    setSelectedRole(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-[#0076a8] hover:bg-[#005e86]"
                  onClick={isEditMode ? handleEditRole : handleAddRole}
                >
                  {isEditMode ? "Update" : "Submit"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Confirmation Modal */}
      {isConfirmModalOpen && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 m-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Status Change</h3>
            <p>
              Are you sure you want to {selectedRole.status === "Active" ? "inactive" : "active"} this role?
            </p>
            <div className="flex justify-end space-x-3 pt-4 mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setSelectedRole(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                className={selectedRole.status === "Active" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
                onClick={handleToggleStatus}
              >
                {selectedRole.status === "Active" ? "Inactive" : "Active"}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Assign/Edit Rights Modal */}
      {isAssignRightsModalOpen && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                Role & Rights Management
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Checkbox 
                    id="select-all-permissions" 
                    className="mr-2"
                    checked={isAllPermissionsSelected()}
                    onCheckedChange={handleSelectAllPermissions}
                  />
                  <Label htmlFor="select-all-permissions" className="font-medium">Select All</Label>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsAssignRightsModalOpen(false)}
                  className="text-gray-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex h-[calc(90vh-4rem)] overflow-hidden">
              {/* Left side - Role list */}
              <div className="w-1/3 border-r overflow-hidden flex flex-col">
                <div className="p-4 border-b">
                  <h4 className="font-medium">Role</h4>
                </div>
                <div className="overflow-y-auto flex-grow">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center w-12">#</TableHead>
                        <TableHead>ROLE NAME</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoles.map((role: any, index: number) => (
                        <TableRow 
                          key={role.id} 
                          className={`hover:bg-gray-100 cursor-pointer ${selectedRole.id === role.id ? 'bg-blue-50' : ''}`}
                          onClick={() => setSelectedRole(role)}
                        >
                          <TableCell className="text-center">{index + 1}</TableCell>
                          <TableCell>{role.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="p-2 border-t flex justify-between items-center">
                  <div>
                    <select className="border rounded p-1 text-sm">
                      <option value="10">Show 10</option>
                      <option value="25">Show 25</option>
                      <option value="50">Show 50</option>
                    </select>
                  </div>
                  <div className="text-sm">
                    Page 1 of 1
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
                      checked={false}
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
                        checked={modulePermissions.salesDashboard.selected}
                        onCheckedChange={(checked) => {
                          const newPermissions = {...modulePermissions};
                          newPermissions.salesDashboard.selected = !!checked;
                          setModulePermissions(newPermissions);
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
                        checked={modulePermissions.financeDashboard.selected}
                        onCheckedChange={(checked) => {
                          const newPermissions = {...modulePermissions};
                          newPermissions.financeDashboard.selected = !!checked;
                          setModulePermissions(newPermissions);
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
                        checked={modulePermissions.tender.selected}
                        onCheckedChange={(checked) => {
                          const newPermissions = {...modulePermissions};
                          newPermissions.tender.selected = !!checked;
                          Object.keys(newPermissions.tender.permissions).forEach(key => {
                            newPermissions.tender.permissions[key].selected = !!checked;
                          });
                          setModulePermissions(newPermissions);
                        }}
                      />
                      <Label htmlFor="module-tender">Tender</Label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pl-6 mt-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="tender-all" 
                          className="mr-2"
                          checked={modulePermissions?.tender?.permissions?.allTenders?.selected || false}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.tender.permissions.allTenders.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="tender-all" className="text-sm">All Tenders</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="tender-import" 
                          className="mr-2"
                          checked={modulePermissions?.tender?.permissions?.importTender?.selected || false}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            if (newPermissions.tender?.permissions?.importTender) {
                              newPermissions.tender.permissions.importTender.selected = !!checked;
                              setModulePermissions(newPermissions);
                            }
                          }}
                        />
                        <Label htmlFor="tender-import" className="text-sm">Import Tender</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="tender-modify" 
                          className="mr-2"
                          checked={modulePermissions.tender.permissions.addModifyTender.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.tender.permissions.addModifyTender.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="tender-modify" className="text-sm">Add/Modify Tender</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="tender-result" 
                          className="mr-2"
                          checked={modulePermissions.tender.permissions.tenderResult.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.tender.permissions.tenderResult.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="tender-result" className="text-sm">Tender Result</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tender Task */}
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="module-tender-task" 
                        className="mr-2"
                        checked={modulePermissions.tenderTask.selected}
                        onCheckedChange={(checked) => {
                          const newPermissions = {...modulePermissions};
                          newPermissions.tenderTask.selected = !!checked;
                          Object.keys(newPermissions.tenderTask.permissions).forEach(key => {
                            newPermissions.tenderTask.permissions[key].selected = !!checked;
                          });
                          setModulePermissions(newPermissions);
                        }}
                      />
                      <Label htmlFor="module-tender-task">Tender Task</Label>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 pl-6 mt-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="tender-task-my-tender" 
                          className="mr-2"
                          checked={modulePermissions.tenderTask.permissions.myTender.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.tenderTask.permissions.myTender.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="tender-task-my-tender" className="text-sm">My Tender</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="tender-task-in-process" 
                          className="mr-2"
                          checked={modulePermissions.tenderTask.permissions.inProcessTender.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.tenderTask.permissions.inProcessTender.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="tender-task-in-process" className="text-sm">In-Process Tender</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="tender-task-assigned-team" 
                          className="mr-2"
                          checked={modulePermissions.tenderTask.permissions.assignedToTeam.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.tenderTask.permissions.assignedToTeam.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="tender-task-assigned-team" className="text-sm">Assigned To Team</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="tender-task-submitted" 
                          className="mr-2"
                          checked={modulePermissions.tenderTask.permissions.submittedTender.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.tenderTask.permissions.submittedTender.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="tender-task-submitted" className="text-sm">Submitted Tender</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="tender-task-dropped" 
                          className="mr-2"
                          checked={modulePermissions.tenderTask.permissions.droppedTender.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.tenderTask.permissions.droppedTender.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="tender-task-dropped" className="text-sm">Dropped Tender</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="tender-task-rejected" 
                          className="mr-2"
                          checked={modulePermissions.tenderTask.permissions.rejectedTender.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.tenderTask.permissions.rejectedTender.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="tender-task-rejected" className="text-sm">Rejected</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Finance Management */}
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="module-finance-management" 
                        className="mr-2"
                        checked={modulePermissions.financeManagement.selected}
                        onCheckedChange={(checked) => {
                          const newPermissions = {...modulePermissions};
                          newPermissions.financeManagement.selected = !!checked;
                          Object.keys(newPermissions.financeManagement.permissions).forEach(key => {
                            newPermissions.financeManagement.permissions[key].selected = !!checked;
                          });
                          setModulePermissions(newPermissions);
                        }}
                      />
                      <Label htmlFor="module-finance-management">Finance Management</Label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pl-6 mt-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="finance-new-request" 
                          className="mr-2"
                          checked={modulePermissions.financeManagement.permissions.newRequest.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.financeManagement.permissions.newRequest.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="finance-new-request" className="text-sm">New Request</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="finance-approved-request" 
                          className="mr-2"
                          checked={modulePermissions.financeManagement.permissions.approvedRequest.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.financeManagement.permissions.approvedRequest.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="finance-approved-request" className="text-sm">Approved Request</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="finance-denied-request" 
                          className="mr-2"
                          checked={modulePermissions.financeManagement.permissions.deniedRequest.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.financeManagement.permissions.deniedRequest.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="finance-denied-request" className="text-sm">Denied Request</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="finance-complete-request" 
                          className="mr-2"
                          checked={modulePermissions.financeManagement.permissions.completeRequest.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.financeManagement.permissions.completeRequest.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="finance-complete-request" className="text-sm">Complete Request</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* MIS */}
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="module-mis" 
                        className="mr-2"
                        checked={modulePermissions.mis.selected}
                        onCheckedChange={(checked) => {
                          const newPermissions = {...modulePermissions};
                          newPermissions.mis.selected = !!checked;
                          Object.keys(newPermissions.mis.permissions).forEach(key => {
                            newPermissions.mis.permissions[key].selected = !!checked;
                          });
                          setModulePermissions(newPermissions);
                        }}
                      />
                      <Label htmlFor="module-mis">MIS</Label>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 pl-6 mt-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="mis-finance" 
                          className="mr-2"
                          checked={modulePermissions.mis.permissions.financeMIS.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.mis.permissions.financeMIS.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="mis-finance" className="text-sm">Finance MIS</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="mis-sales" 
                          className="mr-2"
                          checked={modulePermissions.mis.permissions.salesMIS.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.mis.permissions.salesMIS.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="mis-sales" className="text-sm">Sales MIS</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="mis-login" 
                          className="mr-2"
                          checked={modulePermissions.mis.permissions.loginMIS.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.mis.permissions.loginMIS.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="mis-login" className="text-sm">Login MIS</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Document Management */}
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="module-document-management" 
                        className="mr-2"
                        checked={modulePermissions.documentManagement.selected}
                        onCheckedChange={(checked) => {
                          const newPermissions = {...modulePermissions};
                          newPermissions.documentManagement.selected = !!checked;
                          Object.keys(newPermissions.documentManagement.permissions).forEach(key => {
                            newPermissions.documentManagement.permissions[key].selected = !!checked;
                          });
                          setModulePermissions(newPermissions);
                        }}
                      />
                      <Label htmlFor="module-document-management">Document Management</Label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pl-6 mt-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="doc-brief-case" 
                          className="mr-2"
                          checked={modulePermissions.documentManagement.permissions.documentBriefCase.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.documentManagement.permissions.documentBriefCase.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="doc-brief-case" className="text-sm">Document Brief Case</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="doc-folder" 
                          className="mr-2"
                          checked={modulePermissions.documentManagement.permissions.folder.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.documentManagement.permissions.folder.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="doc-folder" className="text-sm">Folder</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Task */}
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="module-task" 
                        className="mr-2"
                        checked={modulePermissions.task.selected}
                        onCheckedChange={(checked) => {
                          const newPermissions = {...modulePermissions};
                          newPermissions.task.selected = !!checked;
                          setModulePermissions(newPermissions);
                        }}
                      />
                      <Label htmlFor="module-task">Task</Label>
                    </div>
                  </div>
                  
                  {/* Approvals */}
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="module-approvals" 
                        className="mr-2"
                        checked={modulePermissions.approvals.selected}
                        onCheckedChange={(checked) => {
                          const newPermissions = {...modulePermissions};
                          newPermissions.approvals.selected = !!checked;
                          Object.keys(newPermissions.approvals.permissions).forEach(key => {
                            newPermissions.approvals.permissions[key].selected = !!checked;
                          });
                          setModulePermissions(newPermissions);
                        }}
                      />
                      <Label htmlFor="module-approvals">Approvals</Label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pl-6 mt-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="approvals-finance" 
                          className="mr-2"
                          checked={modulePermissions.approvals.permissions.financeApproval.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.approvals.permissions.financeApproval.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="approvals-finance" className="text-sm">Finance Approval</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="approvals-tender" 
                          className="mr-2"
                          checked={modulePermissions.approvals.permissions.tenderApproval.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.approvals.permissions.tenderApproval.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="approvals-tender" className="text-sm">Tender Approval</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bid Management */}
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="module-bid-management" 
                        className="mr-2"
                        checked={modulePermissions.bidManagement.selected}
                        onCheckedChange={(checked) => {
                          const newPermissions = {...modulePermissions};
                          newPermissions.bidManagement.selected = !!checked;
                          Object.keys(newPermissions.bidManagement.permissions).forEach(key => {
                            newPermissions.bidManagement.permissions[key].selected = !!checked;
                          });
                          setModulePermissions(newPermissions);
                        }}
                      />
                      <Label htmlFor="module-bid-management">Bid Management</Label>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 pl-6 mt-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="bid-company-management" 
                          className="mr-2"
                          checked={modulePermissions.bidManagement.permissions.companyManagement.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.bidManagement.permissions.companyManagement.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="bid-company-management" className="text-sm">Company Management</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="bid-participation" 
                          className="mr-2"
                          checked={modulePermissions.bidManagement.permissions.bidParticipation.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.bidManagement.permissions.bidParticipation.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="bid-participation" className="text-sm">Bid Participation</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="bid-doc-compilation" 
                          className="mr-2"
                          checked={modulePermissions.bidManagement.permissions.documentCompilationExports.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.bidManagement.permissions.documentCompilationExports.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="bid-doc-compilation" className="text-sm">Document Compilation & Exports</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Settings */}
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="module-settings" 
                        className="mr-2"
                        checked={modulePermissions.settings.selected}
                        onCheckedChange={(checked) => {
                          const newPermissions = {...modulePermissions};
                          newPermissions.settings.selected = !!checked;
                          Object.keys(newPermissions.settings.permissions).forEach(key => {
                            newPermissions.settings.permissions[key].selected = !!checked;
                          });
                          setModulePermissions(newPermissions);
                        }}
                      />
                      <Label htmlFor="module-settings">Settings</Label>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 pl-6 mt-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="settings-department" 
                          className="mr-2"
                          checked={modulePermissions.settings.permissions.department.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.settings.permissions.department.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="settings-department" className="text-sm">Department</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="settings-designation" 
                          className="mr-2"
                          checked={modulePermissions.settings.permissions.designation.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.settings.permissions.designation.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="settings-designation" className="text-sm">Designation</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="settings-role" 
                          className="mr-2"
                          checked={modulePermissions.settings.permissions.role.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.settings.permissions.role.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="settings-role" className="text-sm">Role</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="settings-user-management" 
                          className="mr-2"
                          checked={modulePermissions.settings.permissions.userManagement.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.settings.permissions.userManagement.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="settings-user-management" className="text-sm">User Management</Label>
                      </div>
                      

                    </div>
                  </div>
                  
                  {/* OEM Management */}
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="module-oem-management" 
                        className="mr-2"
                        checked={modulePermissions.oemManagement.selected}
                        onCheckedChange={(checked) => {
                          const newPermissions = {...modulePermissions};
                          newPermissions.oemManagement.selected = !!checked;
                          Object.keys(newPermissions.oemManagement.permissions).forEach(key => {
                            newPermissions.oemManagement.permissions[key].selected = !!checked;
                          });
                          setModulePermissions(newPermissions);
                        }}
                      />
                      <Label htmlFor="module-oem-management">OEM Management</Label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pl-6 mt-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="oem-dealer" 
                          className="mr-2"
                          checked={modulePermissions.oemManagement.permissions.dealer.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.oemManagement.permissions.dealer.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="oem-dealer" className="text-sm">Dealer</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="oem-oem" 
                          className="mr-2"
                          checked={modulePermissions.oemManagement.permissions.oem.selected}
                          onCheckedChange={(checked) => {
                            const newPermissions = {...modulePermissions};
                            newPermissions.oemManagement.permissions.oem.selected = !!checked;
                            setModulePermissions(newPermissions);
                          }}
                        />
                        <Label htmlFor="oem-oem" className="text-sm">OEM</Label>
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
                    onClick={saveRolePermissions}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// User Management Settings
function UserManagementSettings() {
  const { toast } = useToast();
  const { currentUser } = useUser();
  const queryClient = useQueryClient();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fetch departments, designations, and roles from the database API
  const { data: departmentsData = [] } = useQuery({
    queryKey: ['/api/departments'],
  });
  
  const { data: designationsData = [] } = useQuery({
    queryKey: ['/api/designations'],
  });
  
  const { data: rolesData = [] } = useQuery({
    queryKey: ['/api/roles'],
  });
  
  // Fetch users from database
  const { data: usersData = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/users'],
  });
  
  const [newUser, setNewUser] = useState({ 
    firstName: "",
    lastName: "",
    emailId: "",
    contactNo: "",
    password: "",
    state: "",
    city: "",
    designation: "",
    department: "",
    role: "",
    loginUserId: "",
    address: ""
  });
  
  // Filtered designations based on selected department
  const [filteredDesignations, setFilteredDesignations] = useState<any[]>([]);

  const [passwordVisible, setPasswordVisible] = useState(false);
  
  // Update filtered designations when department changes
  useEffect(() => {
    if (newUser.department && departmentsData && designationsData) {
      const selectedDepartment = departmentsData.find((dept: any) => dept.name === newUser.department);
      if (selectedDepartment) {
        const filtered = designationsData.filter((desig: any) => 
          desig.department_id === selectedDepartment.id && desig.status === "Active"
        );
        setFilteredDesignations(filtered);
      }
    } else {
      setFilteredDesignations([]);
    }
  }, [newUser.department, departmentsData, designationsData]);

  const handleCreateUser = async () => {
    // Validate required fields
    if (!newUser.firstName || 
        !newUser.lastName || 
        !newUser.emailId || 
        !newUser.contactNo || 
        !newUser.password || 
        !newUser.designation || 
        !newUser.department || 
        !newUser.role) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const fullName = `${newUser.firstName} ${newUser.lastName}`;
      const username = newUser.loginUserId || newUser.emailId.split('@')[0];
      
      // Prepare user data for API with explicit mapping for contact number
      const userData = {
        username: username,
        password: newUser.password,
        name: fullName,
        email: newUser.emailId,
        contactNo: newUser.contactNo, // Include as contactNo
        phone: newUser.contactNo,     // Also include as phone for database schema
        department: newUser.department,
        designation: newUser.designation,
        role: newUser.role,
        address: newUser.address,
        city: newUser.city,
        state: newUser.state,
        status: "Active"
      };
      
      console.log("Sending user data:", userData);
      
      // Save user to database via API
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      
      const createdUser = await response.json();
      console.log("Created user:", createdUser);
      
      // Refresh the users list
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      
      // Reset form
      setNewUser({
        firstName: "",
        lastName: "",
        emailId: "",
        contactNo: "",
        password: "",
        state: "",
        city: "",
        designation: "",
        department: "",
        role: "",
        loginUserId: "",
        address: ""
      });
      
      setIsCreateModalOpen(false);
      
      toast({
        title: "User Created",
        description: `${fullName} has been created successfully.`,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    
    const newStatus = selectedUser.status === "Active" ? "Inactive" : "Active";
    
    try {
      // Update user status in database
      await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      
      setIsConfirmModalOpen(false);
      setSelectedUser(null);
      
      toast({
        title: `User ${newStatus}`,
        description: `User has been ${newStatus.toLowerCase()} successfully.`,
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatusClick = (user: any) => {
    setSelectedUser(user);
    setIsConfirmModalOpen(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Implement search functionality here
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>User Management</CardTitle>
        </div>
        <Button className="gap-1 bg-[#0076a8] hover:bg-[#005e86]" onClick={() => {
          setIsCreateModalOpen(true);
        }}>
          <PlusCircle className="h-4 w-4" />
          Create User
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Input 
            className="max-w-xs" 
            placeholder="Search..." 
            onChange={handleSearch}
          />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#0076a8] text-white">
                <TableHead className="text-white">#</TableHead>
                <TableHead className="text-white">NAME</TableHead>
                <TableHead className="text-white">LOGIN USER ID</TableHead>
                <TableHead className="text-white">EMAIL ID</TableHead>
                <TableHead className="text-white">CONTACT NO</TableHead>
                <TableHead className="text-white">DEPARTMENT</TableHead>
                <TableHead className="text-white">DESIGNATION</TableHead>
                <TableHead className="text-white">ROLE NAME</TableHead>
                <TableHead className="text-white">CREATED DATE & TIME</TableHead>
                <TableHead className="text-white">STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingUsers ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10">
                    <div className="flex justify-center">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                usersData && usersData.map((user: any, index) => (
                  <TableRow key={user.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.contactNo || user.phone || 'N/A'}</TableCell>
                    <TableCell>{user.department || 'N/A'}</TableCell>
                    <TableCell>{user.designation || 'N/A'}</TableCell>
                    <TableCell>{user.role || 'N/A'}</TableCell>
                    <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${user.status === 'Inactive' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {user.status || 'Active'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Show</span>
            <select className="border rounded text-sm p-1">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              <span className="sr-only">Previous</span>
              <span className="h-4 w-4">«</span>
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-white">
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              <span className="sr-only">Next</span>
              <span className="h-4 w-4">»</span>
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Create User</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsCreateModalOpen(false)}
                className="h-8 w-8"
              >
                <span className="text-lg">×</span>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                <Input 
                  id="firstName" 
                  placeholder="First Name" 
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                <Input 
                  id="lastName" 
                  placeholder="Last Name" 
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="emailId" className="text-sm font-medium">Email ID *</Label>
                <Input 
                  id="emailId" 
                  placeholder="Email Id" 
                  type="email"
                  value={newUser.emailId}
                  onChange={(e) => setNewUser({...newUser, emailId: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="contactNo" className="text-sm font-medium">Contact No *</Label>
                <Input 
                  id="contactNo" 
                  placeholder="Contact No" 
                  value={newUser.contactNo}
                  onChange={(e) => setNewUser({...newUser, contactNo: e.target.value.replace(/[^0-9]/g, '')})}
                />
              </div>
              <div className="relative">
                <Label htmlFor="password" className="text-sm font-medium">Password *</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    placeholder="Password" 
                    type={passwordVisible ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  />
                  <button 
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {newUser.password.trim() === "" && (
                  <p className="text-xs text-red-500 mt-1">Password is required</p>
                )}
              </div>
              <div>
                <Label htmlFor="state" className="text-sm font-medium">State</Label>
                <select 
                  id="state" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newUser.state}
                  onChange={(e) => setNewUser({...newUser, state: e.target.value})}
                >
                  <option value="">Select State</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Assam">Assam</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Goa">Goa</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Sikkim">Sikkim</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                  <option value="Ladakh">Ladakh</option>
                  <option value="Lakshadweep">Lakshadweep</option>
                  <option value="Puducherry">Puducherry</option>
                </select>
              </div>
              <div>
                <Label htmlFor="city" className="text-sm font-medium">City</Label>
                <Input 
                  id="city" 
                  placeholder="Enter City" 
                  value={newUser.city}
                  onChange={(e) => setNewUser({...newUser, city: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="department" className="text-sm font-medium">Department *</Label>
                <select 
                  id="department" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newUser.department}
                  onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                >
                  <option value="">Select Department</option>
                  {departmentsData && departmentsData
                    .filter((dept: any) => dept.status === "Active")
                    .map((dept: any) => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))
                  }
                </select>
              </div>
              <div>
                <Label htmlFor="designation" className="text-sm font-medium">Designation *</Label>
                <select 
                  id="designation" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newUser.designation}
                  onChange={(e) => setNewUser({...newUser, designation: e.target.value})}
                >
                  <option value="">Select Designation</option>
                  {filteredDesignations.length > 0 ? (
                    filteredDesignations.map((designation: any) => (
                      <option key={designation.id} value={designation.name}>
                        {designation.name}
                      </option>
                    ))
                  ) : (
                    designationsData && designationsData
                      .filter((desig: any) => desig.status === "Active")
                      .map((desig: any) => (
                        <option key={desig.id} value={desig.name}>
                          {desig.name}
                        </option>
                      ))
                  )}
                </select>
              </div>
              <div>
                <Label htmlFor="role" className="text-sm font-medium">Role *</Label>
                <select 
                  id="role" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="">Select Role</option>
                  {rolesData && rolesData
                    .filter((role: any) => role.status === "Active")
                    .map((role: any) => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))
                  }
                </select>
              </div>
              <div>
                <Label htmlFor="loginUserId" className="text-sm font-medium">Login User Id *</Label>
                <Input 
                  id="loginUserId" 
                  placeholder="Login User Id" 
                  value={newUser.loginUserId}
                  onChange={(e) => setNewUser({...newUser, loginUserId: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address" className="text-sm font-medium">Address *</Label>
                <Input 
                  id="address" 
                  placeholder="Address" 
                  value={newUser.address}
                  onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-6">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-[#0076a8] hover:bg-[#005e86]"
                onClick={handleCreateUser}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Confirmation Modal */}
      {isConfirmModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 m-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Status Change</h3>
            <p>
              Are you sure you want to {selectedUser.status === "Active" ? "inactive" : "active"} this user?
            </p>
            <div className="flex justify-end space-x-3 pt-4 mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                className={selectedUser.status === "Active" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
                onClick={handleToggleStatus}
              >
                {selectedUser.status === "Active" ? "Inactive" : "Active"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}



// Profile Settings 
function ProfileSettings() {
  const [user, setUser] = useState({
    name: "Poonam Amale",
    email: "poonam@tender247.com",
    phone: "9811400654",
    department: "Management",
    designation: "Business Development Manager",
    role: "Admin",
    profileImage: ""
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editUser, setEditUser] = useState(user);
  
  const handleSaveProfile = () => {
    setUser(editUser);
    setIsEditing(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          View and update your profile information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl font-bold text-blue-500">{user.name.charAt(0)}</span>
              )}
            </div>
            
            {isEditing && (
              <Button variant="outline" size="sm">
                Change Photo
              </Button>
            )}
          </div>
          
          <div className="flex-1 space-y-4">
            {isEditing ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="profile-name">Full Name</Label>
                    <Input 
                      id="profile-name" 
                      value={editUser.name} 
                      onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-email">Email</Label>
                    <Input 
                      id="profile-email" 
                      type="email" 
                      value={editUser.email} 
                      onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-phone">Phone</Label>
                    <Input 
                      id="profile-phone" 
                      value={editUser.phone} 
                      onChange={(e) => setEditUser({...editUser, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-department">Department</Label>
                    <Input 
                      id="profile-department" 
                      value={editUser.department}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-designation">Designation</Label>
                    <Input 
                      id="profile-designation" 
                      value={editUser.designation}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-role">Role</Label>
                    <Input 
                      id="profile-role" 
                      value={editUser.role}
                      disabled
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                    <p className="mt-1">{user.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <p className="mt-1">{user.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                    <p className="mt-1">{user.phone}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
                    <p className="mt-1">{user.department}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Designation</h3>
                    <p className="mt-1">{user.designation}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                    <p className="mt-1">{user.role}</p>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Email Test Settings Component
function EmailTestSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Notification Test</CardTitle>
        <CardDescription>
          Test the email notification system for tender assignments and configure SMTP settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <EmailTest />
        </div>
      </CardContent>
    </Card>
  );
}

