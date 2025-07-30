import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Download, Upload, Save, Settings, Mail, FileText, Building, Clock, Loader2, CheckCircle, Trash2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface GeneralSettings {
  id: number;
  colorTheme?: string;
  companyLogo?: string;
  logoSize?: string;
  companyName?: string;
  website?: string;
  showServerDateTime?: boolean;
  // Email Settings
  emailHost?: string;
  emailPort?: number;
  emailUser?: string;
  emailPassword?: string;
  emailSecure?: boolean;
  emailFrom?: string;
  emailFromName?: string;
  // PDF Settings
  pdfFont?: string;
  pdfHeaderContent?: string;
  pdfFooterContent?: string;
  pdfIndexPage?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DatabaseBackup {
  id: number;
  backupName: string;
  filePath?: string;
  fileSize?: number;
  createdBy?: number;
  createdAt: Date;
  createdByName?: string;
}

export default function GeneralSettings() {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [backupProgress, setBackupProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Email settings state
  const [emailSettings, setEmailSettings] = useState({
    emailHost: '',
    emailPort: 587,
    emailUser: '',
    emailPassword: '',
    emailFrom: '',
    emailFromName: '',
    emailSecure: false
  });
  
  // Query for general settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery<GeneralSettings>({
    queryKey: ["/api/general-settings"],
  });

  // Query for database backups
  const { data: backups = [], isLoading: isLoadingBackups } = useQuery<DatabaseBackup[]>({
    queryKey: ["/api/database-backups"],
  });

  // Query for users to get creator names
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  // Update current time every second for server date time display
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update email settings state when settings data loads
  React.useEffect(() => {
    if (settings) {
      setEmailSettings({
        emailHost: settings.emailHost || '',
        emailPort: settings.emailPort || 587,
        emailUser: settings.emailUser || '',
        emailPassword: settings.emailPassword || '',
        emailFrom: settings.emailFrom || '',
        emailFromName: settings.emailFromName || '',
        emailSecure: settings.emailSecure || false
      });
    }
  }, [settings]);

  // Mutation to update general settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<GeneralSettings>) => {
      return apiRequest("/api/general-settings", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/general-settings"] });
      toast({
        title: "Settings Updated",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to create backup
  const createBackupMutation = useMutation({
    mutationFn: async () => {
      setShowProgress(true);
      setBackupProgress(0);
      
      // Simulate progressive backup steps
      const progressInterval = setInterval(() => {
        setBackupProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95; // Keep at 95% until API completes
          }
          return prev + Math.random() * 15; // Random increments
        });
      }, 300);
      
      const response = await apiRequest("/api/database-backups", {
        method: "POST",
        body: JSON.stringify({
          backupName: `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}`,
        }),
      });
      
      clearInterval(progressInterval);
      setBackupProgress(100);
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/database-backups"] });
      
      // Show success state
      setShowSuccess(true);
      
      // Hide progress and show success message
      setTimeout(() => {
        setShowProgress(false);
        setShowSuccess(false);
        setBackupProgress(0);
      }, 1500);
      
      toast({
        title: "Backup Created",
        description: "Database backup has been created successfully.",
      });
    },
    onError: () => {
      setShowProgress(false);
      setBackupProgress(0);
      toast({
        title: "Backup Failed",
        description: "Failed to create database backup. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    
    try {
      const response = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const { logoUrl } = await response.json();
      
      updateSettingsMutation.mutate({
        companyLogo: logoUrl,
      });
      
      return logoUrl;
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Save email settings
  const saveEmailSettings = () => {
    updateSettingsMutation.mutate(emailSettings);
  };

  const testEmailConnection = () => {
    testEmailMutation.mutate();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const getCreatorName = (backup: DatabaseBackup) => {
    return backup.createdByName || 'Unknown User';
  };

  const handleDownloadBackup = async (backupId: number, backupName: string) => {
    try {
      const response = await fetch(`/api/database-backups/${backupId}/download`, {
        method: 'GET',
        headers: {
          'x-user-id': '2' // Current user ID
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backupName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download Started",
        description: "Your backup file is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download backup file. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Mutation to delete backup
  const deleteBackupMutation = useMutation({
    mutationFn: async (backupId: number) => {
      return apiRequest(`/api/database-backups/${backupId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/database-backups"] });
      toast({
        title: "Backup Deleted",
        description: "Database backup has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete database backup. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to test email configuration
  const testEmailMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/auth/test-email", {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Email Test Successful",
        description: "Your email configuration is working correctly!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Email Test Failed",
        description: error.message || "Failed to test email configuration. Please check your settings.",
        variant: "destructive",
      });
    },
  });

  if (isLoadingSettings) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">General Settings</h1>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">General Settings</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Settings
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import Settings
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="pdf" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                PDF
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Company Logo */}
                <div className="space-y-2">
                  <Label htmlFor="company-logo">Company Logo</Label>
                  {settings?.companyLogo && (
                    <div className="flex items-center gap-4">
                      <img
                        src={settings.companyLogo}
                        alt="Company Logo"
                        className="w-16 h-16 object-contain border rounded"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateSettingsMutation.mutate({
                            companyLogo: undefined,
                          });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  <Input
                    id="company-logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleLogoUpload(file);
                      }
                    }}
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    type="text"
                    value={settings?.companyName || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateSettingsMutation.mutate({
                        companyName: value,
                      });
                    }}
                    placeholder="Enter company name"
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>

                {/* Logo Size */}
                <div className="space-y-2">
                  <Label htmlFor="logo-size">Logo Size</Label>
                  <Select
                    value={settings?.logoSize || "64px"}
                    onValueChange={(value) => {
                      updateSettingsMutation.mutate({
                        logoSize: value,
                      });
                    }}
                    disabled={updateSettingsMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="32px">Small (32px)</SelectItem>
                      <SelectItem value="64px">Medium (64px)</SelectItem>
                      <SelectItem value="96px">Large (96px)</SelectItem>
                      <SelectItem value="128px">Extra Large (128px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={settings?.website || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateSettingsMutation.mutate({
                        website: value,
                      });
                    }}
                    placeholder="https://example.com"
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>

                {/* Color Theme */}
                <div className="space-y-2">
                  <Label htmlFor="color-theme">Color Theme</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="color-theme"
                      type="color"
                      value={settings?.colorTheme || "#7c3aed"}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateSettingsMutation.mutate({
                          colorTheme: value,
                        });
                      }}
                      className="w-20 h-10"
                      disabled={updateSettingsMutation.isPending}
                    />
                    <span className="text-sm text-gray-600">
                      {settings?.colorTheme || "#7c3aed"}
                    </span>
                  </div>
                </div>

                {/* Show Server Date Time */}
                <div className="space-y-2">
                  <Label htmlFor="show-datetime">Show Server Date/Time</Label>
                  <div className="flex items-center gap-4">
                    <Switch
                      id="show-datetime"
                      checked={settings?.showServerDateTime ?? true}
                      onCheckedChange={(checked) => {
                        updateSettingsMutation.mutate({
                          showServerDateTime: checked,
                        });
                      }}
                      disabled={updateSettingsMutation.isPending}
                    />
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {currentDateTime.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-6 mt-6">
              {/* Email Setup Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">📧 Email Setup Instructions</h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <p><strong>For Gmail:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Use <code>smtp.gmail.com</code> as host and port <code>587</code></li>
                    <li>Generate an App Password: Google Account → Security → 2-Step Verification → App passwords</li>
                    <li>Use your Gmail address as username and the App Password (not your regular password)</li>
                    <li>Set "From Email" to your desired sender address</li>
                  </ol>
                  <p className="mt-2"><strong>For other providers:</strong> Check your email provider's SMTP settings documentation.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Email Host */}
                <div className="space-y-2">
                  <Label htmlFor="email-host">Email Host</Label>
                  <Input
                    id="email-host"
                    type="text"
                    value={emailSettings.emailHost}
                    onChange={(e) => {
                      setEmailSettings({
                        ...emailSettings,
                        emailHost: e.target.value,
                      });
                    }}
                    placeholder="smtp.gmail.com"
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>

                {/* Email Port */}
                <div className="space-y-2">
                  <Label htmlFor="email-port">Email Port</Label>
                  <Input
                    id="email-port"
                    type="number"
                    value={emailSettings.emailPort}
                    onChange={(e) => {
                      setEmailSettings({
                        ...emailSettings,
                        emailPort: parseInt(e.target.value) || 587,
                      });
                    }}
                    placeholder="587"
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>

                {/* Email User */}
                <div className="space-y-2">
                  <Label htmlFor="email-user">Email Username</Label>
                  <Input
                    id="email-user"
                    type="email"
                    value={emailSettings.emailUser}
                    onChange={(e) => {
                      setEmailSettings({
                        ...emailSettings,
                        emailUser: e.target.value,
                      });
                    }}
                    placeholder="your-email@gmail.com"
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>

                {/* Email Password */}
                <div className="space-y-2">
                  <Label htmlFor="email-password">Email Password</Label>
                  <Input
                    id="email-password"
                    type="password"
                    value={emailSettings.emailPassword}
                    onChange={(e) => {
                      setEmailSettings({
                        ...emailSettings,
                        emailPassword: e.target.value,
                      });
                    }}
                    placeholder="App password or email password"
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>

                {/* Email From */}
                <div className="space-y-2">
                  <Label htmlFor="email-from">From Email</Label>
                  <Input
                    id="email-from"
                    type="email"
                    value={emailSettings.emailFrom}
                    onChange={(e) => {
                      setEmailSettings({
                        ...emailSettings,
                        emailFrom: e.target.value,
                      });
                    }}
                    placeholder="noreply@yourcompany.com"
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>

                {/* Email From Name */}
                <div className="space-y-2">
                  <Label htmlFor="email-from-name">From Name</Label>
                  <Input
                    id="email-from-name"
                    type="text"
                    value={emailSettings.emailFromName}
                    onChange={(e) => {
                      setEmailSettings({
                        ...emailSettings,
                        emailFromName: e.target.value,
                      });
                    }}
                    placeholder="SquidJob System"
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>

                {/* Email Security */}
                <div className="space-y-2">
                  <Label htmlFor="email-secure">Use SSL/TLS</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="email-secure"
                      checked={emailSettings.emailSecure}
                      onCheckedChange={(checked) => {
                        setEmailSettings({
                          ...emailSettings,
                          emailSecure: checked,
                        });
                      }}
                      disabled={updateSettingsMutation.isPending}
                    />
                    <span className="text-sm text-gray-600">
                      Enable secure connection
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Save Settings and Test Email Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  onClick={testEmailConnection}
                  disabled={updateSettingsMutation.isPending || testEmailMutation.isPending}
                  variant="outline"
                  className="border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  {testEmailMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Test Email
                    </>
                  )}
                </Button>
                <Button
                  onClick={saveEmailSettings}
                  disabled={updateSettingsMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="pdf" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* PDF Font */}
                <div className="space-y-2">
                  <Label htmlFor="pdf-font">PDF Font</Label>
                  <Select
                    value={settings?.pdfFont || "Arial"}
                    onValueChange={(value) => {
                      updateSettingsMutation.mutate({
                        pdfFont: value,
                      });
                    }}
                    disabled={updateSettingsMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Calibri">Calibri</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Verdana">Verdana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* PDF Index Page */}
                <div className="space-y-2">
                  <Label htmlFor="pdf-index">Include Index Page</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="pdf-index"
                      checked={settings?.pdfIndexPage ?? true}
                      onCheckedChange={(checked) => {
                        updateSettingsMutation.mutate({
                          pdfIndexPage: checked,
                        });
                      }}
                      disabled={updateSettingsMutation.isPending}
                    />
                    <span className="text-sm text-gray-600">
                      Add index page to generated PDFs
                    </span>
                  </div>
                </div>

                {/* PDF Header */}
                <div className="space-y-2">
                  <Label htmlFor="pdf-header">PDF Header Content</Label>
                  <Textarea
                    id="pdf-header"
                    value={settings?.pdfHeaderContent || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateSettingsMutation.mutate({
                        pdfHeaderContent: value,
                      });
                    }}
                    placeholder="Header content for PDF documents"
                    disabled={updateSettingsMutation.isPending}
                    rows={3}
                  />
                </div>

                {/* PDF Footer */}
                <div className="space-y-2">
                  <Label htmlFor="pdf-footer">PDF Footer Content</Label>
                  <Textarea
                    id="pdf-footer"
                    value={settings?.pdfFooterContent || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateSettingsMutation.mutate({
                        pdfFooterContent: value,
                      });
                    }}
                    placeholder="Footer content for PDF documents"
                    disabled={updateSettingsMutation.isPending}
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Database Backup Section */}
      <Card>
        <CardHeader>
          <CardTitle>Database Backup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Create Backup</h3>
                <p className="text-sm text-gray-600">
                  Create a backup of your database
                </p>
              </div>
              <Button
                onClick={() => {
                  createBackupMutation.mutate();
                }}
                disabled={createBackupMutation.isPending || showProgress}
                className="flex items-center gap-2"
              >
                {showProgress ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : showSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Complete!
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Create Backup
                  </>
                )}
              </Button>
            </div>

            {/* Progress Bar */}
            {showProgress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Creating backup...</span>
                  <span className="font-medium">{backupProgress}%</span>
                </div>
                <Progress value={backupProgress} className="h-2" />
              </div>
            )}

            {/* Success Message */}
            {showSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">Backup created successfully!</span>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <h3 className="font-medium">Recent Backups</h3>
              {isLoadingBackups ? (
                <div className="text-center py-4">Loading backups...</div>
              ) : backups.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No backups available
                </div>
              ) : (
                <div className="space-y-3">
                  {backups.map((backup, index) => (
                    <div
                      key={backup.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                          <span className="text-sm font-semibold text-purple-600">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-purple-600" />
                            <p className="font-medium text-gray-800">{backup.backupName}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">File Size:</span>{" "}
                              {backup.fileSize ? formatFileSize(backup.fileSize) : "Unknown"}
                            </div>
                            <div>
                              <span className="font-medium">Generated Date:</span>{" "}
                              {formatDate(backup.createdAt)}
                            </div>
                            <div>
                              <span className="font-medium">Generated By:</span>{" "}
                              {getCreatorName(backup)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          {backup.filePath ? "Available" : "Processing"}
                        </Badge>
                        {backup.filePath && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadBackup(backup.id, backup.backupName)}
                              className="flex items-center gap-1"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                    Delete Backup File
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the backup file "{backup.backupName}"? 
                                    This action cannot be undone and the backup file will be permanently removed.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteBackupMutation.mutate(backup.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={deleteBackupMutation.isPending}
                                  >
                                    {deleteBackupMutation.isPending ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Deleting...
                                      </>
                                    ) : (
                                      <>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                      </>
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}