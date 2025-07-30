import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ShieldX } from 'lucide-react';

export default function NotAuthorized() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[70vh] p-4">
      <div className="flex flex-col items-center justify-center text-center max-w-lg">
        <div className="bg-red-100 p-4 rounded-full mb-6">
          <ShieldX className="h-20 w-20 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-lg text-gray-600 mb-6">
          You don't have permission to view this page. Please contact your administrator if you believe this is an error.
        </p>
        <Button 
          className="bg-primary-600 hover:bg-primary-700 text-white"
          onClick={() => setLocation('/')}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}