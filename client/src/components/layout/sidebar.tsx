import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Store, 
  FolderPlus, 
  FileBarChart, 
  Users, 
  UserCog, 
  Settings, 
  LogOut, 
  SquareStack
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const links = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className="sidebar-icon" /> },
    { href: "/inventory", label: "Inventory", icon: <Store className="sidebar-icon" /> },
    { href: "/inventory/add", label: "Add Items", icon: <FolderPlus className="sidebar-icon" /> },
    { href: "/reports", label: "Reports", icon: <FileBarChart className="sidebar-icon" /> },
    { href: "/departments", label: "Departments", icon: <Users className="sidebar-icon" /> },
    { href: "/users", label: "User Management", icon: <UserCog className="sidebar-icon" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="sidebar-icon" /> },
  ];

  return (
    <div className="flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-50">
      <div className="flex flex-col flex-grow bg-slate-900 overflow-y-auto">
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-slate-800">
          <div className="text-white flex items-center space-x-2">
            <SquareStack className="h-6 w-6" />
            <span className="text-xl font-bold">InventoryPro</span>
          </div>
        </div>
        <div className="mt-5 flex-1 flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link ${location === link.href ? "sidebar-link-active" : ""}`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center text-white">
                {user?.name?.substring(0, 2) || "U"}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-slate-300 capitalize">{user?.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="ml-auto text-slate-400 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
