import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from '@/user-context';
import { 
  Search, 
  Play, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  Award, 
  TrendingUp,
  FileText,
  Eye,
  PenTool,
  Send,
  BarChart3,
  Building2,
  Shield,
  Clock,
  Target,
  Loader2,
  Menu,
  X
} from "lucide-react";
import squidJobLogo from "@assets/SquidJob sml_1752393996294.png";
import heroImage from "@assets/20250713_2339_Ecstatic Purple Squid Worker_simple_compose_01k02fjgb1endr95cehs51r857_1752432591996.png";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [dominantColors, setDominantColors] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: ""
  });

  // Load saved credentials when modal opens
  useEffect(() => {
    if (isLoginOpen) {
      const savedCredentials = localStorage.getItem('squidjob_saved_credentials');
      if (savedCredentials) {
        try {
          const parsed = JSON.parse(savedCredentials);
          setLoginForm({
            username: parsed.userId || '',
            password: parsed.password || ''
          });
          setRememberPassword(true);
        } catch (error) {
          console.error('Failed to parse saved credentials:', error);
        }
      }
    }
  }, [isLoginOpen]);
  const { toast } = useToast();
  const { setCurrentUser } = useUser();

  // Function to extract dominant colors from image
  const extractDominantColors = (imageElement: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return [];

    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    // Set canvas size to match image
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;

    // Draw image to canvas
    ctx.drawImage(imageElement, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Color frequency map
    const colorCounts: { [key: string]: number } = {};
    const sampleStep = 10; // Sample every 10th pixel for performance

    for (let i = 0; i < data.length; i += 4 * sampleStep) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Skip transparent pixels
      if (a < 128) continue;

      // Group similar colors to reduce noise
      const rGroup = Math.floor(r / 20) * 20;
      const gGroup = Math.floor(g / 20) * 20;
      const bGroup = Math.floor(b / 20) * 20;

      const colorKey = `${rGroup},${gGroup},${bGroup}`;
      colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
    }

    // Sort colors by frequency and convert to hex
    const sortedColors = Object.entries(colorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([color]) => {
        const [r, g, b] = color.split(',').map(Number);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      });

    return sortedColors;
  };

  // Effect to extract colors when image loads
  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;

    const handleImageLoad = () => {
      const colors = extractDominantColors(img);
      setDominantColors(colors);
      
      // Apply dynamic background
      if (colors.length > 0) {
        const primaryColor = colors[0];
        const secondaryColor = colors[1] || colors[0];
        
        // Create a subtle gradient background
        document.body.style.background = `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}10, white)`;
      }
    };

    if (img.complete) {
      handleImageLoad();
    } else {
      img.addEventListener('load', handleImageLoad);
      return () => img.removeEventListener('load', handleImageLoad);
    }
  }, []);

  // Cleanup background on unmount
  useEffect(() => {
    return () => {
      document.body.style.background = '';
    };
  }, []);

  const handleGetStarted = () => {
    setIsLoginOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, open login modal. In a real app, this would search tenders
    setIsLoginOpen(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store user data in localStorage and context
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("startender_user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        setCurrentUser(data.user);

        // Handle remember password functionality
        if (rememberPassword) {
          localStorage.setItem('squidjob_saved_credentials', JSON.stringify({
            userId: loginForm.username,
            password: loginForm.password
          }));
        } else {
          localStorage.removeItem('squidjob_saved_credentials');
        }
        
        // Show success message
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.user.name || data.user.username}!`,
        });

        // Close modal first
        setIsLoginOpen(false);
        
        // Add a small delay to ensure context is updated before navigation
        setTimeout(() => {
          setLocation("/sales-dashboard");
        }, 100);
      } else {
        const errorData = await response.json();
        
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
          errorMessage = errorData.message || "Invalid username or password";
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const features = [
    {
      icon: <Search className="w-8 h-8" />,
      title: "Smart Tender Search",
      description: "AI-powered search to find the most relevant tenders for your business"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Document Management",
      description: "Organize and manage all your tender documents in one secure place"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics & Insights",
      description: "Get detailed analytics on your bidding performance and success rates"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Collaboration",
      description: "Work seamlessly with your team on tender preparations and submissions"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Platform",
      description: "Enterprise-grade security to protect your sensitive business information"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Real-time Tracking",
      description: "Track tender deadlines and status updates in real-time"
    }
  ];

  const steps = [
    {
      number: "01",
      icon: <Search className="w-8 h-8" />,
      title: "Search for Tenders",
      description: "Browse thousands of live tenders with advanced filtering by department, location, value, and deadlines. Our AI-powered search helps you find the most relevant opportunities for your business.",
      mockup: (
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <rect width="400" height="300" fill="#f8fafc" rx="8"/>
          <rect x="20" y="20" width="360" height="40" fill="white" rx="6" stroke="#e2e8f0"/>
          <circle cx="35" cy="40" r="6" fill="#7c3aed"/>
          <rect x="50" y="35" width="200" height="10" fill="#e2e8f0" rx="2"/>
          <rect x="320" y="30" width="50" height="20" fill="#7c3aed" rx="4"/>
          <rect x="20" y="80" width="100" height="180" fill="white" rx="6" stroke="#e2e8f0"/>
          <rect x="30" y="95" width="80" height="8" fill="#7c3aed" rx="2"/>
          <rect x="30" y="110" width="60" height="6" fill="#cbd5e1" rx="2"/>
          <rect x="30" y="125" width="70" height="6" fill="#cbd5e1" rx="2"/>
          <rect x="140" y="80" width="240" height="60" fill="white" rx="6" stroke="#e2e8f0"/>
          <rect x="150" y="95" width="120" height="8" fill="#1e293b" rx="2"/>
          <rect x="150" y="110" width="200" height="6" fill="#64748b" rx="2"/>
          <rect x="150" y="125" width="80" height="6" fill="#10b981" rx="2"/>
          <rect x="140" y="160" width="240" height="60" fill="white" rx="6" stroke="#e2e8f0"/>
          <rect x="150" y="175" width="140" height="8" fill="#1e293b" rx="2"/>
          <rect x="150" y="190" width="180" height="6" fill="#64748b" rx="2"/>
          <rect x="150" y="205" width="60" height="6" fill="#f59e0b" rx="2"/>
          <rect x="140" y="240" width="240" height="60" fill="white" rx="6" stroke="#e2e8f0"/>
          <rect x="150" y="255" width="110" height="8" fill="#1e293b" rx="2"/>
          <rect x="150" y="270" width="160" height="6" fill="#64748b" rx="2"/>
          <rect x="150" y="285" width="90" height="6" fill="#ef4444" rx="2"/>
        </svg>
      ),
      alt: "Modern tender search interface mockup"
    },
    {
      number: "02",
      icon: <Eye className="w-8 h-8" />,
      title: "Review Tender Details",
      description: "Access comprehensive tender information including requirements, eligibility criteria, documents, and submission guidelines. Analyze each opportunity thoroughly before proceeding.",
      mockup: (
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <rect width="400" height="300" fill="#f8fafc" rx="8"/>
          <rect x="20" y="20" width="360" height="50" fill="white" rx="6" stroke="#e2e8f0"/>
          <rect x="30" y="35" width="200" height="12" fill="#1e293b" rx="2"/>
          <rect x="30" y="52" width="150" height="8" fill="#64748b" rx="2"/>
          <rect x="280" y="30" width="80" height="20" fill="#10b981" rx="4"/>
          <rect x="20" y="90" width="180" height="190" fill="white" rx="6" stroke="#e2e8f0"/>
          <rect x="30" y="105" width="120" height="10" fill="#7c3aed" rx="2"/>
          <rect x="30" y="125" width="160" height="6" fill="#64748b" rx="2"/>
          <rect x="30" y="140" width="140" height="6" fill="#64748b" rx="2"/>
          <rect x="30" y="155" width="120" height="6" fill="#64748b" rx="2"/>
          <rect x="30" y="180" width="100" height="8" fill="#7c3aed" rx="2"/>
          <rect x="30" y="200" width="150" height="6" fill="#64748b" rx="2"/>
          <rect x="30" y="215" width="130" height="6" fill="#64748b" rx="2"/>
          <rect x="30" y="240" width="80" height="8" fill="#7c3aed" rx="2"/>
          <rect x="30" y="260" width="120" height="6" fill="#64748b" rx="2"/>
          <rect x="220" y="90" width="160" height="190" fill="white" rx="6" stroke="#e2e8f0"/>
          <rect x="230" y="105" width="100" height="10" fill="#7c3aed" rx="2"/>
          <rect x="230" y="125" width="140" height="30" fill="#f1f5f9" rx="4" stroke="#e2e8f0"/>
          <rect x="240" y="135" width="40" height="10" fill="#7c3aed" rx="2"/>
          <rect x="230" y="170" width="140" height="30" fill="#f1f5f9" rx="4" stroke="#e2e8f0"/>
          <rect x="240" y="180" width="50" height="10" fill="#7c3aed" rx="2"/>
          <rect x="230" y="215" width="140" height="30" fill="#f1f5f9" rx="4" stroke="#e2e8f0"/>
          <rect x="240" y="225" width="60" height="10" fill="#7c3aed" rx="2"/>
          <rect x="230" y="260" width="80" height="15" fill="#7c3aed" rx="4"/>
        </svg>
      ),
      alt: "Tender details review interface mockup"
    },
    {
      number: "03",
      icon: <PenTool className="w-8 h-8" />,
      title: "Prepare Documentation",
      description: "Use our intelligent checklist system to organize and prepare all required bid documents. Upload responses, manage technical specifications, and ensure compliance with all requirements.",
      mockup: (
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <rect width="400" height="300" fill="#f8fafc" rx="8"/>
          <rect x="40" y="40" width="320" height="220" fill="white" rx="8" stroke="#e2e8f0"/>
          <rect x="60" y="60" width="180" height="12" fill="#1e293b" rx="2"/>
          <rect x="60" y="80" width="120" height="8" fill="#64748b" rx="2"/>
          <rect x="300" y="55" width="20" height="20" fill="#ef4444" rx="4"/>
          <rect x="60" y="110" width="280" height="25" fill="#f8fafc" rx="4" stroke="#e2e8f0"/>
          <circle cx="75" cy="122" r="5" fill="#10b981"/>
          <path d="M72 122 L74 124 L78 120" stroke="white" strokeWidth="1.5" fill="none"/>
          <rect x="90" y="118" width="150" height="8" fill="#1e293b" rx="2"/>
          <rect x="250" y="115" width="60" height="14" fill="#7c3aed" rx="4"/>
          <rect x="60" y="145" width="280" height="25" fill="#f8fafc" rx="4" stroke="#e2e8f0"/>
          <circle cx="75" cy="157" r="5" fill="#10b981"/>
          <path d="M72 157 L74 159 L78 155" stroke="white" strokeWidth="1.5" fill="none"/>
          <rect x="90" y="153" width="120" height="8" fill="#1e293b" rx="2"/>
          <rect x="250" y="150" width="60" height="14" fill="#7c3aed" rx="4"/>
          <rect x="60" y="180" width="280" height="25" fill="#f8fafc" rx="4" stroke="#e2e8f0"/>
          <circle cx="75" cy="192" r="5" fill="#cbd5e1"/>
          <rect x="90" y="188" width="140" height="8" fill="#1e293b" rx="2"/>
          <rect x="250" y="185" width="60" height="14" fill="#e2e8f0" rx="4"/>
          <rect x="60" y="215" width="280" height="25" fill="#f8fafc" rx="4" stroke="#e2e8f0"/>
          <circle cx="75" cy="227" r="5" fill="#cbd5e1"/>
          <rect x="90" y="223" width="160" height="8" fill="#1e293b" rx="2"/>
          <rect x="250" y="220" width="60" height="14" fill="#e2e8f0" rx="4"/>
        </svg>
      ),
      alt: "Document preparation checklist interface mockup"
    },
    {
      number: "04",
      icon: <Send className="w-8 h-8" />,
      title: "Submit Your Bid",
      description: "Generate comprehensive bid responses with our automated system. Create professional proposal packages and submit them securely through our platform.",
      mockup: (
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <rect width="400" height="300" fill="#f8fafc" rx="8"/>
          <rect x="20" y="20" width="360" height="260" fill="white" rx="8" stroke="#e2e8f0"/>
          <rect x="40" y="40" width="180" height="12" fill="#1e293b" rx="2"/>
          <rect x="40" y="60" width="100" height="8" fill="#64748b" rx="2"/>
          <rect x="40" y="90" width="320" height="40" fill="#f8fafc" rx="6" stroke="#e2e8f0"/>
          <rect x="50" y="105" width="60" height="10" fill="#7c3aed" rx="2"/>
          <rect x="120" y="102" width="200" height="16" fill="#f1f5f9" rx="4" stroke="#e2e8f0"/>
          <rect x="330" y="100" width="20" height="20" fill="#7c3aed" rx="4"/>
          <rect x="40" y="145" width="320" height="40" fill="#f8fafc" rx="6" stroke="#e2e8f0"/>
          <rect x="50" y="160" width="80" height="10" fill="#7c3aed" rx="2"/>
          <rect x="140" y="157" width="180" height="16" fill="#f1f5f9" rx="4" stroke="#e2e8f0"/>
          <rect x="330" y="155" width="20" height="20" fill="#7c3aed" rx="4"/>
          <rect x="40" y="200" width="320" height="40" fill="#f8fafc" rx="6" stroke="#e2e8f0"/>
          <rect x="50" y="215" width="70" height="10" fill="#7c3aed" rx="2"/>
          <rect x="130" y="212" width="190" height="16" fill="#f1f5f9" rx="4" stroke="#e2e8f0"/>
          <rect x="330" y="210" width="20" height="20" fill="#7c3aed" rx="4"/>
          <rect x="280" y="250" width="80" height="25" fill="#10b981" rx="6"/>
          <rect x="295" y="258" width="50" height="9" fill="white" rx="2"/>
          <circle cx="340" cy="262" r="6" fill="white"/>
          <path d="M337 262 L339 264 L343 260" stroke="#10b981" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      alt: "Bid submission interface mockup"
    },
    {
      number: "05",
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Track & Follow-up",
      description: "Monitor your submitted bids and active tenders in real-time. Track deadlines, status updates, and manage your tender pipeline effectively from your personalized dashboard.",
      mockup: (
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <rect width="400" height="300" fill="#f8fafc" rx="8"/>
          <rect x="20" y="20" width="360" height="40" fill="white" rx="6" stroke="#e2e8f0"/>
          <rect x="30" y="35" width="80" height="10" fill="#7c3aed" rx="2"/>
          <rect x="120" y="30" width="60" height="20" fill="#f1f5f9" rx="4" stroke="#e2e8f0"/>
          <rect x="190" y="30" width="60" height="20" fill="#f1f5f9" rx="4" stroke="#e2e8f0"/>
          <rect x="260" y="30" width="60" height="20" fill="#7c3aed" rx="4"/>
          <rect x="20" y="80" width="360" height="50" fill="white" rx="6" stroke="#e2e8f0"/>
          <rect x="30" y="95" width="120" height="10" fill="#1e293b" rx="2"/>
          <rect x="30" y="110" width="80" height="8" fill="#64748b" rx="2"/>
          <rect x="300" y="90" width="60" height="15" fill="#10b981" rx="4"/>
          <rect x="305" y="95" width="50" height="5" fill="white" rx="2"/>
          <rect x="300" y="110" width="30" height="8" fill="#64748b" rx="2"/>
          <rect x="20" y="150" width="360" height="50" fill="white" rx="6" stroke="#e2e8f0"/>
          <rect x="30" y="165" width="140" height="10" fill="#1e293b" rx="2"/>
          <rect x="30" y="180" width="100" height="8" fill="#64748b" rx="2"/>
          <rect x="300" y="160" width="60" height="15" fill="#f59e0b" rx="4"/>
          <rect x="305" y="165" width="50" height="5" fill="white" rx="2"/>
          <rect x="300" y="180" width="40" height="8" fill="#64748b" rx="2"/>
          <rect x="20" y="220" width="360" height="50" fill="white" rx="6" stroke="#e2e8f0"/>
          <rect x="30" y="235" width="110" height="10" fill="#1e293b" rx="2"/>
          <rect x="30" y="250" width="90" height="8" fill="#64748b" rx="2"/>
          <rect x="300" y="230" width="60" height="15" fill="#ef4444" rx="4"/>
          <rect x="305" y="235" width="50" height="5" fill="white" rx="2"/>
          <rect x="300" y="250" width="50" height="8" fill="#64748b" rx="2"/>
        </svg>
      ),
      alt: "Tender tracking dashboard mockup"
    },
    {
      number: "06",
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics Advantage",
      description: "Gain valuable insights with comprehensive analytics and reporting. Track your bidding performance, success rates, and identify opportunities for improvement.",
      mockup: (
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <rect width="400" height="300" fill="#f8fafc" rx="8"/>
          <rect x="20" y="20" width="170" height="120" fill="white" rx="6" stroke="#e2e8f0"/>
          <rect x="30" y="30" width="80" height="10" fill="#7c3aed" rx="2"/>
          <rect x="30" y="50" width="30" height="8" fill="#64748b" rx="2"/>
          <rect x="30" y="70" width="150" height="60" fill="#f8fafc" rx="4"/>
          <rect x="40" y="110" width="15" height="15" fill="#7c3aed" rx="2"/>
          <rect x="60" y="105" width="15" height="20" fill="#10b981" rx="2"/>
          <rect x="80" y="95" width="15" height="30" fill="#f59e0b" rx="2"/>
          <rect x="100" y="85" width="15" height="40" fill="#ef4444" rx="2"/>
          <rect x="120" y="100" width="15" height="25" fill="#06b6d4" rx="2"/>
          <rect x="140" y="90" width="15" height="35" fill="#8b5cf6" rx="2"/>
          <rect x="210" y="20" width="170" height="120" fill="white" rx="6" stroke="#e2e8f0"/>
          <rect x="220" y="30" width="100" height="10" fill="#7c3aed" rx="2"/>
          <rect x="220" y="50" width="40" height="8" fill="#64748b" rx="2"/>
          <circle cx="295" cy="90" r="35" fill="none" stroke="#e2e8f0" strokeWidth="8"/>
          <circle cx="295" cy="90" r="35" fill="none" stroke="#7c3aed" strokeWidth="8" strokeDasharray="75 200" strokeDashoffset="25"/>
          <rect x="340" y="85" width="30" height="10" fill="#1e293b" rx="2"/>
          <rect x="20" y="160" width="360" height="120" fill="white" rx="6" stroke="#e2e8f0"/>
          <rect x="30" y="170" width="120" height="10" fill="#7c3aed" rx="2"/>
          <rect x="30" y="190" width="60" height="8" fill="#64748b" rx="2"/>
          <rect x="30" y="210" width="340" height="60" fill="#f8fafc" rx="4"/>
          <path d="M40 250 L80 230 L120 240 L160 220 L200 225 L240 210 L280 215 L320 200 L360 205" stroke="#7c3aed" strokeWidth="3" fill="none"/>
          <circle cx="80" cy="230" r="3" fill="#7c3aed"/>
          <circle cx="160" cy="220" r="3" fill="#7c3aed"/>
          <circle cx="240" cy="210" r="3" fill="#7c3aed"/>
          <circle cx="320" cy="200" r="3" fill="#7c3aed"/>
        </svg>
      ),
      alt: "Analytics dashboard mockup with charts and graphs"
    }
  ];

  const stats = [
    { value: "10,000+", label: "Active Tenders" },
    { value: "5,000+", label: "Successful Bids" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Hidden canvas for color extraction */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      

      
      {/* Header */}
      <header className="bg-white border-b border-purple-100 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={squidJobLogo} alt="SquidJob" className="h-14 w-auto" />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">How it Works</a>
              <a href="#contact" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">Contact</a>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => setIsLoginOpen(true)}
                  className="border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                >
                  Get Started
                </Button>
              </div>
            </nav>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <a href="#features" className="w-full">Features</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="#how-it-works" className="w-full">How it Works</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="#contact" className="w-full">Contact</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Button 
                      variant="outline"
                      onClick={() => setIsLoginOpen(true)}
                      className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
                    >
                      Sign In
                    </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Button 
                      onClick={handleGetStarted}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                    >
                      Get Started
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background Smoke */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl animate-smoke-float"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-smoke-expand" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-purple-300/15 to-blue-300/15 rounded-full blur-3xl animate-smoke-float" style={{ animationDelay: '4s' }}></div>
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-smoke-expand" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-300/15 to-purple-300/15 rounded-full blur-3xl animate-smoke-float" style={{ animationDelay: '3s' }}></div>
        </div>
        
        {/* Hero Image - Stretched with Dynamic Gradients */}
        <div className="relative w-full">
          <div className="relative">
            <img
              ref={imageRef}
              src={heroImage}
              alt="SquidJob Tender Management - AI-Powered Bidding Platform"
              className="w-full object-cover"
              style={{ 
                backgroundColor: 'transparent',
                height: '80vh',
                objectPosition: 'center center'
              }}
              crossOrigin="anonymous"
            />
            

            
            {/* Dynamic gradient overlays based on extracted colors */}
            {dominantColors.length > 0 && (
              <>
                {/* Left side dynamic gradient */}
                <div className="absolute inset-y-0 left-0 w-1/4 overflow-hidden">
                  <div 
                    className="absolute inset-0 animate-cloud-drift"
                    style={{
                      background: `linear-gradient(to right, ${dominantColors[0]}40, ${dominantColors[1] || dominantColors[0]}20, transparent)`
                    }}
                  ></div>
                  <div 
                    className="absolute inset-0 animate-cloud-drift-reverse"
                    style={{
                      background: `linear-gradient(to right, white, ${dominantColors[0]}10, transparent)`,
                      animationDelay: '2s'
                    }}
                  ></div>
                  <div 
                    className="absolute inset-0 animate-cloud-drift"
                    style={{
                      background: `linear-gradient(to right, #7c3aed20, rgba(255,255,255,0.1), transparent)`,
                      animationDelay: '4s'
                    }}
                  ></div>
                </div>
                
                {/* Right side dynamic gradient */}
                <div className="absolute inset-y-0 right-0 w-1/4 overflow-hidden">
                  <div 
                    className="absolute inset-0 animate-cloud-drift"
                    style={{
                      background: `linear-gradient(to left, ${dominantColors[0]}40, ${dominantColors[1] || dominantColors[0]}20, transparent)`
                    }}
                  ></div>
                  <div 
                    className="absolute inset-0 animate-cloud-drift-reverse"
                    style={{
                      background: `linear-gradient(to left, white, ${dominantColors[0]}10, transparent)`,
                      animationDelay: '3s'
                    }}
                  ></div>
                  <div 
                    className="absolute inset-0 animate-cloud-drift"
                    style={{
                      background: `linear-gradient(to left, #7c3aed20, rgba(255,255,255,0.1), transparent)`,
                      animationDelay: '1s'
                    }}
                  ></div>
                </div>
              </>
            )}
            
            {/* Glass Effect Card - Right Side */}
            <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8 lg:right-12 z-10">
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl border border-white/30 backdrop-saturate-150 backdrop-contrast-110 w-72 sm:w-80 md:w-96 lg:w-[400px] max-w-[90vw]" style={{ 
                backdropFilter: 'blur(24px) saturate(180%) contrast(120%)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.15))',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
              }}>
                {/* Main Headline */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold mb-6 leading-tight relative">
                  <span className="relative inline-block">
                    {/* White glow layers behind text - perfectly aligned */}
                    <span className="absolute top-0 left-0 text-white blur-sm opacity-60" style={{ transform: 'scale(1.02)' }}>
                      HAVE A HASSLE FREE TENDER MANAGEMENT
                    </span>
                    <span className="absolute top-0 left-0 text-white blur-md opacity-40" style={{ transform: 'scale(1.04)' }}>
                      HAVE A HASSLE FREE TENDER MANAGEMENT
                    </span>
                    <span className="absolute top-0 left-0 text-white blur-lg opacity-30" style={{ transform: 'scale(1.06)' }}>
                      HAVE A HASSLE FREE TENDER MANAGEMENT
                    </span>
                    {/* Original gradient text on top */}
                    <span className="relative z-10 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                      HAVE A HASSLE FREE TENDER MANAGEMENT
                    </span>
                  </span>
                </h1>
                
                {/* CTA Button */}
                <div className="flex flex-col gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    className="border-2 border-purple-600 text-purple-600 px-6 py-3 md:px-8 md:py-4 rounded-xl text-base md:text-lg font-medium hover:bg-purple-50 transition-all w-full"
                  >
                    <Play className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    See how it works
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Simplified Content Below Hero */}
        <div className="relative py-8 z-10">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <p className="text-xl md:text-2xl text-gray-700 mb-6">
                Experience with our end to end management system
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-gray-600 font-medium text-sm">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              Shaping Success Stories with
              <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Smart Bidding Strategies
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how our innovative approach helps bidders secure winning bids and achieve excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="text-purple-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              6 STEPS TO BID & WIN
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50 overflow-hidden">
                <div className="relative">
                  <div className="text-4xl font-bold text-purple-600 absolute top-4 left-4 z-10 bg-white/90 rounded-full w-12 h-12 flex items-center justify-center">
                    {step.number}
                  </div>
                  <div className="w-full h-48 group-hover:scale-105 transition-transform duration-300">
                    {step.mockup}
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="text-purple-600 group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                    {step.description}
                  </p>
                  <div className="text-center">
                    <Button variant="outline" size="sm" className="text-purple-600 border-purple-600 hover:bg-purple-50">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto text-center">
          <div className="mb-12">
            <Badge variant="outline" className="text-white border-white/30 mb-4">
              Where Trust Meets Excellence
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              SquidJob: Empowering Top Companies with Confidence
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-80">
            {/* Placeholder for company logos */}
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-4 h-16 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white/60" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              Ready to Transform Your
              <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Bidding Strategy?
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of successful businesses using our platform to win more tenders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-6 rounded-xl text-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-purple-600 text-purple-600 px-10 py-6 rounded-xl text-lg font-medium hover:bg-purple-50 transition-all"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16 px-4">
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

      {/* Login Modal */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <img src={squidJobLogo} alt="SquidJob" className="h-8 w-auto" />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Sign In
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={loginForm.username}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={loginForm.password}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
            
            {/* Remember Password Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberPasswordModal"
                checked={rememberPassword}
                onCheckedChange={setRememberPassword}
                className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label
                htmlFor="rememberPasswordModal"
                className="text-sm text-gray-700 cursor-pointer"
              >
                Remember my password
              </Label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            
            <div className="text-center text-sm text-gray-600">
              <p>Please enter your credentials to access the system</p>
              <p className="text-xs mt-1 text-gray-500">Contact your administrator if you need login credentials</p>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}