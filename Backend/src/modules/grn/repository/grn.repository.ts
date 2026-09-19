import { pool } from '../../../config/db.js';
import { CreateGRNDto, GRNResponseDto, RecordGRNPaymentDto } from '../dto/grn.dto.js';
import { UnprocessableEntityError, NotFoundError } from '../../../common/errors/app-error.js';
import { InventoryRepository } from '../../inventory/repository/inventory.repository.js';

export class GRNRepository {
  private inventoryRepository: InventoryRepository;

  constructor() {
    this.inventoryRepository = new InventoryRepository();
  }

  async findAll(): Promise<GRNResponseDto[]> {
    const result = await pool.query(
      `SELECT g.id, g.grn_number, g.purchase_order_id, g.supplier_id, g.branch_id,
              g.invoice_number, g.total_amount, COALESCE(g.paid_amount, 0) as paid_amount,
              COALESCE(g.payment_status, 'UNPAID') as payment_status,
              g.status, g.created_at,
              s.name as supplier_name
       FROM grns g
       LEFT JOIN suppliers s ON g.supplier_id = s.id
       ORDER BY g.id DESC`
    );

    return result.rows.map((row: any) => {
      const totalAmount = parseFloat(row.total_amount || 0);
      const paidAmount = parseFloat(row.paid_amount || 0);
      const dueBalance = Math.max(0, totalAmount - paidAmount);

      return {
        id: parseInt(row.id, 10),
        grnNumber: row.grn_number,
        purchaseOrderId: row.purchase_order_id ? parseInt(row.purchase_order_id, 10) : null,
        supplierId: parseInt(row.supplier_id || '1', 10),
        supplierName: row.supplier_name || 'Vendor Supplier',
        branchId: parseInt(row.branch_id || '1', 10),
        invoiceNumber: row.invoice_number,
        totalAmount,
        paidAmount,
        dueBalance,
        paymentStatus: (row.payment_status as 'UNPAID' | 'PARTIAL' | 'PAID') || 'UNPAID',
        status: row.status,
        createdAt: row.created_at,
      };
    });
  }

