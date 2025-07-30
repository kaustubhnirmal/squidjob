import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  EyeIcon,
  EyeOffIcon,
  Loader2,
  Key,
  CheckCircle
} from "lucide-react";
import squidJobLogo from "@assets/SquidJob sml_1752393996294.png";

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(search);
    const tokenFromUrl = searchParams.get('token');
    
    if (!tokenFromUrl) {
      toast({
        title: "Invalid Reset Link",
        description: "The password reset link is invalid or has expired.",
        variant: "destructive",
      });
      setLocation('/login');
      return;
    }
    
    setToken(tokenFromUrl);
  }, [search, toast, setLocation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = (field: 'password' | 'confirm') => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwords.newPassword.trim() || !passwords.confirmPassword.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please ensure both passwords are identical",
        variant: "destructive",
      });
      return;
    }

    if (passwords.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: passwords.newPassword
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: "Password Reset Successful",
          description: "Your password has been updated successfully",
        });
      } else {
        toast({
          title: "Reset Failed",
          description: data.message || "Failed to reset password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setLocation("/login");
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <img src={squidJobLogo} alt="SquidJob" className="h-12 w-auto" />
            </div>
            <CardTitle className="text-center text-purple-600">
              <CheckCircle className="w-12 h-12 mx-auto mb-2" />
              Password Reset Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-gray-600">
              <p>Your password has been successfully updated.</p>
              <p className="mt-2">You can now log in with your new password.</p>
            </div>
            <Button 
              onClick={handleBackToLogin}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Continue to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={squidJobLogo} alt="SquidJob" className="h-8 w-auto" />
            <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              SquidJob
            </div>
          </div>
          <Button variant="ghost" onClick={handleBackToLogin} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-purple-600">
                <Key className="w-8 h-8 mx-auto mb-2" />
                Reset Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwords.newPassword}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                      required
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => togglePasswordVisibility('password')}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwords.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm new password"
                      required
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showConfirmPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 mr-2" />
                      Update Password
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600">
                <p>Password must be at least 8 characters long</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}