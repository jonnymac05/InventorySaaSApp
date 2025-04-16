import { Department } from "@shared/schema";
import { LayoutDashboard, Monitor, User2, Brush } from "lucide-react";

interface DepartmentCardProps {
  department: Department;
}

function DepartmentCard({ department }: DepartmentCardProps) {
  // Function to get icon based on department name
  const getDepartmentIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("it")) return <Monitor className="h-5 w-5 text-white" />;
    if (lowerName.includes("hr")) return <User2 className="h-5 w-5 text-white" />;
    if (lowerName.includes("design")) return <Brush className="h-5 w-5 text-white" />;
    return <LayoutDashboard className="h-5 w-5 text-white" />;
  };

  // Function to get background color based on department name
  const getDepartmentColor = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("it")) return "bg-blue-500";
    if (lowerName.includes("hr")) return "bg-green-500";
    if (lowerName.includes("design")) return "bg-purple-500";
    return "bg-indigo-500";
  };

  // Calculate percentage used
  const percentageUsed = department.capacityUsed === 0 ? 0 : Math.min(100, Math.round((department.capacityUsed / 100) * 100));

  return (
    <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${getDepartmentColor(department.name)}`}>
            {getDepartmentIcon(department.name)}
          </div>
          <div className="ml-5">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">{department.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{department.assetCount} assets</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600 dark:text-slate-400">Space Used</span>
            <span className="text-slate-900 dark:text-white">{percentageUsed}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className={`${getDepartmentColor(department.name)} h-2 rounded-full`} 
              style={{ width: `${percentageUsed}%` }}
            />
          </div>
        </div>
      </div>
      <div className="bg-slate-50 dark:bg-slate-700 px-4 py-4 sm:px-6">
        <div className="text-sm">
          <a href={`/departments/${department.id}`} className="font-medium text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400">
            View department details
          </a>
        </div>
      </div>
    </div>
  );
}

interface DepartmentOverviewProps {
  departments: Department[];
  loading: boolean;
}

export default function DepartmentOverview({ departments, loading }: DepartmentOverviewProps) {
  if (loading) {
    return (
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white">Department Overview</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 shadow rounded-lg h-48 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white">Department Overview</h2>
        <a href="/departments" className="text-sm font-medium text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400">
          Manage Departments
        </a>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-500 dark:text-slate-400">
            No departments found. Create a department to get started.
          </div>
        ) : (
          departments.map((department) => (
            <DepartmentCard key={department.id} department={department} />
          ))
        )}
      </div>
    </div>
  );
}
