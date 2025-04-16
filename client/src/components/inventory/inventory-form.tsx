import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Department, InventoryItem } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, ImagePlus } from "lucide-react";

// Define form schema for validation
const inventoryItemSchema = z.object({
  departmentId: z.coerce.number().min(1, { message: "Department is required" }),
  name: z.string().min(2, { message: "Item name must be at least 2 characters" }),
  description: z.string().nullable().optional(),
  quantity: z.coerce.number().int().min(1, { message: "Quantity must be at least 1" }),
  unitPrice: z.coerce.number().int().min(0, { message: "Unit price must be non-negative" }).nullable().optional(),
  location: z.string().nullable().optional(),
  purchaseDate: z.preprocess(
    (arg) => {
      if (typeof arg === 'string') {
        // Convert from string date to Date object
        return new Date(arg);
      }
      return arg;
    },
    z.date().nullable().optional()
  ),
  status: z.enum(["active", "low", "ordered", "discontinued"]).default("active"),
});

type InventoryFormValues = z.infer<typeof inventoryItemSchema>;

export default function InventoryForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [assetId, setAssetId] = useState("A-####");
  
  // Fetch departments
  const { data: departments, isLoading: isDepartmentsLoading } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });
  
  // Form setup
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      departmentId: departments && departments.length > 0 ? departments[0].id : 0,
      name: "",
      description: "",
      quantity: 1,
      unitPrice: null,
      location: "",
      purchaseDate: new Date(),
      status: "active",
    },
  });
  
  // Update the form's department when departments are loaded
  useEffect(() => {
    if (departments && departments.length > 0) {
      form.setValue("departmentId", departments[0].id);
    }
  }, [departments, form]);
  
  // Submit mutation for adding an item
  const addItemMutation = useMutation({
    mutationFn: async (values: InventoryFormValues) => {
      const res = await apiRequest("POST", "/api/inventory", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Item added",
        description: "The inventory item has been added successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submission handlers
  const onSubmit = (values: InventoryFormValues) => {
    addItemMutation.mutate(values);
  };
  
  const onSubmitAndClear = (values: InventoryFormValues) => {
    addItemMutation.mutate(values);
    form.reset({
      departmentId: form.getValues().departmentId, // Keep the department
      name: "",
      description: "",
      quantity: 1,
      unitPrice: null,
      location: "",
      purchaseDate: new Date(),
      status: "active",
    });
  };

  return (
    <Card>
      <CardContent className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-6">New Inventory Item</h2>
        
        <Form {...form}>
          <form className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <FormLabel htmlFor="asset-id">Asset ID</FormLabel>
              <div className="mt-1 relative">
                <Input
                  id="asset-id"
                  value={assetId}
                  disabled
                  className="form-disabled-input"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500 text-xs">
                  Auto-generated
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>Department</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isDepartmentsLoading ? (
                        <SelectItem value="loading" disabled>Loading departments...</SelectItem>
                      ) : departments && departments.length > 0 ? (
                        departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No departments available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="sm:col-span-6">
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter item name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="sm:col-span-6">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter item description" 
                      rows={3}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1"
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Unit Price</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500 sm:text-sm">$</span>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-7"
                        value={field.value ? field.value / 100 : ''}
                        onChange={(e) => {
                          const valueInDollars = e.target.value ? parseFloat(e.target.value) : undefined;
                          // Convert to cents for database storage (integer)
                          const valueInCents = valueInDollars ? Math.round(valueInDollars * 100) : null;
                          field.onChange(valueInCents);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Storage location" 
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>Purchase Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      value={field.value ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        field.onChange(e.target.value ? new Date(e.target.value) : null);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">In Stock</SelectItem>
                      <SelectItem value="low">Low Stock</SelectItem>
                      <SelectItem value="ordered">On Order</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="sm:col-span-6">
              <FormLabel>Item Image</FormLabel>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <ImagePlus className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
                  <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>

            <div className="sm:col-span-6 mt-8 flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={addItemMutation.isPending || !form.formState.isValid}
                onClick={() => {
                  const values = form.getValues();
                  onSubmitAndClear(values);
                }}
              >
                {addItemMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add & Clear Form"
                )}
              </Button>
              <Button 
                type="button" 
                disabled={addItemMutation.isPending || !form.formState.isValid}
                onClick={form.handleSubmit(onSubmit)}
              >
                {addItemMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Item"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
