import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertDepartmentSchema, insertInventoryItemSchema } from "@shared/schema";

// Request with authenticated user
interface AuthRequest extends Request {
  user?: Express.User;
}

// Middleware to check if user is authenticated
function requireAuth(req: AuthRequest, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Company data
  app.get("/api/company", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const company = await storage.getCompany(user.companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Department routes
  app.get("/api/departments", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const departments = await storage.getDepartmentsByCompany(user.companyId);
      res.json(departments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/departments", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      
      // Check if user is admin
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Only admins can create departments" });
      }
      
      const departmentData = insertDepartmentSchema.parse({
        ...req.body,
        companyId: user.companyId,
        assetCount: 0,
        capacityUsed: 0
      });
      
      const department = await storage.createDepartment(departmentData);
      res.status(201).json(department);
    } catch (error) {
      console.error(error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const inventoryItems = await storage.getInventoryItemsByCompany(user.companyId);
      res.json(inventoryItems);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/inventory", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      
      // Validate department access
      const departmentId = req.body.departmentId;
      if (!departmentId) {
        return res.status(400).json({ message: "Department ID is required" });
      }
      
      // Admin can add to any department, employees need department access
      if (user.role !== "admin") {
        const userDepartments = await storage.getUserDepartments(user.id);
        const hasDepartmentAccess = userDepartments.some(ud => ud.departmentId === departmentId);
        if (!hasDepartmentAccess) {
          return res.status(403).json({ message: "You don't have access to this department" });
        }
      }
      
      const itemData = insertInventoryItemSchema.parse({
        ...req.body,
        companyId: user.companyId,
        createdBy: user.id,
        updatedBy: user.id
      });
      
      const item = await storage.createInventoryItem(itemData);
      
      // Create activity log
      await storage.createActivityLog({
        action: "added",
        itemId: item.id,
        assetId: item.assetId,
        itemName: item.name,
        departmentName: (await storage.getDepartment(item.departmentId))?.name || "Unknown",
        userId: user.id,
        userName: user.name,
        companyId: user.companyId
      });
      
      res.status(201).json(item);
    } catch (error) {
      console.error(error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/inventory/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const itemId = parseInt(req.params.id);
      
      // Check if item exists and belongs to user's company
      const existingItem = await storage.getInventoryItem(itemId);
      if (!existingItem) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      if (existingItem.companyId !== user.companyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Admin can update any item, employees need department access
      if (user.role !== "admin") {
        const userDepartments = await storage.getUserDepartments(user.id);
        const hasDepartmentAccess = userDepartments.some(ud => ud.departmentId === existingItem.departmentId);
        if (!hasDepartmentAccess) {
          return res.status(403).json({ message: "You don't have access to this department" });
        }
      }
      
      const updatedItem = await storage.updateInventoryItem(itemId, {
        ...req.body,
        updatedBy: user.id
      });
      
      // Create activity log
      await storage.createActivityLog({
        action: "updated",
        itemId: updatedItem.id,
        assetId: updatedItem.assetId,
        itemName: updatedItem.name,
        departmentName: (await storage.getDepartment(updatedItem.departmentId))?.name || "Unknown",
        userId: user.id,
        userName: user.name,
        companyId: user.companyId
      });
      
      res.json(updatedItem);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/inventory/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const itemId = parseInt(req.params.id);
      
      // Check if item exists and belongs to user's company
      const existingItem = await storage.getInventoryItem(itemId);
      if (!existingItem) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      if (existingItem.companyId !== user.companyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Only admins can delete items
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Only admins can delete items" });
      }
      
      // Save item info before deletion
      const itemName = existingItem.name;
      const departmentName = (await storage.getDepartment(existingItem.departmentId))?.name || "Unknown";
      const assetId = existingItem.assetId;
      
      // Delete the item
      await storage.deleteInventoryItem(itemId);
      
      // Create activity log
      await storage.createActivityLog({
        action: "removed",
        itemId: itemId,
        assetId: assetId,
        itemName: itemName,
        departmentName: departmentName,
        userId: user.id,
        userName: user.name,
        companyId: user.companyId
      });
      
      res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Activity logs
  app.get("/api/activity", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivityLogsByCompany(user.companyId, limit);
      res.json(activities);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Dashboard data (summary stats)
  app.get("/api/dashboard", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      
      // Get total item count
      const inventoryItems = await storage.getInventoryItemsByCompany(user.companyId);
      const totalItems = inventoryItems.length;
      
      // Get items added this month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const itemsAddedThisMonth = inventoryItems.filter(
        item => item.createdAt >= firstDayOfMonth
      ).length;
      
      // Get low stock items
      const lowStockItems = inventoryItems.filter(
        item => item.status === "low"
      ).length;
      
      // Get departments count
      const departments = await storage.getDepartmentsByCompany(user.companyId);
      const departmentCount = departments.length;
      
      // Get recent activity
      const recentActivity = await storage.getActivityLogsByCompany(user.companyId, 5);
      
      // Department stats
      const departmentStats = departments.map(dept => ({
        id: dept.id,
        name: dept.name,
        assetCount: dept.assetCount,
        capacityUsed: dept.capacityUsed
      }));
      
      res.json({
        totalItems,
        itemsAddedThisMonth,
        lowStockItems,
        departmentCount,
        recentActivity,
        departmentStats
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
