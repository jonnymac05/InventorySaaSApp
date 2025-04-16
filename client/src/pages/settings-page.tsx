import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Company } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2 } from "lucide-react";

// Define form schema for validation
const companySettingsSchema = z.object({
  name: z.string().min(2, { message: "Company name must be at least 2 characters" }),
  assetIdPattern: z.string().min(2, { message: "Asset ID pattern is required" }),
});

const subscriptionSchema = z.object({
  plan: z.enum(["free", "basic", "premium", "enterprise"]),
  billingCycle: z.enum(["monthly", "annual"]),
});

type CompanySettingsFormValues = z.infer<typeof companySettingsSchema>;
type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("company");
  
  // Fetch company data
  const { data: company, isLoading } = useQuery<Company>({
    queryKey: ["/api/company"],
  });
  
  // Company settings form
  const companyForm = useForm<CompanySettingsFormValues>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      name: company?.name || "",
      assetIdPattern: company?.assetIdPattern || "A-####",
    },
    values: {
      name: company?.name || "",
      assetIdPattern: company?.assetIdPattern || "A-####",
    },
  });
  
  // Subscription form
  const subscriptionForm = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      plan: "free",
      billingCycle: "monthly",
    },
  });
  
  // Update company settings mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (values: CompanySettingsFormValues) => {
      // This would be implemented in production
      // const res = await apiRequest("PUT", "/api/company", values);
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
        description: "Updating company settings is disabled in this version.",
      });
      
      // queryClient.invalidateQueries({ queryKey: ["/api/company"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update subscription mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: async (values: SubscriptionFormValues) => {
      // This would be implemented in production
      // const res = await apiRequest("PUT", "/api/subscription", values);
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
        description: "Updating subscription is disabled in this version.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submission handlers
  const onCompanySubmit = (values: CompanySettingsFormValues) => {
    updateCompanyMutation.mutate(values);
  };
  
  const onSubscriptionSubmit = (values: SubscriptionFormValues) => {
    updateSubscriptionMutation.mutate(values);
  };
  
  // Check if the current user is an admin
  const isAdmin = user?.role === "admin";

  // Subscription plan data
  const subscriptionPlans = [
    {
      id: "free",
      name: "Free",
      price: { monthly: "$0", annual: "$0" },
      description: "For small teams or personal use",
      features: [
        "Up to 3 users",
        "100 inventory items",
        "Basic reporting",
        "1 department",
        "No custom fields"
      ],
      current: company?.subscriptionTier === "free"
    },
    {
      id: "basic",
      name: "Basic",
      price: { monthly: "$29", annual: "$290" },
      description: "For growing teams",
      features: [
        "Up to 10 users",
        "1,000 inventory items",
        "Advanced reporting",
        "Up to 5 departments",
        "5 custom fields"
      ],
      current: company?.subscriptionTier === "basic"
    },
    {
      id: "premium",
      name: "Premium",
      price: { monthly: "$79", annual: "$790" },
      description: "For medium-sized companies",
      features: [
        "Up to 25 users",
        "10,000 inventory items",
        "Custom asset IDs",
        "Up to 15 departments",
        "Unlimited custom fields",
        "CSV import/export"
      ],
      current: company?.subscriptionTier === "premium"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: { monthly: "$199", annual: "$1,990" },
      description: "For large organizations",
      features: [
        "Unlimited users",
        "Unlimited inventory items",
        "Advanced custom fields",
        "API access",
        "Unlimited departments",
        "Priority support"
      ],
      current: company?.subscriptionTier === "enterprise"
    }
  ];

  return (
    <DashboardLayout title="Settings">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="company">Company Settings</TabsTrigger>
          <TabsTrigger value="subscription">Subscription & Billing</TabsTrigger>
          <TabsTrigger value="profile">Your Profile</TabsTrigger>
        </TabsList>
        
        {/* Company Settings Tab */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Settings</CardTitle>
              <CardDescription>
                Configure your company profile and global settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Form {...companyForm}>
                  <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-8">
                    <FormField
                      control={companyForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter company name" {...field} />
                          </FormControl>
                          <FormDescription>
                            This will be displayed throughout the application.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={companyForm.control}
                      name="assetIdPattern"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asset ID Pattern</FormLabel>
                          <FormControl>
                            <Input placeholder="A-####" {...field} />
                          </FormControl>
                          <FormDescription>
                            Use # characters as placeholders for numbers. Example: A-#### will generate A-0001, A-0002, etc.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Email Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="notify-inventory">Inventory Alerts</Label>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              Receive alerts when inventory items are low or out of stock
                            </div>
                          </div>
                          <Switch id="notify-inventory" defaultChecked={true} disabled={!isAdmin} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="notify-users">User Activity</Label>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              Receive notifications about user actions and registrations
                            </div>
                          </div>
                          <Switch id="notify-users" defaultChecked={true} disabled={!isAdmin} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="notify-billing">Billing Updates</Label>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              Receive notifications about billing and subscription changes
                            </div>
                          </div>
                          <Switch id="notify-billing" defaultChecked={true} disabled={!isAdmin} />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Advanced Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="enable-api">API Access</Label>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              Enable API access for integrating with other systems
                            </div>
                          </div>
                          <Switch id="enable-api" disabled={!isAdmin || company?.subscriptionTier !== "enterprise"} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="data-export">Data Export</Label>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              Allow exporting of inventory data to CSV/Excel
                            </div>
                          </div>
                          <Switch id="data-export" defaultChecked={true} disabled={!isAdmin} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={updateCompanyMutation.isPending || !isAdmin}
                      >
                        {updateCompanyMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Subscription & Billing Tab */}
        <TabsContent value="subscription">
          <div className="grid gap-4 md:grid-cols-5">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  Your current subscription and usage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {company?.subscriptionTier.charAt(0).toUpperCase() + company?.subscriptionTier.slice(1)} Plan
                      </div>
                      <Badge variant="default" className="capitalize">
                        {company?.subscriptionStatus}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Your current billing cycle: <span className="font-medium text-slate-700 dark:text-slate-300">Monthly</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Usage</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Users</span>
                          <span>1 / 3</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '33%' }}></div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span>Items</span>
                          <span>0 / 100</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span>Departments</span>
                          <span>1 / 1</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="border-t bg-slate-50 dark:bg-slate-800 p-4 flex-col items-start gap-2">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Need help with your subscription?
                </div>
                <Button variant="outline" size="sm" className="mt-2" disabled={true}>
                  Contact Support
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Change Plan</CardTitle>
                <CardDescription>
                  Select a plan that fits your needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...subscriptionForm}>
                  <form onSubmit={subscriptionForm.handleSubmit(onSubscriptionSubmit)} className="space-y-6">
                    <FormField
                      control={subscriptionForm.control}
                      name="billingCycle"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Billing Cycle</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex space-x-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="monthly" id="monthly" />
                                <Label htmlFor="monthly">Monthly</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="annual" id="annual" />
                                <Label htmlFor="annual">Annual (Save 20%)</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={subscriptionForm.control}
                      name="plan"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Select Plan</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                            >
                              {subscriptionPlans.map((plan) => {
                                const cycle = subscriptionForm.watch('billingCycle');
                                
                                return (
                                  <div key={plan.id} className="relative">
                                    <RadioGroupItem 
                                      value={plan.id} 
                                      id={plan.id} 
                                      className="peer sr-only" 
                                    />
                                    <Label
                                      htmlFor={plan.id}
                                      className="flex flex-col border border-slate-200 dark:border-slate-700 rounded-lg p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-slate-50 dark:peer-data-[state=checked]:bg-slate-800"
                                    >
                                      <div className="flex justify-between">
                                        <span className="font-medium">{plan.name}</span>
                                        {plan.current && (
                                          <Badge variant="outline" className="text-green-600 border-green-400 bg-green-50">
                                            Current
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="mt-1">
                                        <span className="text-xl font-bold">{plan.price[cycle]}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                          {cycle === "monthly" ? "/month" : "/year"}
                                        </span>
                                      </div>
                                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                        {plan.description}
                                      </div>
                                    </Label>
                                    {plan.current && (
                                      <CheckCircle className="absolute top-3 right-3 h-5 w-5 text-primary" />
                                    )}
                                  </div>
                                );
                              })}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={updateSubscriptionMutation.isPending || !isAdmin}
                      >
                        {updateSubscriptionMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Subscription"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          {/* Subscription features comparison */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Plan Features Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left font-medium py-2 px-4">Feature</th>
                      {subscriptionPlans.map(plan => (
                        <th key={plan.id} className="text-center font-medium py-2 px-4 capitalize">
                          {plan.name}
                          {plan.current && <span className="ml-2 text-primary">(Current)</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-200 dark:border-slate-700">
                      <td className="py-2 px-4">Users</td>
                      <td className="text-center py-2 px-4">3</td>
                      <td className="text-center py-2 px-4">10</td>
                      <td className="text-center py-2 px-4">25</td>
                      <td className="text-center py-2 px-4">Unlimited</td>
                    </tr>
                    <tr className="border-t border-slate-200 dark:border-slate-700">
                      <td className="py-2 px-4">Inventory Items</td>
                      <td className="text-center py-2 px-4">100</td>
                      <td className="text-center py-2 px-4">1,000</td>
                      <td className="text-center py-2 px-4">10,000</td>
                      <td className="text-center py-2 px-4">Unlimited</td>
                    </tr>
                    <tr className="border-t border-slate-200 dark:border-slate-700">
                      <td className="py-2 px-4">Departments</td>
                      <td className="text-center py-2 px-4">1</td>
                      <td className="text-center py-2 px-4">5</td>
                      <td className="text-center py-2 px-4">15</td>
                      <td className="text-center py-2 px-4">Unlimited</td>
                    </tr>
                    <tr className="border-t border-slate-200 dark:border-slate-700">
                      <td className="py-2 px-4">Custom Fields</td>
                      <td className="text-center py-2 px-4">❌</td>
                      <td className="text-center py-2 px-4">5</td>
                      <td className="text-center py-2 px-4">Unlimited</td>
                      <td className="text-center py-2 px-4">Unlimited</td>
                    </tr>
                    <tr className="border-t border-slate-200 dark:border-slate-700">
                      <td className="py-2 px-4">Custom Asset IDs</td>
                      <td className="text-center py-2 px-4">❌</td>
                      <td className="text-center py-2 px-4">❌</td>
                      <td className="text-center py-2 px-4">✅</td>
                      <td className="text-center py-2 px-4">✅</td>
                    </tr>
                    <tr className="border-t border-slate-200 dark:border-slate-700">
                      <td className="py-2 px-4">Import/Export</td>
                      <td className="text-center py-2 px-4">❌</td>
                      <td className="text-center py-2 px-4">❌</td>
                      <td className="text-center py-2 px-4">✅</td>
                      <td className="text-center py-2 px-4">✅</td>
                    </tr>
                    <tr className="border-t border-slate-200 dark:border-slate-700">
                      <td className="py-2 px-4">API Access</td>
                      <td className="text-center py-2 px-4">❌</td>
                      <td className="text-center py-2 px-4">❌</td>
                      <td className="text-center py-2 px-4">❌</td>
                      <td className="text-center py-2 px-4">✅</td>
                    </tr>
                    <tr className="border-t border-slate-200 dark:border-slate-700">
                      <td className="py-2 px-4">Priority Support</td>
                      <td className="text-center py-2 px-4">❌</td>
                      <td className="text-center py-2 px-4">❌</td>
                      <td className="text-center py-2 px-4">❌</td>
                      <td className="text-center py-2 px-4">✅</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* User Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>
                Manage your personal account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-slate-600 flex items-center justify-center text-white text-xl">
                  {user?.name?.substring(0, 2) || "U"}
                </div>
                <div>
                  <h3 className="text-lg font-medium">{user?.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {user?.email}
                  </p>
                  <div className="mt-1">
                    <Badge variant="outline" className="capitalize">
                      {user?.role}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">Full Name</Label>
                    <Input id="profile-name" defaultValue={user?.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-email">Email Address</Label>
                    <Input id="profile-email" type="email" defaultValue={user?.email} />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Change Password</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div></div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notify-email">Email Notifications</Label>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Receive notifications via email
                      </div>
                    </div>
                    <Switch id="notify-email" defaultChecked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notify-web">In-App Notifications</Label>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Receive notifications within the application
                      </div>
                    </div>
                    <Switch id="notify-web" defaultChecked={true} />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 border-t p-4">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