  async findById(id: number): Promise<GRNResponseDto | null> {
    const result = await pool.query(
      `SELECT g.id, g.grn_number, g.purchase_order_id, g.supplier_id, g.branch_id,
              g.invoice_number, g.total_amount, COALESCE(g.paid_amount, 0) as paid_amount,
              COALESCE(g.payment_status, 'UNPAID') as payment_status,
              g.status, g.created_at,
              s.name as supplier_name
       FROM grns g
       LEFT JOIN suppliers s ON g.supplier_id = s.id
       WHERE g.id = $1`,
      [id]
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    const totalAmount = parseFloat(row.total_amount || 0);
    const paidAmount = parseFloat(row.paid_amount || 0);
    const dueBalance = Math.max(0, totalAmount - paidAmount);

    return {
      id: parseInt(row.id, 10),
      grnNumber: row.grn_number,
      purchaseOrderId: row.purchase_order_id ? parseInt(row.purchase_order_id, 10) : null,
      supplierId: parseInt(row.supplier_id || '1', 10),
      supplierName: row.supplier_name || 'Vendor Supplier',
      branchId: parseInt(row.branch_id || '1', 10),
      invoiceNumber: row.invoice_number,
      totalAmount,
      paidAmount,
      dueBalance,
      paymentStatus: (row.payment_status as 'UNPAID' | 'PARTIAL' | 'PAID') || 'UNPAID',
      status: row.status,
      createdAt: row.created_at,
    };
  }

  async create(dto: CreateGRNDto, grnNumber: string, totalAmount: number, userId: number = 1): Promise<GRNResponseDto> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const branchId = dto.branchId || 1;
      let warehouseId = dto.warehouseId;
      if (!warehouseId) {
        const whRes = await client.query('SELECT id FROM warehouses WHERE branch_id = $1 LIMIT 1', [branchId]);
        warehouseId = whRes.rows.length > 0 ? parseInt(whRes.rows[0].id, 10) : branchId;
      }

      // 1. Validate PO if provided
      if (dto.purchaseOrderId) {
        const poRes = await client.query('SELECT id, status FROM purchase_orders WHERE id = $1 FOR UPDATE', [dto.purchaseOrderId]);
        if (poRes.rows.length === 0) {
          throw new NotFoundError(`Purchase Order #${dto.purchaseOrderId} not found`);
        }

        const poStatus = poRes.rows[0].status;
        if (poStatus !== 'APPROVED' && poStatus !== 'PARTIALLY_RECEIVED') {
          throw new UnprocessableEntityError(
            `Cannot receive items against Purchase Order #${dto.purchaseOrderId} in status ${poStatus}`
          );
        }
      }

      // 2. Insert GRN Master Record
      const grnRes = await client.query(
        `INSERT INTO grns (grn_number, purchase_order_id, supplier_id, branch_id, invoice_number, total_amount, paid_amount, payment_status, status)
         VALUES ($1, $2, $3, $4, $5, $6, 0.00, 'UNPAID', 'RECEIVED')
         RETURNING id, created_at`,
        [
          grnNumber,
          dto.purchaseOrderId || null,
          dto.supplierId,
          branchId,
          dto.invoiceNumber,
          totalAmount,
        ]
      );

      const grnId = parseInt(grnRes.rows[0].id, 10);

      // 3. Process Items
      for (const item of dto.items) {
        const itemTotal = item.receivedQuantity * item.unitCost;

        if (dto.purchaseOrderId) {
          const poItemRes = await client.query(
            `SELECT id, quantity, COALESCE(received_quantity, 0) as received_quantity
             FROM po_items
             WHERE purchase_order_id = $1 AND (product_id = $2 OR raw_material_id = $3)
             FOR UPDATE`,
            [dto.purchaseOrderId, item.productId || null, item.rawMaterialId || null]
          );

          if (poItemRes.rows.length > 0) {
            const orderedQty = parseFloat(poItemRes.rows[0].quantity);
            const currentReceived = parseFloat(poItemRes.rows[0].received_quantity);
            const remainingQty = orderedQty - currentReceived;

            if (item.receivedQuantity > remainingQty && !dto.allowOverReceiving) {
              throw new UnprocessableEntityError(
                `Over-receiving rejected. Remaining ordered quantity is ${remainingQty}, attempted to receive ${item.receivedQuantity}`
              );
            }

            await client.query(
              `UPDATE po_items SET received_quantity = received_quantity + $1 WHERE id = $2`,
              [item.receivedQuantity, poItemRes.rows[0].id]
            );
          }
        }

        await client.query(
          `INSERT INTO grn_items (grn_id, product_id, raw_material_id, quantity_received, unit_cost, total_cost)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [grnId, item.productId || null, item.rawMaterialId || null, item.receivedQuantity, item.unitCost, itemTotal]
        );

        const batchNo = item.batchNumber || `BATCH-${Date.now()}`;
        if (item.productId) {
          await client.query(
            `INSERT INTO inventory_batches (branch_id, warehouse_id, product_id, batch_number, quantity, unit_cost, expiry_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [branchId, warehouseId, item.productId, batchNo, item.receivedQuantity, item.unitCost, item.expiryDate || null]
          );
        } else if (item.rawMaterialId) {
          await client.query(
            `INSERT INTO raw_material_batches (raw_material_id, warehouse_id, batch_number, quantity, unit_cost, expiry_date)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [item.rawMaterialId, warehouseId, batchNo, item.receivedQuantity, item.unitCost, item.expiryDate || null]
          );
        }

        await this.inventoryRepository.recordStockInTx(client, {
          branchId,
          warehouseId,
          productId: item.productId,
          rawMaterialId: item.rawMaterialId,
          quantity: item.receivedQuantity,
          unitCost: item.unitCost,
          transactionType: 'GRN',
          referenceId: grnNumber,
          userId,
        });
      }

      if (dto.purchaseOrderId) {
        const checkPOItems = await client.query(
          `SELECT SUM(quantity) as total_ordered, SUM(COALESCE(received_quantity, 0)) as total_received
           FROM po_items
           WHERE purchase_order_id = $1`,
          [dto.purchaseOrderId]
        );

        const totalOrdered = parseFloat(checkPOItems.rows[0].total_ordered || '0');
        const totalReceived = parseFloat(checkPOItems.rows[0].total_received || '0');

        const newPoStatus = totalReceived >= totalOrdered ? 'FULLY_RECEIVED' : 'PARTIALLY_RECEIVED';
        await client.query('UPDATE purchase_orders SET status = $1 WHERE id = $2', [newPoStatus, dto.purchaseOrderId]);
      }

      await client.query('COMMIT');

      const supRes = await pool.query('SELECT name FROM suppliers WHERE id = $1', [dto.supplierId]);

      return {
        id: grnId,
        grnNumber,
        purchaseOrderId: dto.purchaseOrderId || null,
        supplierId: dto.supplierId,
        supplierName: supRes.rows[0]?.name || 'Vendor Supplier',
        branchId,
        invoiceNumber: dto.invoiceNumber,
        totalAmount,
        paidAmount: 0.00,
        dueBalance: totalAmount,
        paymentStatus: 'UNPAID',
        status: 'RECEIVED',
        createdAt: grnRes.rows[0].created_at,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async recordPayment(grnId: number, dto: RecordGRNPaymentDto, userId: number = 1): Promise<GRNResponseDto> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const grnRes = await client.query(
        `SELECT id, total_amount, COALESCE(paid_amount, 0) as paid_amount, status FROM grns WHERE id = $1 FOR UPDATE`,
        [grnId]
      );

      if (grnRes.rows.length === 0) {
        throw new NotFoundError(`GRN #${grnId} not found`);
      }

      const totalAmount = parseFloat(grnRes.rows[0].total_amount || 0);
      const currentPaid = parseFloat(grnRes.rows[0].paid_amount || 0);
      const newPaidAmount = currentPaid + dto.amount;

      let newPaymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID' = 'PARTIAL';
      if (newPaidAmount >= totalAmount) {
        newPaymentStatus = 'PAID';
      } else if (newPaidAmount <= 0) {
        newPaymentStatus = 'UNPAID';
      }

      // Insert into grn_payments
      await client.query(
        `INSERT INTO grn_payments (grn_id, amount, payment_method, reference_no, paid_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [grnId, dto.amount, dto.paymentMethod || 'CASH', dto.referenceNo || null, userId]
      );

      // Update GRN master record
      const updatedStatus = newPaymentStatus === 'PAID' ? 'PAID' : grnRes.rows[0].status;
      await client.query(
        `UPDATE grns
         SET paid_amount = $1, payment_status = $2, status = $3
         WHERE id = $4`,
        [newPaidAmount, newPaymentStatus, updatedStatus, grnId]
      );

      await client.query('COMMIT');

      const updatedGRN = await this.findById(grnId);
      if (!updatedGRN) {
        throw new Error(`Failed to retrieve updated GRN #${grnId}`);
      }
      return updatedGRN;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
