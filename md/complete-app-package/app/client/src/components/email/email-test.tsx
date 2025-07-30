import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function EmailTest() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    connectionTest?: boolean;
    emailSent?: boolean;
  } | null>(null);
  const { toast } = useToast();

  const handleTestEmail = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to test.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      setTestResult({
        success: response.ok,
        message: result.message,
        connectionTest: result.connectionTest,
        emailSent: result.emailSent,
      });

      if (response.ok) {
        toast({
          title: "Email Test Successful",
          description: `Test email sent to ${email}`,
        });
      } else {
        toast({
          title: "Email Test Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "Network error. Please check your connection.",
      });
      toast({
        title: "Network Error",
        description: "Failed to connect to the server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Notification Test
        </CardTitle>
        <CardDescription>
          Test the email notification system for tender assignments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Enter email address to test"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <Button 
          onClick={handleTestEmail} 
          disabled={isLoading || !email}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending Test Email...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Send Test Email
            </>
          )}
        </Button>

        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"}>
            {testResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {testResult.message}
              {testResult.connectionTest !== undefined && (
                <div className="mt-2 text-sm">
                  <div>SMTP Connection: {testResult.connectionTest ? '✓ Success' : '✗ Failed'}</div>
                  {testResult.emailSent !== undefined && (
                    <div>Email Sent: {testResult.emailSent ? '✓ Success' : '✗ Failed'}</div>
                  )}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500">
          <p><strong>SMTP Configuration Required:</strong></p>
          <p>Set environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS</p>
          <p>Example: Gmail requires app-specific password</p>
        </div>
      </CardContent>
    </Card>
  );
}