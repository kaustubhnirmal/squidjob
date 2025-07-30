import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/user-context';
import { 
  ArrowLeft, 
  Building2,
  Search,
  FileText,
  BarChart3,
  Users,
  Shield,
  Clock,
  EyeIcon,
  EyeOffIcon,
  Loader2,
  Mail
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import squidJobLogo from "@assets/SquidJob sml_1752393996294.png";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { setCurrentUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  
  const [credentials, setCredentials] = useState({
    userId: '',
    password: ''
  });

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('squidjob_saved_credentials');
    if (savedCredentials) {
      try {
        const parsed = JSON.parse(savedCredentials);
        setCredentials({
          userId: parsed.userId || '',
          password: parsed.password || ''
        });
        setRememberPassword(true);
      } catch (error) {
        console.error('Failed to parse saved credentials:', error);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.userId.trim() || !credentials.password.trim()) {
      toast({
        title: "Error",
        description: "Please enter both user ID and password",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.userId,
          password: credentials.password
        }),
      });
      
      if (response.ok) {
        const responseData = await response.json();
        const userData = responseData.user || responseData;
        
        // Store user data in localStorage and context
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("startender_user", JSON.stringify(userData));
        localStorage.setItem("token", responseData.token);
        setCurrentUser(userData);
        
        // Handle remember password functionality
        if (rememberPassword) {
          localStorage.setItem('squidjob_saved_credentials', JSON.stringify({
            userId: credentials.userId,
            password: credentials.password
          }));
        } else {
          localStorage.removeItem('squidjob_saved_credentials');
        }
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${userData.name || userData.username}!`,
        });
        
        // Add a small delay to ensure context is updated before navigation
        setTimeout(() => {
          setLocation('/sales-dashboard');
        }, 100);
      } else {
        const errorData = await response.json().catch(() => ({ 
          message: "Invalid user ID or password",
          type: "INVALID_CREDENTIALS"
        }));
        
        // Handle different error types with specific messages
        let errorMessage = "Please try again";
        let errorTitle = "Login Failed";
        
        if (errorData.type === "INVALID_CREDENTIALS") {
          errorMessage = "Please check your username and password";
        } else if (errorData.type === "SERVER_ERROR") {
          errorMessage = "Server is temporarily unavailable. Please try again later";
        } else if (errorData.type === "TIMEOUT_ERROR") {
          errorMessage = "Login request timed out. Please check your database connection and try again.";
          errorTitle = "Connection Timeout";
        } else if (errorData.type === "DATABASE_ERROR") {
          errorMessage = "Database connection error. Please check your database configuration and try again.";
          errorTitle = "Database Error";
        } else if (response.status === 400) {
          errorMessage = errorData.message || "Please fill in all required fields";
          errorTitle = "Missing Information";
        } else {
          errorMessage = errorData.message || "Invalid user ID or password";
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "An error occurred during login. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLanding = () => {
    setLocation("/");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsForgotPasswordLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Reset Link Sent",
          description: data.message,
        });
        setIsForgotPasswordOpen(false);
        setForgotPasswordEmail('');
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send reset link",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reset link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "Smart Search",
      description: "AI-powered tender discovery"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Document Management",
      description: "Organize all your files"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics",
      description: "Track your performance"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Work together seamlessly"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Platform",
      description: "Enterprise-grade security"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Real-time Tracking",
      description: "Monitor deadlines"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={squidJobLogo} alt="SquidJob" className="h-12 w-auto" />
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Tender Management
              </div>
            </div>
            <Button
              onClick={handleBackToLanding}
              variant="outline"
              className="flex items-center space-x-2 border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding and Features */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                BID MANAGEMENT SYSTEM
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Streamline your tender process with intelligent automation
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-white/50 rounded-lg border border-purple-100">
                  <div className="text-purple-600 mt-1">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* BMS Illustration */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
                <div className="text-white font-bold text-2xl">BMS</div>
              </div>
              <div className="flex justify-center lg:justify-start space-x-4 text-gray-400">
                <Building2 className="w-8 h-8" />
                <FileText className="w-8 h-8" />
                <BarChart3 className="w-8 h-8" />
                <Users className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-purple-200 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <img src={squidJobLogo} alt="SquidJob" className="h-12 w-auto mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In</h2>
                  <p className="text-gray-600">Access your tender management dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="userId" className="text-gray-700">User ID</Label>
                    <Input
                      id="userId"
                      name="userId"
                      type="text"
                      placeholder="Enter your user ID"
                      value={credentials.userId}
                      onChange={handleInputChange}
                      className="w-full border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={credentials.password}
                        onChange={handleInputChange}
                        className="w-full pr-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Password Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberPassword"
                      checked={rememberPassword}
                      onCheckedChange={setRememberPassword}
                      className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                    <Label
                      htmlFor="rememberPassword"
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      Remember my password
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 py-6 text-lg font-medium"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                  <p>Please enter your credentials to access the system</p>
                  <p className="text-xs mt-1 text-gray-500">Contact your administrator if you need login credentials</p>
                </div>

                <div className="mt-4 text-center">
                  <Button 
                    variant="link" 
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-purple-600 hover:text-purple-800 text-sm"
                  >
                    Forgot Password?
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 mt-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img src={squidJobLogo} alt="SquidJob" className="h-10 w-auto brightness-0 invert" />
                <div className="text-xl font-bold">SquidJob</div>
              </div>
              <p className="text-gray-400">
                Empowering businesses with intelligent tender management solutions.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Solutions</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Tender Search</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Bid Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Team Collaboration</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>SALES: +91 9512 247 247</li>
                <li>SUPPORT: +91 8000 263 450</li>
                <li>BIDDING SOLUTION: +91 9811 400 654</li>
                <li>support@squidjob.com</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SquidJob. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-purple-600">
              <Mail className="w-8 h-8 mx-auto mb-2" />
              Reset Password
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Address</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="Enter your registered email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
                disabled={isForgotPasswordLoading}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsForgotPasswordOpen(false)}
                disabled={isForgotPasswordLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isForgotPasswordLoading}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isForgotPasswordLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </div>
          </form>
          <div className="text-center text-sm text-gray-600 mt-4">
            <p>We'll send you a link to reset your password</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}