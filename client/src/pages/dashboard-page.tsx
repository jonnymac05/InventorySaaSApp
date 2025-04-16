import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/dashboard-layout";
import SummaryCard from "@/components/dashboard/summary-card";
import RecentActivity from "@/components/dashboard/recent-activity";
import DepartmentOverview from "@/components/dashboard/department-overview";
import { Archive, ArrowUpCircle, AlertTriangle, Users } from "lucide-react";

export default function DashboardPage() {
  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Items",
      value: isLoading ? "..." : dashboardData?.totalItems || 0,
      icon: Archive,
      color: "bg-blue-500",
      linkText: "View all",
      linkHref: "/inventory"
    },
    {
      title: "Items Added (Month)",
      value: isLoading ? "..." : dashboardData?.itemsAddedThisMonth || 0,
      icon: ArrowUpCircle,
      color: "bg-green-500",
      linkText: "View details",
      linkHref: "/inventory"
    },
    {
      title: "Low Stock Items",
      value: isLoading ? "..." : dashboardData?.lowStockItems || 0,
      icon: AlertTriangle,
      color: "bg-yellow-500",
      linkText: "View all",
      linkHref: "/inventory?status=low"
    },
    {
      title: "Departments",
      value: isLoading ? "..." : dashboardData?.departmentCount || 0,
      icon: Users,
      color: "bg-indigo-500",
      linkText: "Manage",
      linkHref: "/departments"
    }
  ];

  return (
    <DashboardLayout title="Dashboard">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, index) => (
          <SummaryCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            linkText={card.linkText}
            linkHref={card.linkHref}
          />
        ))}
      </div>

      {/* Recent Activity */}
      <RecentActivity 
        activities={dashboardData?.recentActivity || []} 
        loading={isLoading} 
      />

      {/* Department Overview */}
      <DepartmentOverview 
        departments={dashboardData?.departmentStats || []}
        loading={isLoading}
      />
    </DashboardLayout>
  );
}
