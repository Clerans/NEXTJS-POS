import { db } from "@/lib/db";

export interface StockMovementPayload {
  branchId: number;
  productId?: number;
  rawMaterialId?: number;
  movementType:
    | "OPENING"
    | "SALE"
    | "PURCHASE_RECEIPT"
    | "SALE_RETURN"
    | "SUPPLIER_RETURN"
    | "ADJUSTMENT"
    | "TRANSFER_IN"
    | "TRANSFER_OUT"
    | "WASTAGE"
    | "PRODUCTION_CONSUMED"
    | "PRODUCTION_YIELD";
  quantity: number; // positive for additions, negative for deductions
  unitCost?: number;
  referenceType?: "SALE" | "GRN" | "RETURN" | "TRANSFER" | "ADJUSTMENT" | "PRODUCTION";
  referenceId?: string;
  userId?: number;
  notes?: string;
}

export interface InventoryLedgerEntry extends StockMovementPayload {
  id: string;
  previousStock: number;
  newStock: number;
  createdAt: string;
}

// In-memory ledger storage (synced with db persistence)
export const globalInventoryLedger: InventoryLedgerEntry[] = [];

/**
 * Records an immutable stock movement in the ledger and updates stock level
 */
export function recordStockMovement(payload: StockMovementPayload): InventoryLedgerEntry {
  let previousStock = 0;
  let newStock = 0;

  if (payload.productId) {
    const product = db.products.find((p) => p.id === payload.productId);
    if (product) {
      previousStock = product.stock || 0;
      newStock = previousStock + payload.quantity;
      product.stock = newStock;
    }
  } else if (payload.rawMaterialId) {
    const rawMaterial = db.rawMaterials.find((r) => r.id === payload.rawMaterialId);
    if (rawMaterial) {
      previousStock = rawMaterial.currentStock || 0;
      newStock = previousStock + payload.quantity;
      rawMaterial.currentStock = newStock;
    }
  }

  const entry: InventoryLedgerEntry = {
    ...payload,
    id: `LEDGER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    previousStock,
    newStock,
    createdAt: new Date().toISOString(),
  };

  globalInventoryLedger.unshift(entry);
  return entry;
}
