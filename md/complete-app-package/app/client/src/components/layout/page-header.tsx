import React from 'react';

// Define a local User interface that matches the User from context
interface User {
  id: number;
  username: string;
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  designation?: string;
}

interface PageHeaderProps {
  title: string;
  user?: User | null;
  children?: React.ReactNode;
}

export function PageHeader({ title, user, children }: PageHeaderProps) {
  return (
    <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {user && (
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, {user.name || user.username}
          </p>
        )}
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
}