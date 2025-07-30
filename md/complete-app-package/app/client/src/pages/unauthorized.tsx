import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 flex items-center justify-center bg-red-100 rounded-full mb-6">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        
        <p className="text-gray-600 mb-6">
          You do not have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        
        <div className="space-y-3">
          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
            <Link href="/">
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}