import React, { useState, useRef, useEffect } from "react";
import { Logo } from "@/components/logo";
import { useUser } from "@/user-context";
import { Link } from "wouter";

interface HeaderProps {
  toggleSidebar: () => void;
  pageTitle?: string;
}

export function Header({ toggleSidebar, pageTitle }: HeaderProps) {
  const { currentUser, logout } = useUser();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuRef]);
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex justify-between items-center px-4 py-3 sm:px-6 lg:px-8">
        <div className="md:hidden flex items-center">
          <button 
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {pageTitle && (
            <h1 className="ml-2 text-lg font-semibold text-gray-800">{pageTitle}</h1>
          )}
        </div>
        
        <div className="flex-1 mx-2 hidden md:block">
          {/* Empty space for better layout */}
        </div>
        
        <div className="flex items-center space-x-4">
          {pageTitle && (
            <h1 className="text-lg font-semibold text-gray-800 mr-4">{pageTitle}</h1>
          )}
          <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <span className="sr-only">View notifications</span>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-warning text-xs text-white">3</span>
            </div>
          </button>
          
          <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <span className="sr-only">Help</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
          
          {/* User Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button 
              className="flex items-center p-1 cursor-pointer"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            >
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-sm font-medium">{currentUser?.name || "Poonam Amale"}</span>
                <span className="text-xs text-gray-500">{currentUser?.role || "Admin"}</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <div className="font-medium">Profile</div>
                </div>
                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile
                </Link>
                <Link href="/change-password" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Change Password
                </Link>
                <button 
                  onClick={() => logout()} 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
