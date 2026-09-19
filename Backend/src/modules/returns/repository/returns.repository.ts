import { pool } from '../../../config/db.js';
import { CreateCustomerReturnDto, CreateSupplierReturnDto, ReturnResponseDto } from '../dto/returns.dto.js';
import { InventoryRepository } from '../../inventory/repository/inventory.repository.js';
import { UnprocessableEntityError, NotFoundError } from '../../../common/errors/app-error.js';

export class ReturnRepository {
  private inventoryRepository: InventoryRepository;

  constructor() {
    this.inventoryRepository = new InventoryRepository();
  }

  async findAll(): Promise<ReturnResponseDto[]> {
    const custReturns = await pool.query(
      `SELECT id, return_no, order_id, total_refund_amount, status, created_at
       FROM customer_returns ORDER BY id DESC`
    );

    const suppReturns = await pool.query(
      `SELECT id, return_no, supplier_id, total_refund_amount, status, created_at
       FROM supplier_returns ORDER BY id DESC`
    );

    const list: ReturnResponseDto[] = [];

    custReturns.rows.forEach((r: any) => {
      list.push({
        id: parseInt(r.id, 10),
        returnNo: r.return_no,
        type: 'CUSTOMER_RETURN',
        referenceNo: `#ORD-${r.order_id}`,
        totalRefundAmount: parseFloat(r.total_refund_amount),
        status: r.status,
        createdAt: r.created_at,
      });
    });

    suppReturns.rows.forEach((r: any) => {
      list.push({
        id: parseInt(r.id, 10),
        returnNo: r.return_no,
        type: 'SUPPLIER_RETURN',
        referenceNo: `SUP-#${r.supplier_id}`,
        totalRefundAmount: parseFloat(r.total_refund_amount),
        status: r.status,
        createdAt: r.created_at,
      });
    });

    return list;
  }

  async createCustomerReturn(dto: CreateCustomerReturnDto, returnNo: string, _frontendRefund: number, userId: number = 1): Promise<ReturnResponseDto> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Authoritatively validate and lock the parent Order record (pos_orders table)
      let orderRes = await client.query(
        `SELECT id, branch_id, customer_id FROM pos_orders WHERE id = $1 FOR UPDATE`,
        [dto.orderId]
      );
      if (orderRes.rows.length === 0) {
        orderRes = await client.query(
          `SELECT id, branch_id, customer_id FROM orders WHERE id = $1 FOR UPDATE`,
          [dto.orderId]
        );
      }
      if (orderRes.rows.length === 0) {
        throw new NotFoundError(`Sales Order #${dto.orderId} not found`);
      }
      const branchId = parseInt(orderRes.rows[0].branch_id || '1', 10);
      const customerId = orderRes.rows[0].customer_id ? parseInt(orderRes.rows[0].customer_id, 10) : null;

      // 2. Process each item: calculate authoritative returnable_quantity = original_sold_quantity - previously_returned_quantity
      let calculatedTotalRefund = 0;
      const validatedItems: Array<{ productId: number; quantity: number; unitPrice: number; refundAmount: number }> = [];

