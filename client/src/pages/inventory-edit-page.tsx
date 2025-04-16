import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import DashboardLayout from "@/components/layout/dashboard-layout";
import InventoryForm from "@/components/inventory/inventory-form";
import { InventoryItem } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function InventoryEditPage() {
  const { id } = useParams<{ id: string }>();
  const itemId = parseInt(id);
  
  // Fetch inventory item data
  const { data: item, isLoading } = useQuery<InventoryItem>({
    queryKey: ["/api/inventory", itemId],
    queryFn: async () => {
      const response = await fetch(`/api/inventory/${itemId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch item data");
      }
      return response.json();
    },
    enabled: !!itemId && !isNaN(itemId),
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Edit Inventory">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Inventory">
      {item ? (
        <InventoryForm initialData={item} isEditing={true} />
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Item not found or you don't have permission to edit it.
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}