import { ActivityLog } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface RecentActivityProps {
  activities: ActivityLog[];
  loading: boolean;
}

export default function RecentActivity({ activities, loading }: RecentActivityProps) {
  // Define action colors
  const getActionColor = (action: string) => {
    switch (action) {
      case "added":
        return "text-green-600 dark:text-green-500";
      case "updated":
        return "text-blue-600 dark:text-blue-500";
      case "removed":
        return "text-red-600 dark:text-red-500";
      case "transferred":
        return "text-yellow-600 dark:text-yellow-500";
      default:
        return "text-slate-700 dark:text-slate-300";
    }
  };

  const activityRows = useMemo(() => {
    return activities.map((activity) => (
      <TableRow key={activity.id}>
        <TableCell className="table-cell-id">{activity.assetId}</TableCell>
        <TableCell className="table-cell">{activity.itemName}</TableCell>
        <TableCell className="table-cell">{activity.departmentName}</TableCell>
        <TableCell className={`table-cell ${getActionColor(activity.action)}`}>
          {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
        </TableCell>
        <TableCell className="table-cell">
          {format(new Date(activity.createdAt), "MMM d, yyyy")}
        </TableCell>
        <TableCell className="table-cell">{activity.userName}</TableCell>
      </TableRow>
    ));
  }, [activities]);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white">Recent Inventory Activity</h2>
        <a href="/inventory" className="text-sm font-medium text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400">
          View all
        </a>
      </div>
      <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-700">
              <TableRow>
                <TableHead className="table-header">Asset ID</TableHead>
                <TableHead className="table-header">Name</TableHead>
                <TableHead className="table-header">Department</TableHead>
                <TableHead className="table-header">Action</TableHead>
                <TableHead className="table-header">Date</TableHead>
                <TableHead className="table-header">User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center">
                      <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </TableCell>
                </TableRow>
              ) : activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No recent activity found
                  </TableCell>
                </TableRow>
              ) : (
                activityRows
              )}
            </TableBody>
          </Table>
        </div>
        <div className="table-pagination">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button variant="outline" size="sm" disabled={true} className="border border-slate-300 dark:border-slate-600">
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={true} className="ml-3 border border-slate-300 dark:border-slate-600">
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Showing
                <span className="font-medium mx-1">1</span>
                to
                <span className="font-medium mx-1">{Math.min(5, activities.length)}</span>
                of
                <span className="font-medium mx-1">{activities.length}</span>
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button variant="outline" size="icon" className="rounded-l-md border border-slate-300 dark:border-slate-600">
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-200">
                  1
                </Button>
                <Button variant="outline" size="icon" className="rounded-r-md border border-slate-300 dark:border-slate-600">
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
