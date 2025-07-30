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
import { Pencil, X, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/hooks/use-user";

// Type definitions
interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
  status: string;
  contactNumber?: string;
  state?: string;
  city?: string;
  address?: string;
  userType?: string;
  designation?: string;
  departmentId?: number;
}

interface Role {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
  description?: string;
  status: string;
}

interface Designation {
  id: number;
  name: string;
  departmentId: number;
  description?: string;
  status: string;
}

export function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser: contextUser } = useUser();

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({ 
    name: "", 
    username: "", 
    email: "", 
    role: "", 
    status: "Active",
    contactNumber: "",
    state: "",
    city: "",
    address: "",
    userType: "",
    designation: "",
    departmentId: undefined
  });
  
  // State to track filtered designations based on selected department
  const [filteredDesignations, setFilteredDesignations] = useState<Designation[]>([]);
  const [password, setPassword] = useState("");

  // Fetch users
  const { 
    data: users = [], 
    isLoading: isLoadingUsers,
    error: usersError
  } = useQuery<User[]>({
    queryKey: ['/api/users'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch roles
  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['/api/roles'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch departments
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch designations
  const { data: designations = [] } = useQuery<Designation[]>({
    queryKey: ['/api/designations'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    return (
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Add user mutation - Server bypass approach
  const addUserMutation = useMutation({
    mutationFn: async (data: Partial<User> & { password: string }) => {
      console.log("=== USER CREATION WITH SERVER BYPASS ===");
      console.log("User data:", data);
      
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log("Success result:", result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsAddModalOpen(false);
      setNewUser({ 
        name: "", 
        username: "", 
        email: "", 
        role: "", 
        status: "Active",
        contactNumber: "",
        state: "",
        city: "",
        address: "",
        userType: "",
        designation: "",
        departmentId: undefined
      });
      setFilteredDesignations([]);
      setPassword("");
      toast({
        title: "Success",
        description: "User added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add user",
        variant: "destructive",
      });
    },
  });

  // Handle department change and filter designations
  const handleDepartmentChange = (departmentId: number) => {
    // Update user with selected department
    setNewUser({ ...newUser, departmentId, designation: "" });
    
    // Filter designations by the selected department
    const filtered = departmentId 
      ? designations.filter(d => d.departmentId === departmentId)
      : [];
    
    setFilteredDesignations(filtered);
  };

  // Handle add user
  const handleAddUser = () => {
    if (!newUser.name || !newUser.username || !newUser.email || !newUser.role || !password) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    // Transform data to match backend expectations
    // Find department name from departmentId
    const selectedDepartment = departments.find(d => d.id === newUser.departmentId);
    
    const userData = {
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      password: password,
      role: newUser.role,
      phone: newUser.contactNumber, // Transform contactNumber to phone
      department: selectedDepartment?.name || undefined, // Use department name, not ID
      designation: newUser.designation || undefined,
      state: newUser.state || undefined,
      city: newUser.city || undefined,
      address: newUser.address || undefined
    };

    console.log("Submitting user data:", userData);
    addUserMutation.mutate(userData);
  };

  // If loading
  if (isLoadingUsers) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // If error
  if (usersError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
        <p className="text-red-600">Failed to load users</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddModalOpen(true)}>
          <span className="mr-1">+</span> Add New User
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
                <TableHead>NAME</TableHead>
                <TableHead>USERNAME</TableHead>
                <TableHead>EMAIL</TableHead>
                <TableHead>ROLE</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="text-right">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className="text-center">{startIndex + index + 1}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.status === "Active" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          toast({
                            title: "Edit User",
                            description: `Editing user: ${user.name}`,
                          });
                        }}
                        className="text-blue-500"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-16 h-8 rounded border border-gray-300 px-2 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-700">
            Page {currentPage} of {Math.max(1, totalPages)}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 h-8"
            >
              Prev
            </Button>
            
            <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded min-w-[32px] text-center">
              {currentPage}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 h-8"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
      
      {/* Create User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Create User</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsAddModalOpen(false)}
                className="hover:bg-gray-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* First Name */}
              <div>
                <Label htmlFor="first-name" className="text-sm font-medium mb-1.5 flex items-center">
                  First Name <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Input 
                  id="first-name" 
                  placeholder="First Name" 
                  value={newUser.name ? newUser.name.split(' ')[0] : ''}
                  onChange={(e) => {
                    const firstName = e.target.value;
                    const lastName = newUser.name?.includes(' ') ? newUser.name.split(' ').slice(1).join(' ') : '';
                    setNewUser({...newUser, name: `${firstName}${lastName ? ' ' + lastName : ''}`});
                  }}
                  className="border-gray-300"
                />
              </div>
              
              {/* Last Name */}
              <div>
                <Label htmlFor="last-name" className="text-sm font-medium mb-1.5 flex items-center">
                  Last Name <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Input 
                  id="last-name" 
                  placeholder="Last Name"
                  value={newUser.name?.includes(' ') ? newUser.name.split(' ').slice(1).join(' ') : ''}
                  onChange={(e) => {
                    const firstName = newUser.name?.split(' ')[0] || '';
                    const lastName = e.target.value;
                    setNewUser({...newUser, name: `${firstName}${lastName ? ' ' + lastName : ''}`});
                  }}
                  className="border-gray-300"
                />
              </div>
              
              {/* Email ID */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium mb-1.5 flex items-center">
                  Email ID <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="Email Id" 
                  value={newUser.email || ''}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="border-gray-300"
                />
              </div>
              
              {/* Contact Number */}
              <div>
                <Label htmlFor="contactNumber" className="text-sm font-medium mb-1.5 flex items-center">
                  Contact No <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Input 
                  id="contactNumber" 
                  placeholder="Contact No" 
                  value={newUser.contactNumber || ""}
                  onChange={(e) => setNewUser({...newUser, contactNumber: e.target.value})}
                  className="border-gray-300"
                />
              </div>
              
              {/* Password */}
              <div>
                <Label htmlFor="password" className="text-sm font-medium mb-1.5 flex items-center">
                  Password <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-gray-300"
                />
              </div>
              
              {/* State */}
              <div>
                <Label htmlFor="state" className="text-sm font-medium mb-1.5">
                  State
                </Label>
                <Select 
                  value={newUser.state || ""}
                  onValueChange={(value) => setNewUser({...newUser, state: value})}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                    <SelectItem value="Arunachal Pradesh">Arunachal Pradesh</SelectItem>
                    <SelectItem value="Assam">Assam</SelectItem>
                    <SelectItem value="Bihar">Bihar</SelectItem>
                    <SelectItem value="Chhattisgarh">Chhattisgarh</SelectItem>
                    <SelectItem value="Goa">Goa</SelectItem>
                    <SelectItem value="Gujarat">Gujarat</SelectItem>
                    <SelectItem value="Haryana">Haryana</SelectItem>
                    <SelectItem value="Himachal Pradesh">Himachal Pradesh</SelectItem>
                    <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                    <SelectItem value="Karnataka">Karnataka</SelectItem>
                    <SelectItem value="Kerala">Kerala</SelectItem>
                    <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                    <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="Manipur">Manipur</SelectItem>
                    <SelectItem value="Meghalaya">Meghalaya</SelectItem>
                    <SelectItem value="Mizoram">Mizoram</SelectItem>
                    <SelectItem value="Nagaland">Nagaland</SelectItem>
                    <SelectItem value="Odisha">Odisha</SelectItem>
                    <SelectItem value="Punjab">Punjab</SelectItem>
                    <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                    <SelectItem value="Sikkim">Sikkim</SelectItem>
                    <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                    <SelectItem value="Telangana">Telangana</SelectItem>
                    <SelectItem value="Tripura">Tripura</SelectItem>
                    <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                    <SelectItem value="Uttarakhand">Uttarakhand</SelectItem>
                    <SelectItem value="West Bengal">West Bengal</SelectItem>
                    <SelectItem value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</SelectItem>
                    <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                    <SelectItem value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Jammu and Kashmir">Jammu and Kashmir</SelectItem>
                    <SelectItem value="Ladakh">Ladakh</SelectItem>
                    <SelectItem value="Lakshadweep">Lakshadweep</SelectItem>
                    <SelectItem value="Puducherry">Puducherry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* City */}
              <div>
                <Label htmlFor="city" className="text-sm font-medium mb-1.5">
                  City
                </Label>
                <Select 
                  value={newUser.city || ""}
                  onValueChange={(value) => setNewUser({...newUser, city: value})}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ahmedabad">Ahmedabad</SelectItem>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                    <SelectItem value="Chennai">Chennai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Department */}
              <div>
                <Label htmlFor="department" className="text-sm font-medium mb-1.5 flex items-center">
                  Department <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Select 
                  value={newUser.departmentId ? String(newUser.departmentId) : ""}
                  onValueChange={(value) => handleDepartmentChange(Number(value))}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={String(department.id)}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Role */}
              <div>
                <Label htmlFor="role" className="text-sm font-medium mb-1.5 flex items-center">
                  Role <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Select 
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({...newUser, role: value})}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* User Type */}
              <div>
                <Label htmlFor="userType" className="text-sm font-medium mb-1.5 flex items-center">
                  User Type<span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Select 
                  value={newUser.userType}
                  onValueChange={(value) => setNewUser({...newUser, userType: value})}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select User Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="User">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Login User Id */}
              <div>
                <Label htmlFor="username" className="text-sm font-medium mb-1.5 flex items-center">
                  Login User Id<span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Input 
                  id="username" 
                  placeholder="Login User Id" 
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="border-gray-300"
                />
              </div>
              
              {/* Designation */}
              <div>
                <Label htmlFor="designation" className="text-sm font-medium mb-1.5 flex items-center">
                  Designation <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Select 
                  value={newUser.designation || ""}
                  onValueChange={(value) => setNewUser({...newUser, designation: value})}
                  disabled={filteredDesignations.length === 0}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select Designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDesignations.map((designation) => (
                      <SelectItem key={designation.id} value={designation.name}>
                        {designation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Address - Full Width */}
              <div className="col-span-2">
                <Label htmlFor="address" className="text-sm font-medium mb-1.5 flex items-center">
                  Address <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Input 
                  id="address" 
                  placeholder="Address" 
                  value={newUser.address || ""}
                  onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                  className="border-gray-300"
                />
              </div>
              
              {/* Buttons */}
              <div className="col-span-2 flex justify-start space-x-2 mt-4">
                <Button 
                  onClick={handleAddUser}
                  disabled={addUserMutation.isPending}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-6"
                >
                  {addUserMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                  ) : (
                    'Submit'
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)} 
                  disabled={addUserMutation.isPending}
                  className="border-gray-300 px-6"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}