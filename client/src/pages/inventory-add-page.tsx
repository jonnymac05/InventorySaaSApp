import DashboardLayout from "@/components/layout/dashboard-layout";
import InventoryForm from "@/components/inventory/inventory-form";

export default function InventoryAddPage() {
  return (
    <DashboardLayout title="Add Inventory">
      <InventoryForm />
    </DashboardLayout>
  );
}
