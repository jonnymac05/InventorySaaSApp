import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Department } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Loader2, Users } from "lucide-react";

// Define form schema for validation
const departmentSchema = z.object({
  name: z.string().min(2, { message: "Department name must be at least 2 characters" }),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

export default function DepartmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  
  // Fetch departments
  const { data: departments, isLoading } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });
  
  // Form setup
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
    },
  });
  
  // Add department mutation
  const addDepartmentMutation = useMutation({
    mutationFn: async (values: DepartmentFormValues) => {
      const res = await apiRequest("POST", "/api/departments", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Department added",
        description: "The department has been added successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add department",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete department mutation (Note: Backend implementation needed)
  const deleteDepartmentMutation = useMutation({
    mutationFn: async (departmentId: number) => {
      // This would be implemented in production
      // await apiRequest("DELETE", `/api/departments/${departmentId}`);
      
      // For now, we'll just show a message
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 1000);
      });
    },
    onSuccess: () => {
      toast({
        title: "Operation unavailable",
        description: "Deleting departments is disabled in this version.",
      });
      setDepartmentToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (values: DepartmentFormValues) => {
    addDepartmentMutation.mutate(values);
  };
  
  // Handle delete confirmation
  const confirmDelete = () => {
    if (departmentToDelete) {
      deleteDepartmentMutation.mutate(departmentToDelete.id);
    }
  };
  
  // Calculate capacity percentage
  const calculateCapacityPercentage = (department: Department) => {
    return department.capacityUsed === 0 ? 0 : Math.min(100, Math.round((department.capacityUsed / 100) * 100));
  };
  
  // Department color based on name (for visual variety)
  const getDepartmentColor = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("it")) return "bg-blue-500";
    if (lowerName.includes("hr")) return "bg-green-500";
    if (lowerName.includes("design")) return "bg-purple-500";
    if (lowerName.includes("finance")) return "bg-amber-500";
    if (lowerName.includes("marketing")) return "bg-pink-500";
    if (lowerName.includes("sales")) return "bg-cyan-500";
    if (lowerName.includes("general")) return "bg-indigo-500";
    // Generate a pseudorandom color based on the name
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500", "bg-pink-500", "bg-cyan-500", "bg-indigo-500"];
    return colors[hash % colors.length];
  };

  return (
    <DashboardLayout title="Departments">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Department Management</h1>
        {user?.role === "admin" && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Department</DialogTitle>
                <DialogDescription>
                  Create a new department to organize your inventory items.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter department name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This will be used to categorize inventory items.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={addDepartmentMutation.isPending}
                    >
                      {addDepartmentMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Department"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {/* Department Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="h-48 animate-pulse">
              <CardContent className="p-6"></CardContent>
            </Card>
          ))}
        </div>
      ) : departments && departments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((department) => (
            <Card key={department.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 mr-4 ${getDepartmentColor(department.name)}`}>
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>{department.name}</CardTitle>
                      <CardDescription>{department.assetCount} assets</CardDescription>
                    </div>
                  </div>
                  
                  {user?.role === "admin" && (
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" disabled>
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-red-500"
                            disabled={department.name === "General"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete the department "{department.name}" and potentially impact inventory items assigned to it.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteDepartmentMutation.mutate(department.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deleteDepartmentMutation.isPending ? (
                                <span className="flex items-center">
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Deleting...
                                </span>
                              ) : (
                                "Delete"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Space Used</span>
                    <span className="text-slate-900 dark:text-white">{calculateCapacityPercentage(department)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className={`${getDepartmentColor(department.name)} h-2 rounded-full`} 
                      style={{ width: `${calculateCapacityPercentage(department)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="bg-slate-50 dark:bg-slate-700 py-3">
                <Button variant="link" className="px-0 text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400">
                  View department details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 mb-2">
              <Users className="h-8 w-8 text-slate-500" />
            </div>
            <CardTitle>No Departments Found</CardTitle>
            <CardDescription className="max-w-md">
              You haven't created any departments yet. Departments help you organize your inventory items and control user access.
            </CardDescription>
            {user?.role === "admin" && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Department
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
