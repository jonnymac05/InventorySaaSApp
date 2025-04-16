import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Store, 
  FolderPlus, 
  FileBarChart, 
  Users, 
  UserCog, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  SquareStack
} from "lucide-react";

export default function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsOpen(false);
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

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 z-50 flex items-center p-2 m-2 rounded-md bg-white shadow-md dark:bg-slate-800">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="p-2 text-slate-700 dark:text-slate-200">
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile menu (off-canvas) */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative flex flex-col w-5/6 max-w-sm h-full bg-slate-900 overflow-y-auto">
            {/* Mobile menu content */}
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-slate-800">
              <div className="text-white flex items-center space-x-2">
                <SquareStack className="h-6 w-6" />
                <span className="text-xl font-bold">InventoryPro</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="ml-auto text-white"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="mt-5 flex-1 flex flex-col">
              <nav className="flex-1 px-2 pb-4 space-y-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`sidebar-link ${location === link.href ? "sidebar-link-active" : ""}`}
                    onClick={() => setIsOpen(false)}
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
      )}
    </>
  );
}
