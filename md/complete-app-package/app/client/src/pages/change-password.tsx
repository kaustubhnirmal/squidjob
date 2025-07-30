import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/user-context";
import { Loader2 } from "lucide-react";
import { useLocation, Link } from "wouter";

export default function ChangePasswordPage() {
  const { toast } = useToast();
  const { currentUser } = useUser();
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!passwordForm.oldPassword) {
      newErrors.oldPassword = "Current password is required";
    }
    
    if (!passwordForm.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    
    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulating API call
    setTimeout(() => {
      setIsSubmitting(false);
      
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
        <h1 className="text-2xl font-bold">Change Password</h1>
        <p className="text-gray-600">Update your password</p>
      </div>
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="oldPassword">Current Password</Label>
              <Input 
                id="oldPassword"
                name="oldPassword"
                type="password"
                value={passwordForm.oldPassword}
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Link href="/">
                <Button 
                  type="button"
                  variant="outline" 
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </Link>
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
        </CardContent>
      </Card>
    </div>
  );
}