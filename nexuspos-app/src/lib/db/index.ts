import {
  User,
  Branch,
  Category,
  Unit,
  Product,
  RawMaterial,
  Recipe,
  DiningTable,
  VipRoom,
  Supplier,
  CustomerGroup,
  Customer,
  PurchaseOrder,
  GRN,
  Promotion,
  Employee,
  JobTitle,
  Shift,
  PosOrder,
  SystemSettings,
} from "@/types";
import {
  initialBranches,
  initialUsers,
  initialCategories,
  initialUnits,
  initialProducts,
  initialRawMaterials,
  initialRecipes,
  initialDiningTables,
  initialVipRooms,
  initialSuppliers,
  initialCustomerGroups,
  initialCustomers,
  initialOrders,
  initialPurchaseOrders,
  initialGRNs,
  initialPromotions,
  initialEmployees,
  initialJobs,
  initialShifts,
  initialSettings,
} from "./seed-data";

// Shared Browser & Server In-Memory Data Store
class NexusDataStore {
  public branches: Branch[] = [...initialBranches];
  public users: User[] = [...initialUsers];
  public categories: Category[] = [...initialCategories];
  public units: Unit[] = [...initialUnits];
  public products: Product[] = [...initialProducts];
  public rawMaterials: RawMaterial[] = [...initialRawMaterials];
  public recipes: Recipe[] = [...initialRecipes];
  public tables: DiningTable[] = [...initialDiningTables];
  public vipRooms: VipRoom[] = [...initialVipRooms];
  public suppliers: Supplier[] = [...initialSuppliers];
  public customerGroups: CustomerGroup[] = [...initialCustomerGroups];
  public customers: Customer[] = [...initialCustomers];
  public orders: PosOrder[] = [...initialOrders];
  public purchaseOrders: PurchaseOrder[] = [...initialPurchaseOrders];
  public grns: GRN[] = [...initialGRNs];
  public promotions: Promotion[] = [...initialPromotions];
  public employees: Employee[] = [...initialEmployees];
  public jobs: JobTitle[] = [...initialJobs];
  public shifts: Shift[] = [...initialShifts];
  public settings: SystemSettings = { ...initialSettings };

  public generateOrderId(): string {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const seq = String(this.orders.length + 1).padStart(3, "0");
    return `ORD-${today}-${seq}`;
  }

  public generateSku(categoryName = "GEN"): string {
    const prefix = categoryName.slice(0, 3).toUpperCase();
    const count = this.products.length + 1;
    return `${prefix}-${String(count).padStart(3, "0")}`;
  }
}

// Global singleton instance for hot reloading and client components
const globalForDb = global as unknown as { nexusDb: NexusDataStore | undefined };
export const db = globalForDb.nexusDb || new NexusDataStore();
if (process.env.NODE_ENV !== "production") globalForDb.nexusDb = db;
