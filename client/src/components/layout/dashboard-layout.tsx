import Sidebar from "./sidebar";
import MobileSidebar from "./mobile-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <Sidebar />
      
      {/* Mobile Sidebar */}
      <MobileSidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 lg:pl-64">
        {/* Top Nav */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white dark:bg-slate-800 shadow">
          <div className="flex flex-1 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                <BellIcon className="h-5 w-5" />
              </Button>
              <div className="relative">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <span className="sr-only">User menu</span>
                  {user?.name?.substring(0, 2) || "U"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
