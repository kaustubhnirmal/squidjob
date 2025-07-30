import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/user-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Pencil, Check, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ProfilePage() {
  const { currentUser, refreshUser } = useUser();
  const { toast } = useToast();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // User profile information state
  const [userInfo, setUserInfo] = useState({
    firstName: currentUser?.name?.split(' ')[0] || "Poonam",
    lastName: currentUser?.name?.split(' ')[1] || "Amale",
    email: currentUser?.email || "poonam@starinxs.com",
    contactNo: currentUser?.phone || "9673701295",
    address: currentUser?.address || "Krishna Green, Kolar Road",
    loginUserId: currentUser?.username || "poonam@123",
    city: currentUser?.city || "Bhopal",
    state: currentUser?.state || "Madhya Pradesh",
    // Company Information
    designation: currentUser?.designation || "Finance Executive",
    department: currentUser?.department || "Admin",
    role: currentUser?.role || "Admin",
    userType: "Internal"
  });

  // Update user info when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setUserInfo({
        firstName: currentUser.name?.split(' ')[0] || "Poonam",
        lastName: currentUser.name?.split(' ').slice(1).join(' ') || "Amale",
        email: currentUser.email || "poonam@starinxs.com",
        contactNo: currentUser.phone || "9673701295",
        address: currentUser.address || "Krishna Green, Kolar Road",
        loginUserId: currentUser.username || "poonam@123",
        city: currentUser.city || "Bhopal",
        state: currentUser.state || "Madhya Pradesh",
        designation: currentUser.designation || "Finance Executive",
        department: currentUser.department || "Admin",
        role: currentUser.role || "Admin",
        userType: "Internal"
      });
    }
  }, [currentUser]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!passwordForm.oldPassword) {
      newErrors.oldPassword = "Old password is required";
    }
    
    if (!passwordForm.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change for user info fields
  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo({
      ...userInfo,
      [name]: value
    });
  };

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedProfile: any) => {
      const res = await apiRequest("PUT", `/api/users/${currentUser?.id}`, updatedProfile);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
      setIsEditMode(false);
      refreshUser(); // Refresh user data after successful update
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit updated profile
  const handleProfileSubmit = () => {
    // Prepare updated profile data
    const updatedProfile = {
      name: `${userInfo.firstName} ${userInfo.lastName}`,
      email: userInfo.email,
      phone: userInfo.contactNo,
      address: userInfo.address,
      city: userInfo.city,
      state: userInfo.state,
    };

    updateProfileMutation.mutate(updatedProfile);
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditMode) {
      // If canceling, reset to original values
      setUserInfo({
        firstName: currentUser?.name?.split(' ')[0] || "Poonam",
        lastName: currentUser?.name?.split(' ').slice(1).join(' ') || "Amale",
        email: currentUser?.email || "poonam@starinxs.com",
        contactNo: currentUser?.phone || "9673701295",
        address: currentUser?.address || "Krishna Green, Kolar Road",
        loginUserId: currentUser?.username || "poonam@123",
        city: currentUser?.city || "Bhopal",
        state: currentUser?.state || "Madhya Pradesh",
        designation: currentUser?.designation || "Finance Executive",
        department: currentUser?.department || "Admin",
        role: currentUser?.role || "Admin",
        userType: "Internal"
      });
    }
    setIsEditMode(!isEditMode);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulating API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsPasswordModalOpen(false);
      
      // Reset form
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-gray-600">Manage your profile information</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="company">Company Information</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName"
                    name="firstName"
                    value={userInfo.firstName} 
                    onChange={handleInfoChange}
                    readOnly={!isEditMode} 
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName"
                    name="lastName"
                    value={userInfo.lastName} 
                    onChange={handleInfoChange}
                    readOnly={!isEditMode} 
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email ID</Label>
                  <Input 
                    id="email"
                    name="email"
                    value={userInfo.email} 
                    onChange={handleInfoChange}
                    readOnly={!isEditMode} 
                  />
                </div>
                <div>
                  <Label htmlFor="contactNo">Contact No</Label>
                  <Input 
                    id="contactNo"
                    name="contactNo"
                    value={userInfo.contactNo} 
                    onChange={handleInfoChange}
                    readOnly={!isEditMode} 
                  />
                </div>
                <div>
                  <Label htmlFor="loginUserId">Login User ID</Label>
                  <Input 
                    id="loginUserId"
                    name="loginUserId"
                    value={userInfo.loginUserId} 
                    readOnly 
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input 
                    id="state"
                    name="state"
                    value={userInfo.state} 
                    onChange={handleInfoChange}
                    readOnly={!isEditMode} 
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city"
                    name="city"
                    value={userInfo.city} 
                    onChange={handleInfoChange}
                    readOnly={!isEditMode} 
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address"
                    name="address"
                    value={userInfo.address} 
                    onChange={handleInfoChange}
                    readOnly={!isEditMode} 
                  />
                </div>
                {isEditMode ? (
                  <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={toggleEditMode}
                      className="flex items-center"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleProfileSubmit}
                      className="bg-[#0076a8] hover:bg-[#005e86] flex items-center"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="md:col-span-2 flex justify-end mt-4">
                    <Button 
                      onClick={toggleEditMode}
                      className="bg-[#0076a8] hover:bg-[#005e86] flex items-center"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="company" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Designation</Label>
                  <Input value={userInfo.designation} readOnly />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input value={userInfo.department} readOnly />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input value={userInfo.role} readOnly />
                </div>
                <div>
                  <Label>User Type</Label>
                  <Input value={userInfo.userType} readOnly />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="oldPassword">Current Password</Label>
                <Input 
                  id="oldPassword"
                  name="oldPassword"
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordChange}
                  className={errors.oldPassword ? "border-red-500" : ""}
                />
                {errors.oldPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.oldPassword}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input 
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className={errors.newPassword ? "border-red-500" : ""}
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setIsPasswordModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-[#0076a8] hover:bg-[#005e86]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function ChangePasswordModal() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulating API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsOpen(false);
      
      // Reset form
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });
    }, 1500);
  };
  
  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full justify-start px-2 gap-2"
      >
        Change Password
      </Button>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="oldPassword">Current Password</Label>
                <Input 
                  id="oldPassword"
                  name="oldPassword"
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input 
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-[#0076a8] hover:bg-[#005e86]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}