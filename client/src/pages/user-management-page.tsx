import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { User, Department } from "@shared/schema";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { 
  Plus, 
  Trash2, 
  Shield, 
  UserCog,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

// Define form schema for validation
const userSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  role: z.enum(["admin", "employee"]),
  departments: z.array(z.number()).min(1, { message: "Select at least one department" }),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function UserManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // We would fetch users from the API in a real implementation
  // For now, we'll just have the current user
  const currentUsers = user ? [user] : [];
  
  // Fetch departments for assigning to users
  const { data: departments } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });
  
  // Form setup
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "employee",
      departments: [],
    },
  });
  
  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      // This would be implemented in production
      // const res = await apiRequest("POST", "/api/users", values);
      // return await res.json();
      
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
        description: "Adding users is disabled in this version.",
      });
      
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add user",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      // This would be implemented in production
      // await apiRequest("DELETE", `/api/users/${userId}`);
      
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
        description: "Deleting users is disabled in this version.",
      });
      setUserToDelete(null);
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
  const onSubmit = (values: UserFormValues) => {
    addUserMutation.mutate(values);
  };
  
  // Role badge style
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Admin
          </Badge>
        );
      case "employee":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1">
            <UserCog className="h-3 w-3" />
            Employee
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  // Check if the current user is an admin
  const isAdmin = user?.role === "admin";

  return (
    <DashboardLayout title="User Management">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">User Management</h1>
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>
                  Add a new user to your company and assign them to departments.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter user's full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="user@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          They'll receive an invitation email at this address.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temporary Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormDescription>
                          User will be prompted to change this password on first login.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="employee">Employee</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Admins can manage the company and all departments.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="departments"
                    render={() => (
                      <FormItem>
                        <div className="mb-2">
                          <FormLabel>Assign to Departments</FormLabel>
                          <FormDescription>
                            Select which departments this user can access.
                          </FormDescription>
                        </div>
                        {departments && departments.length > 0 ? (
                          <div className="space-y-2">
                            {departments.map((department) => (
                              <div key={department.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`department-${department.id}`}
                                  onCheckedChange={(checked) => {
                                    const currentDepts = form.getValues().departments;
                                    if (checked) {
                                      form.setValue('departments', [...currentDepts, department.id]);
                                    } else {
                                      form.setValue(
                                        'departments',
                                        currentDepts.filter(id => id !== department.id)
                                      );
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`department-${department.id}`}
                                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {department.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-500">
                            No departments available. Please create departments first.
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={addUserMutation.isPending}
                    >
                      {addUserMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Inviting...
                        </>
                      ) : (
                        "Send Invitation"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Company Users</CardTitle>
          <CardDescription>
            Manage users and their access to departments in your company.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <UserCog className="h-8 w-8 text-slate-400" />
                      <div className="text-lg font-medium">No users found</div>
                      <div className="text-sm text-slate-500">Invite users to collaborate on your inventory</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center text-white">
                          {user.name.substring(0, 2)}
                        </div>
                        <div>{user.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove {user.name} from your company account. They will lose all access to the system.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteUserMutation.mutate(user.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deleteUserMutation.isPending ? (
                                <span className="flex items-center">
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Removing...
                                </span>
                              ) : (
                                "Remove User"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        
        <CardFooter className="border-t bg-slate-50 dark:bg-slate-800 p-4">
          <div className="text-sm text-muted-foreground">
            User invitations will expire after 24 hours.
          </div>
        </CardFooter>
      </Card>
      
      {/* Company Role Information */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5 text-purple-600" />
              <span>Admin Role</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc ml-5 space-y-2 text-sm">
              <li>Create and manage all departments</li>
              <li>Invite and manage all users</li>
              <li>Edit company settings and subscription</li>
              <li>Access all inventory items across departments</li>
              <li>Import/export data and access reports</li>
              <li>Customize fields and asset ID pattern</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCog className="mr-2 h-5 w-5 text-blue-600" />
              <span>Employee Role</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc ml-5 space-y-2 text-sm">
              <li>Access only assigned departments</li>
              <li>Add and edit inventory items in those departments</li>
              <li>View reports for accessible departments</li>
              <li>Cannot add or remove users</li>
              <li>Cannot modify company settings</li>
              <li>Cannot delete inventory items</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
