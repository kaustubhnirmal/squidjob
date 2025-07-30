import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { Logo } from "@/components/logo";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/user-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useQuery } from "@tanstack/react-query";
import { useSidebarContext } from './main-layout';

// Navigation item interface matching menu-management structure
interface NavigationItem {
  id: string;
  name: string;
  path: string;
  permission?: string;
  order: number;
  subItems?: NavigationItem[];
}

// Custom NavLink component to avoid nested <a> tags with TypeScript definitions
interface NavLinkProps {
  href: string;
  className: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href, className, children, onClick }) => {
  const [, navigate] = useLocation();
  
  // Using div instead of <a> to avoid nested anchors issues
  // This works with client-side navigation using Wouter's navigate function
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    } else {
      e.preventDefault();
      
      // Special handling for settings navigation
      if (href.startsWith("/settings?tab=")) {
        // Force a reload to ensure navigation works correctly
        window.location.href = href;
      } else {
        navigate(href);
      }
    }
  };
  
  return (
    <div onClick={handleClick} className={className + " cursor-pointer"}>
      {children}
    </div>
  );
};

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { currentUser, logout } = useUser();
  const { hasPermission, isLoading } = usePermissions();
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const { isCollapsed, setIsCollapsed } = useSidebarContext();
  const [expandedMenus, setExpandedMenus] = useState<{[key: string]: boolean}>({
    "dashboard": true,
    "tender": false,
    "tenderTask": true,
    "finance": false,
    "documents": false,
    "approvals": false,
    "mis": false,
    "oemManagement": true,
    "settings": false,
    "bidManagement": false
  });

  // Default navigation structure matching menu-management
  const getDefaultNavigationStructure = (): NavigationItem[] => [
    {
      id: 'dashboard',
      name: 'Dashboard',
      path: '/dashboard',
      permission: 'dashboard',
      order: 1,
      subItems: [
        { id: 'finance-dashboard', name: 'Finance Dashboard', path: '/finance-dashboard', permission: 'financeDashboard', order: 1 },
        { id: 'sales-dashboard', name: 'Sales Dashboard', path: '/sales-dashboard', permission: 'salesDashboard', order: 2 }
      ]
    },
    {
      id: 'tender',
      name: 'Tender',
      path: '/tenders',
      permission: 'tender',
      order: 2,
      subItems: [
        { id: 'all-tenders', name: 'All Tenders', path: '/tenders', order: 1 },
        { id: 'import-tender', name: 'Import Tender', path: '/import-tender', order: 2 },
        { id: 'add-modify-tender', name: 'Add/Modify Tender', path: '/add-modify-tender', order: 3 },
        { id: 'tender-results', name: 'Tender Results', path: '/tender-results', permission: 'tenderResults', order: 4 }
      ]
    },
    {
      id: 'tender-task',
      name: 'Tender Task',
      path: '/tender-task',
      permission: 'tenderTask',
      order: 3,
      subItems: [
        { id: 'my-tender', name: 'My Tender', path: '/my-tenders', order: 1 },
        { id: 'assign-to-team', name: 'Assign to Team', path: '/assign-to-team', order: 2 },
        { id: 'submitted-tender', name: 'Submitted Tender', path: '/submitted-tenders', order: 3 },
        { id: 'tender-checklist', name: 'Tender Checklist', path: '/tender-checklist', order: 4 }
      ]
    },
    {
      id: 'finance',
      name: 'Finance Management',
      path: '/finance-management',
      permission: 'finance',
      order: 4,
      subItems: [
        { id: 'new-request', name: 'New Request', path: '/finance-management/new-request', permission: 'requestToFinanceTeam', order: 1 },
        { id: 'approve-request', name: 'Approve Request', path: '/finance-management/approve-request', permission: 'financeApproval', order: 2 },
        { id: 'denied-request', name: 'Denied Request', path: '/finance-management/denied-request', order: 3 },
        { id: 'complete-request', name: 'Complete Request', path: '/finance-management/complete-request', order: 4 }
      ]
    },
    {
      id: 'mis',
      name: 'MIS',
      path: '/mis',
      permission: 'mis',
      order: 5,
      subItems: [
        { id: 'finance-mis', name: 'Finance MIS', path: '/finance-mis', order: 1 },
        { id: 'sales-mis', name: 'Sales MIS', path: '/sales-mis', order: 2 },
        { id: 'login-mis', name: 'Login MIS', path: '/login-mis', order: 3 },
        { id: 'task', name: 'Task', path: '/tasks', permission: 'task', order: 4 },
        { id: 'approvals', name: 'Approvals', path: '/approvals', permission: 'approvals', order: 5 }
      ]
    },
    {
      id: 'documents',
      name: 'Document Management',
      path: '/documents',
      permission: 'folders',
      order: 6,
      subItems: [
        { id: 'folder-management', name: 'Folder Management', path: '/documents', order: 1 },
        { id: 'document-briefcase', name: 'Document Briefcase', path: '/document-brief-case', order: 2 },
        { id: 'checklist', name: 'Checklist', path: '/checklist', permission: 'checklist', order: 3 }
      ]
    },
    {
      id: 'settings',
      name: 'Settings',
      path: '/settings',
      permission: 'admin',
      order: 7,
      subItems: [
        { id: 'department', name: 'Department', path: '/department', permission: 'department', order: 1 },
        { id: 'designation', name: 'Designation', path: '/designation', permission: 'designation', order: 2 },
        { id: 'role', name: 'Role', path: '/role', permission: 'role', order: 3 },
        { id: 'user-management', name: 'User Management', path: '/user-management', permission: 'userMaster', order: 4 },
        { id: 'general-settings', name: 'General Settings', path: '/general-settings', permission: 'admin', order: 5 },
        { id: 'menu-management', name: 'Menu Management', path: '/menu-management', permission: 'admin', order: 6 }
      ]
    }
  ];

  // Fetch menu structure from API
  const { data: menuStructureData } = useQuery({
    queryKey: ['/api/menu-structure'],
    enabled: !!currentUser
  });

  console.log('Sidebar menuStructureData:', menuStructureData);
  console.log('Sidebar menuStructure from API:', menuStructureData?.menuStructure);

  // Use fetched menu structure or fall back to default
  const navigationItems = menuStructureData?.menuStructure || getDefaultNavigationStructure();

  const toggleMenu = (menuName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  // Get icon for menu item
  const getMenuIcon = (id: string) => {
    const iconMap: Record<string, JSX.Element> = {
      'dashboard': (
        <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      ),
      'tender': (
        <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      'tender-task': (
        <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <polyline points="9 9 15 15" />
          <polyline points="15 9 9 15" />
        </svg>
      ),
      'finance': (
        <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      'mis': (
        <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
        </svg>
      ),
      'documents': (
        <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
      'task': (
        <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3 8-8" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
      'approvals': (
        <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12l2 2 4-4" />
          <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
          <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
        </svg>
      ),
      'settings': (
        <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    };
    return iconMap[id] || iconMap['dashboard'];
  };

  // Check if user has permission for menu item
  const hasMenuPermission = (item: NavigationItem): boolean => {
    if (!item.permission) return true;
    
    // Special handling for Dashboard section - show if user has any dashboard-related permissions
    if (item.permission === 'dashboard') {
      const hasSalesDashboard = hasPermission('salesDashboard');
      const hasFinanceDashboard = hasPermission('financeDashboard');
      const hasMainDashboard = hasPermission('dashboard');
      const hasAccess = hasSalesDashboard || hasFinanceDashboard || hasMainDashboard;
      console.log(`Permission check for ${item.name} (dashboard): salesDashboard=${hasSalesDashboard}, financeDashboard=${hasFinanceDashboard}, dashboard=${hasMainDashboard}, final=${hasAccess}`);
      return hasAccess;
    }
    
    // CRITICAL: Explicit check for Settings menu - only Admin role users should see this
    if (item.permission === 'admin') {
      console.log(`🔒 SETTINGS MENU CHECK - User: ${currentUser?.username}, Role: ${currentUser?.role}`);
      
      // Only allow specific admin users
      const isAdminUser = currentUser?.role === 'Admin' || 
                         currentUser?.username === 'admin' || 
                         currentUser?.username === 'poonam.amale' ||
                         currentUser?.username === 'kn@starinxs.com';
      
      console.log(`🔒 SETTINGS ACCESS DECISION: ${isAdminUser ? 'GRANTED' : 'DENIED'} for ${currentUser?.username}`);
      
      // For non-admin users, explicitly return false to hide Settings menu
      if (!isAdminUser) {
        console.log(`❌ Settings menu HIDDEN for non-admin user: ${currentUser?.username} (role: ${currentUser?.role})`);
        return false;
      }
      
      console.log(`✅ Settings menu VISIBLE for admin user: ${currentUser?.username}`);
      return true;
    }
    
    const hasAccess = hasPermission(item.permission);
    console.log(`Permission check for ${item.name} (${item.permission}): ${hasAccess}`);
    
    return hasAccess;
  };

  // Check if menu item is active
  const isMenuItemActive = (item: NavigationItem): boolean => {
    if (item.subItems) {
      return item.subItems.some(subItem => location === subItem.path);
    }
    return location === item.path;
  };

  // Auto-expand parent menu when a submenu item is active
  useEffect(() => {
    navigationItems.forEach(item => {
      if (item.subItems) {
        const hasActiveSubItem = item.subItems.some(subItem => location === subItem.path);
        if (hasActiveSubItem && !expandedMenus[item.id]) {
          setExpandedMenus(prev => ({ ...prev, [item.id]: true }));
        }
      }
    });
  }, [location, navigationItems]);

  // Render dynamic navigation items
  const renderNavigationItem = (item: NavigationItem) => {
    // Check permission
    const hasAccess = hasMenuPermission(item);
    
    // Extra debugging for Settings menu
    if (item.id === 'settings') {
      console.log(`🔍 SETTINGS MENU RENDER CHECK:`, {
        itemName: item.name,
        permission: item.permission,
        hasAccess: hasAccess,
        userRole: currentUser?.role,
        userName: currentUser?.username
      });
    }
    
    if (!hasAccess) {
      console.log(`❌ Menu item HIDDEN: ${item.name} (permission: ${item.permission})`);
      return null;
    }

    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isActive = isMenuItemActive(item);
    const isExpanded = expandedMenus[item.id];
    
    console.log(`✅ Rendering item: ${item.name}, hasSubItems: ${hasSubItems}, isExpanded: ${isExpanded}, subItems count: ${item.subItems?.length || 0}`);

    return (
      <li key={item.id}>
        <NavLink
          href={item.path}
          className={`sidebar-link group ${isActive ? "active" : ""} ${isCollapsed ? "justify-center" : ""}`}
          onClick={(e) => {
            if (hasSubItems) {
              toggleMenu(item.id, e);
            } else {
              // For single-level items like "Task", navigate directly
              e.preventDefault();
              setLocation(item.path);
            }
          }}
          title={isCollapsed ? item.name : undefined}
        >
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} w-full`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
              {getMenuIcon(item.id)}
              {!isCollapsed && <span>{item.name}</span>}
            </div>
            {hasSubItems && !isCollapsed && (
              isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            )}
          </div>
        </NavLink>

        {/* Render sub-items */}
        {hasSubItems && isExpanded && !isCollapsed && (
          <div className="pl-8 space-y-1 mt-1">
            {item.subItems!
              .filter(subItem => {
                const hasAccess = hasMenuPermission(subItem);
                console.log(`Subitem ${subItem.name} permission check: ${hasAccess}`);
                return hasAccess;
              })
              .sort((a, b) => a.order - b.order)
              .map(subItem => {
                console.log(`Rendering subitem: ${subItem.name} at path: ${subItem.path}`);
                return (
                  <NavLink
                    key={subItem.id}
                    href={subItem.path}
                    className={`sidebar-sub-link ${location === subItem.path ? "active" : ""}`}
                  >
                    {subItem.name}
                  </NavLink>
                );
              })}
          </div>
        )}
      </li>
    );
  };
  
  const handleLogout = () => {
    // Show confirmation dialog
    if (window.confirm("Are you sure you want to logout?")) {
      // Call the logout function from context to clear user data
      logout();
      
      // Show toast notification
      toast({
        title: "Logout successful",
        description: "You have been logged out successfully",
      });
      
      // Redirect to sign-in page after a short delay
      setTimeout(() => {
        setLocation('/login');
      }, 1000);
    }
  };
  
  // Create a reference to the dropdown menu
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Header with Logo and Collapse Button */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-b border-gray-200 flex items-center justify-between`}>
        {!isCollapsed && <Logo />}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          )}
        </button>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className={`space-y-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {/* Dynamic Navigation Items */}
          {navigationItems
            .filter(item => {
              // Additional filter to completely remove Settings menu for non-admin users
              if (item.id === 'settings') {
                const isAdminUser = currentUser?.role === 'Admin' || 
                                   currentUser?.username === 'admin' || 
                                   currentUser?.username === 'poonam.amale' ||
                                   currentUser?.username === 'kn@starinxs.com';
                console.log(`🚫 SETTINGS MENU FILTER: ${isAdminUser ? 'KEEPING' : 'REMOVING'} for user ${currentUser?.username}`);
                return isAdminUser;
              }
              return true; // Keep all other menu items
            })
            .sort((a, b) => a.order - b.order)
            .map(item => renderNavigationItem(item))}


          {/* All navigation items are now dynamically generated */}
          {false && hasPermission('tender') && (
            <li>
              <NavLink
                href="/tenders"
                className={`sidebar-link group ${location.startsWith("/tender") ? "active" : ""}`}
                onClick={(e) => toggleMenu("tender", e)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <span>Tender</span>
                  </div>
                  {expandedMenus.tender ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </NavLink>
            </li>
          )}
          

          
          {false && hasPermission('tenderTask') && (
            <li>
              <NavLink
                href="/tender-task"
                className={`sidebar-link group ${location.startsWith("/tender-task") || location === "/tender-checklist" ? "active" : ""}`}
                onClick={(e) => toggleMenu("tenderTask", e)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                    </svg>
                    <span>Tender Task</span>
                  </div>
                  {expandedMenus.tenderTask ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </NavLink>
            </li>
          )}
          

          

          {false && hasPermission('finance') && (
            <li>
              <NavLink
                href="/finance-management"
                className={`sidebar-link group ${location === "/finance-management" ? "active" : ""}`}
                onClick={(e) => toggleMenu("finance", e)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    <span>Finance Management</span>
                  </div>
                  {expandedMenus.finance ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </NavLink>
            </li>
          )}
          

          
          {/* MIS - Only show if user has permission */}
          {false && hasPermission('mis') && (
            <li>
              <NavLink
                href="/mis"
                className={`sidebar-link group ${location === "/mis" || location === "/finance-mis" || location === "/sales-mis" ? "active" : ""}`}
                onClick={(e) => toggleMenu("mis", e)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <span>MIS</span>
                  </div>
                  {expandedMenus.mis ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </NavLink>
            </li>
          )}
          


          {/* Document Management - Only show if user has permission */}
          {false && hasPermission('folders') && (
            <li>
              <NavLink
                href="/documents"
                className={`sidebar-link group ${location === "/documents" || location === "/document-brief-case" ? "active" : ""}`}
                onClick={(e) => toggleMenu("documents", e)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>Document Management</span>
                  </div>
                  {expandedMenus.documents ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </NavLink>
            </li>
          )}
          
          {/* Document Management Submenu - Only show if expanded and user has permission */}
          {false && expandedMenus.documents && hasPermission('folders') && (
            <div className="pl-8 space-y-1 mt-1">
              <NavLink
                href="/documents"
                className={`sidebar-sub-link ${location === "/documents" ? "text-primary-600" : ""}`}
              >
                Folders
              </NavLink>
              {hasPermission('briefCase') && (
                <NavLink
                  href="/document-brief-case"
                  className={`sidebar-sub-link ${location === "/document-brief-case" ? "text-primary-600" : ""}`}
                >
                  Document Brief Case
                </NavLink>
              )}
              {hasPermission('checklist') && (
                <NavLink
                  href="/checklist"
                  className={`sidebar-sub-link ${location === "/checklist" ? "text-primary-600" : ""}`}
                >
                  Checklist
                </NavLink>
              )}
            </div>
          )}
          
          {/* Task - Only show if user has permission */}
          {false && hasPermission('task') && (
            <li>
              <NavLink
                href="/tasks"
                className={`sidebar-link group ${location === "/tasks" ? "active" : ""}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"/>
                  <path d="M12 8v4l3 3"/>
                </svg>
                Task
              </NavLink>
            </li>
          )}
          
          {/* Approvals - Only show if user has permission */}
          {false && hasPermission('approvals') && (
            <li>
              <NavLink
                href="/approvals"
                className={`sidebar-link group ${location === "/approvals" ? "active" : ""}`}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                  <span>Approvals</span>
                </div>
              </NavLink>
            </li>
          )}
          
          {/* Purchase Order - Only show if user has permission */}
          {false && hasPermission('purchaseOrder') && (
            <li>
              <NavLink
                href="/purchase-order"
                className={`sidebar-link group ${location === "/purchase-order" ? "active" : ""}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
                Purchase Order
              </NavLink>
            </li>
          )}
          

          
          
          
          
          

          

          



          
          {/* Utility and Tender Add/Modify removed as requested */}
        </ul>
      </nav>
      

    </>
  );
}