      for (const item of dto.items) {
        let orderItemRes = await client.query(
          `SELECT id, product_id, quantity, unit_price
           FROM pos_order_items
           WHERE order_id = $1 AND product_id = $2
           FOR UPDATE`,
          [dto.orderId, item.productId]
        );

        if (orderItemRes.rows.length === 0) {
          orderItemRes = await client.query(
            `SELECT id, product_id, quantity, unit_price
             FROM order_items
             WHERE order_id = $1 AND product_id = $2
             FOR UPDATE`,
            [dto.orderId, item.productId]
          );
        }

        if (orderItemRes.rows.length === 0) {
          throw new UnprocessableEntityError(`Product #${item.productId} was not found on Order #${dto.orderId}`);
        }

        const soldQty = parseFloat(orderItemRes.rows[0].quantity);
        const authoritativeUnitPrice = parseFloat(orderItemRes.rows[0].unit_price);

        const prevReturnRes = await client.query(
          `SELECT COALESCE(SUM(cri.quantity), 0) as total_returned
           FROM customer_return_items cri
           JOIN customer_returns cr ON cri.customer_return_id = cr.id
           WHERE cr.order_id = $1 AND cri.product_id = $2`,
          [dto.orderId, item.productId]
        );

        const previouslyReturned = parseFloat(prevReturnRes.rows[0].total_returned || '0');
        const returnableQty = Math.max(0, soldQty - previouslyReturned);

        if (item.quantity > returnableQty) {
          throw new UnprocessableEntityError(
            `Customer return rejected for Product #${item.productId}. Maximum returnable quantity is ${returnableQty} (Sold: ${soldQty}, Prev Returned: ${previouslyReturned}), attempted to return ${item.quantity}`
          );
        }

        const lineRefund = item.quantity * authoritativeUnitPrice;
        calculatedTotalRefund += lineRefund;
        validatedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: authoritativeUnitPrice,
          refundAmount: lineRefund,
        });
      }

      // 3. Create Customer Return Master Record
      const retRes = await client.query(
        `INSERT INTO customer_returns (return_no, order_id, customer_id, total_refund_amount, status)
         VALUES ($1, $2, $3, $4, 'PROCESSED')
         RETURNING id, created_at`,
        [returnNo, dto.orderId, customerId, calculatedTotalRefund]
      );

      const returnId = parseInt(retRes.rows[0].id, 10);

      // 4. Create Return Items and update inventory
      for (const item of validatedItems) {
        await client.query(
          `INSERT INTO customer_return_items (customer_return_id, product_id, quantity, refund_amount)
           VALUES ($1, $2, $3, $4)`,
          [returnId, item.productId, item.quantity, item.refundAmount]
        );

        await this.inventoryRepository.recordStockInTx(client, {
          branchId,
          productId: item.productId,
          quantity: item.quantity,
          transactionType: 'CUSTOMER_RETURN',
          referenceId: returnNo,
          userId,
        });
      }

      await client.query('COMMIT');

      return {
        id: returnId,
        returnNo,
        type: 'CUSTOMER_RETURN',
        referenceNo: `#ORD-${dto.orderId}`,
        totalRefundAmount: calculatedTotalRefund,
        status: 'PROCESSED',
        createdAt: retRes.rows[0].created_at,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async createSupplierReturn(dto: CreateSupplierReturnDto, returnNo: string, _frontendRefund: number, userId: number = 1): Promise<ReturnResponseDto> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Authoritatively validate and lock Supplier record
      const supRes = await client.query(`SELECT id FROM suppliers WHERE id = $1 FOR UPDATE`, [dto.supplierId]);
      if (supRes.rows.length === 0) {
        throw new NotFoundError(`Supplier #${dto.supplierId} not found`);
      }

      const branchId = dto.branchId || 1;
      const warehouseId = (dto as any).warehouseId || branchId;

      let calculatedTotalRefund = 0;
      const validatedItems: Array<{ productId?: number; rawMaterialId?: number; quantity: number; unitCost: number; refundAmount: number }> = [];

      // 2. Process each returned line item with strict returnable quantity check
      for (const item of dto.items) {
        let authoritativeCost = item.unitCost || 0;

        if (item.rawMaterialId) {
          const rmRes = await client.query(
            `SELECT cost_per_unit FROM raw_materials WHERE id = $1 FOR UPDATE`,
            [item.rawMaterialId]
          );
          if (authoritativeCost === 0 && rmRes.rows.length > 0 && parseFloat(rmRes.rows[0].cost_per_unit || '0') > 0) {
            authoritativeCost = parseFloat(rmRes.rows[0].cost_per_unit);
          }

          const prevReturnRes = await client.query(
            `SELECT COALESCE(SUM(sri.quantity), 0) as total_returned
             FROM supplier_return_items sri
             JOIN supplier_returns sr ON sri.supplier_return_id = sr.id
             WHERE sr.supplier_id = $1 AND sri.raw_material_id = $2`,
            [dto.supplierId, item.rawMaterialId]
          );

          const totalPrevReturned = parseFloat(prevReturnRes.rows[0].total_returned || '0');

          const grnRecRes = await client.query(
            `SELECT COALESCE(SUM(gi.quantity_received), 0) as total_received
             FROM grn_items gi
             JOIN grns g ON gi.grn_id = g.id
             WHERE g.supplier_id = $1 AND gi.raw_material_id = $2`,
            [dto.supplierId, item.rawMaterialId]
          );

          const receivedQty = parseFloat(grnRecRes.rows[0].total_received || '0');
          if (receivedQty > 0) {
            const returnableQty = Math.max(0, receivedQty - totalPrevReturned);
            if (item.quantity > returnableQty) {
              throw new UnprocessableEntityError(
                `Supplier return rejected for Raw Material #${item.rawMaterialId}. Maximum returnable quantity is ${returnableQty} (Total Received: ${receivedQty}, Prev Returned: ${totalPrevReturned}), attempted to return ${item.quantity}`
              );
            }
          }
        }

        const lineRefund = item.quantity * authoritativeCost;
        calculatedTotalRefund += lineRefund;
        validatedItems.push({
          productId: item.productId,
          rawMaterialId: item.rawMaterialId,
          quantity: item.quantity,
          unitCost: authoritativeCost,
          refundAmount: lineRefund,
        });
      }

      // 3. Create Supplier Return Master Record
      const retRes = await client.query(
        `INSERT INTO supplier_returns (return_no, supplier_id, total_refund_amount, status)
         VALUES ($1, $2, $3, 'APPROVED')
         RETURNING id, created_at`,
        [returnNo, dto.supplierId, calculatedTotalRefund]
      );

      const returnId = parseInt(retRes.rows[0].id, 10);

      // 4. Record items and execute inventory stock out
      for (const item of validatedItems) {
        await client.query(
          `INSERT INTO supplier_return_items (supplier_return_id, product_id, raw_material_id, quantity, refund_amount)
           VALUES ($1, $2, $3, $4, $5)`,
          [returnId, item.productId || null, item.rawMaterialId || null, item.quantity, item.refundAmount]
        );

        await this.inventoryRepository.recordStockOutTx(client, {
          branchId,
          warehouseId,
          productId: item.productId,
          rawMaterialId: item.rawMaterialId,
          quantity: item.quantity,
          transactionType: 'SUPPLIER_RETURN',
          referenceId: returnNo,
          userId,
        });
      }

      await client.query('COMMIT');

      return {
        id: returnId,
        returnNo,
        type: 'SUPPLIER_RETURN',
        referenceNo: `SUP-#${dto.supplierId}`,
        totalRefundAmount: calculatedTotalRefund,
        status: 'APPROVED',
        createdAt: retRes.rows[0].created_at,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
