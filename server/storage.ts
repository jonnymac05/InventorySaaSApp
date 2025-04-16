import { users, companies, departments, userDepartments, customFields, inventoryItems, activityLogs } from "@shared/schema";
import type { User, Company, Department, UserDepartment, CustomField, InventoryItem, ActivityLog,
  InsertUser, InsertCompany, InsertDepartment, InsertUserDepartment, InsertCustomField, 
  InsertInventoryItem, InsertActivityLog } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Storage interface
export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Company methods
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  
  // Department methods
  getDepartment(id: number): Promise<Department | undefined>;
  getDepartmentsByCompany(companyId: number): Promise<Department[]>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: number, data: Partial<Department>): Promise<Department>;
  
  // User-Department methods
  assignUserToDepartment(data: InsertUserDepartment): Promise<UserDepartment>;
  getUserDepartments(userId: number): Promise<UserDepartment[]>;
  
  // Custom fields methods
  createCustomField(field: InsertCustomField): Promise<CustomField>;
  getCustomFieldsByCompany(companyId: number): Promise<CustomField[]>;
  getCustomFieldsByDepartment(departmentId: number): Promise<CustomField[]>;
  
  // Inventory items methods
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  getInventoryItemsByCompany(companyId: number): Promise<InventoryItem[]>;
  getInventoryItemsByDepartment(departmentId: number): Promise<InventoryItem[]>;
  updateInventoryItem(id: number, data: Partial<InventoryItem>): Promise<InventoryItem>;
  deleteInventoryItem(id: number): Promise<void>;
  
  // Activity log methods
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogsByCompany(companyId: number, limit?: number): Promise<ActivityLog[]>;
  
  // Asset ID generation
  generateAssetId(companyId: number): Promise<string>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private companies: Map<number, Company>;
  private departments: Map<number, Department>;
  private userDepartments: Map<number, UserDepartment>;
  private customFields: Map<number, CustomField>;
  private inventoryItems: Map<number, InventoryItem>;
  private activityLogs: Map<number, ActivityLog>;
  
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private companyIdCounter: number;
  private departmentIdCounter: number;
  private userDepartmentIdCounter: number;
  private customFieldIdCounter: number;
  private inventoryItemIdCounter: number;
  private activityLogIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.departments = new Map();
    this.userDepartments = new Map();
    this.customFields = new Map();
    this.inventoryItems = new Map();
    this.activityLogs = new Map();
    
    this.userIdCounter = 1;
    this.companyIdCounter = 1;
    this.departmentIdCounter = 1;
    this.userDepartmentIdCounter = 1;
    this.customFieldIdCounter = 1;
    this.inventoryItemIdCounter = 1;
    this.activityLogIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...userData, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  // Company methods
  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }
  
  async createCompany(companyData: InsertCompany): Promise<Company> {
    const id = this.companyIdCounter++;
    const now = new Date();
    const company: Company = { 
      ...companyData, 
      id, 
      currentAssetId: 1,
      createdAt: now 
    };
    this.companies.set(id, company);
    
    // Create a default "General" department for this company
    await this.createDepartment({
      name: "General",
      companyId: id,
      assetCount: 0,
      capacityUsed: 0
    });
    
    return company;
  }
  
  // Department methods
  async getDepartment(id: number): Promise<Department | undefined> {
    return this.departments.get(id);
  }
  
  async getDepartmentsByCompany(companyId: number): Promise<Department[]> {
    return Array.from(this.departments.values()).filter(
      (dept) => dept.companyId === companyId
    );
  }
  
  async createDepartment(departmentData: InsertDepartment): Promise<Department> {
    const id = this.departmentIdCounter++;
    const now = new Date();
    const department: Department = { ...departmentData, id, createdAt: now };
    this.departments.set(id, department);
    return department;
  }
  
  async updateDepartment(id: number, data: Partial<Department>): Promise<Department> {
    const department = this.departments.get(id);
    if (!department) {
      throw new Error(`Department with id ${id} not found`);
    }
    
    const updatedDepartment = { ...department, ...data };
    this.departments.set(id, updatedDepartment);
    return updatedDepartment;
  }
  
  // User-Department methods
  async assignUserToDepartment(data: InsertUserDepartment): Promise<UserDepartment> {
    const id = this.userDepartmentIdCounter++;
    const now = new Date();
    const userDepartment: UserDepartment = { ...data, id, createdAt: now };
    this.userDepartments.set(id, userDepartment);
    return userDepartment;
  }
  
  async getUserDepartments(userId: number): Promise<UserDepartment[]> {
    return Array.from(this.userDepartments.values()).filter(
      (ud) => ud.userId === userId
    );
  }
  
  // Custom fields methods
  async createCustomField(fieldData: InsertCustomField): Promise<CustomField> {
    const id = this.customFieldIdCounter++;
    const now = new Date();
    const customField: CustomField = { ...fieldData, id, createdAt: now };
    this.customFields.set(id, customField);
    return customField;
  }
  
  async getCustomFieldsByCompany(companyId: number): Promise<CustomField[]> {
    return Array.from(this.customFields.values()).filter(
      (field) => field.companyId === companyId && !field.departmentId
    );
  }
  
  async getCustomFieldsByDepartment(departmentId: number): Promise<CustomField[]> {
    return Array.from(this.customFields.values()).filter(
      (field) => field.departmentId === departmentId
    );
  }
  
  // Inventory items methods
  async createInventoryItem(itemData: InsertInventoryItem): Promise<InventoryItem> {
    const id = this.inventoryItemIdCounter++;
    const now = new Date();
    
    // Generate asset ID
    const assetId = await this.generateAssetId(itemData.companyId);
    
    const inventoryItem: InventoryItem = { 
      ...itemData, 
      id, 
      assetId,
      createdAt: now,
      updatedAt: now
    };
    
    this.inventoryItems.set(id, inventoryItem);
    
    // Update department asset count
    const department = await this.getDepartment(itemData.departmentId);
    if (department) {
      await this.updateDepartment(department.id, {
        assetCount: department.assetCount + 1,
        capacityUsed: department.capacityUsed + 10 // Simplified capacity calculation
      });
    }
    
    return inventoryItem;
  }
  
  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }
  
  async getInventoryItemsByCompany(companyId: number): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(
      (item) => item.companyId === companyId
    );
  }
  
  async getInventoryItemsByDepartment(departmentId: number): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(
      (item) => item.departmentId === departmentId
    );
  }
  
  async updateInventoryItem(id: number, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const item = this.inventoryItems.get(id);
    if (!item) {
      throw new Error(`Inventory item with id ${id} not found`);
    }
    
    const now = new Date();
    const updatedItem = { ...item, ...data, updatedAt: now };
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteInventoryItem(id: number): Promise<void> {
    const item = this.inventoryItems.get(id);
    if (!item) {
      throw new Error(`Inventory item with id ${id} not found`);
    }
    
    // Update department asset count
    const department = await this.getDepartment(item.departmentId);
    if (department) {
      await this.updateDepartment(department.id, {
        assetCount: Math.max(0, department.assetCount - 1),
        capacityUsed: Math.max(0, department.capacityUsed - 10) // Simplified capacity calculation
      });
    }
    
    this.inventoryItems.delete(id);
  }
  
  // Activity log methods
  async createActivityLog(logData: InsertActivityLog): Promise<ActivityLog> {
    const id = this.activityLogIdCounter++;
    const now = new Date();
    const activityLog: ActivityLog = { ...logData, id, createdAt: now };
    this.activityLogs.set(id, activityLog);
    return activityLog;
  }
  
  async getActivityLogsByCompany(companyId: number, limit = 10): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter((log) => log.companyId === companyId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  // Asset ID generation
  async generateAssetId(companyId: number): Promise<string> {
    const company = await this.getCompany(companyId);
    if (!company) {
      throw new Error(`Company with id ${companyId} not found`);
    }
    
    const pattern = company.assetIdPattern;
    const currentId = company.currentAssetId;
    
    // Generate the asset ID
    const assetId = pattern.replace(/#+/g, (match) => {
      const paddingLength = match.length;
      return currentId.toString().padStart(paddingLength, '0');
    });
    
    // Update company's current asset ID
    const updatedCompany = { ...company, currentAssetId: currentId + 1 };
    this.companies.set(companyId, updatedCompany);
    
    return assetId;
  }
}

export const storage = new MemStorage();
