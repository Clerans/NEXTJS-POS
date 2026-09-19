import { pool } from '../../../config/db.js';
import { CreatePOSOrderDto, POSOrderResponseDto, KDSOrderTicketDto } from '../dto/pos.dto.js';
import { UnprocessableEntityError } from '../../../common/errors/app-error.js';
import { InventoryRepository } from '../../inventory/repository/inventory.repository.js';

export class POSRepository {
  private inventoryRepository: InventoryRepository;

  constructor() {
    this.inventoryRepository = new InventoryRepository();
  }

  async findOrderByOfflineRef(offlineRef: string): Promise<POSOrderResponseDto | null> {
    const result = await pool.query(
      `SELECT id, order_no, branch_id, order_type, subtotal, discount_amount, tax_amount, service_charge,
              total_amount, payment_method, change_given, status, created_at
       FROM pos_orders
       WHERE offline_ref = $1 OR order_no = $1`,
      [offlineRef]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      orderId: parseInt(row.id, 10),
      orderNo: row.order_no,
      branchId: parseInt(row.branch_id, 10),
      orderType: row.order_type,
      subtotal: parseFloat(row.subtotal || '0'),
      discountAmount: parseFloat(row.discount_amount || '0'),
      taxAmount: parseFloat(row.tax_amount || '0'),
      serviceCharge: parseFloat(row.service_charge || '0'),
      totalAmount: parseFloat(row.total_amount || '0'),
      paymentMethod: row.payment_method,
      changeGiven: parseFloat(row.change_given || '0'),
      status: row.status,
      createdAt: row.created_at,
    };
  }

  async createOrder(
    dto: CreatePOSOrderDto,
    cashierId: number,
    orderNo: string,
    subtotal: number,
    taxAmount: number,
    serviceCharge: number,
    totalAmount: number,
    offlineRef?: string
  ): Promise<POSOrderResponseDto> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Idempotency check inside transaction
      if (offlineRef) {
        const existingRes = await client.query(
          `SELECT id, order_no, branch_id, order_type, subtotal, discount_amount, tax_amount, service_charge,
                  total_amount, payment_method, change_given, status, created_at
           FROM pos_orders WHERE offline_ref = $1 OR order_no = $1`,
          [offlineRef]
        );
        if (existingRes.rows.length > 0) {
          const row = existingRes.rows[0];
          await client.query('COMMIT');
          return {
            orderId: parseInt(row.id, 10),
            orderNo: row.order_no,
            branchId: parseInt(row.branch_id, 10),
            orderType: row.order_type,
            subtotal: parseFloat(row.subtotal || '0'),
            discountAmount: parseFloat(row.discount_amount || '0'),
            taxAmount: parseFloat(row.tax_amount || '0'),
            serviceCharge: parseFloat(row.service_charge || '0'),
            totalAmount: parseFloat(row.total_amount || '0'),
            paymentMethod: row.payment_method,
            changeGiven: parseFloat(row.change_given || '0'),
            status: row.status,
            createdAt: row.created_at,
          };
        }
      }

      const changeGiven = dto.amountPaid > totalAmount ? dto.amountPaid - totalAmount : 0;
      const branchId = dto.branchId || 1;

      // 1. Insert POS Master Order
      const orderRes = await client.query(
        `INSERT INTO pos_orders 
          (order_no, branch_id, cashier_id, customer_id, order_type, subtotal, discount_amount, tax_amount, service_charge, total_amount, payment_method, amount_paid, change_given, status, kds_status, offline_ref)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'COMPLETED', 'RECEIVED', $14)
         RETURNING id, created_at`,
        [
          orderNo,
          branchId,
          cashierId || 1,
          dto.customerId || null,
          dto.orderType || 'DINE_IN',
          subtotal,
          dto.discountAmount || 0,
          taxAmount,
          serviceCharge,
          totalAmount,
          dto.paymentMethod || 'CASH',
          dto.amountPaid,
          changeGiven,
          offlineRef || null,
        ]
      );

      const orderId = orderRes.rows[0].id;
      const createdAt = orderRes.rows[0].created_at;

      // 2. Insert Order Items & Delegate Stock Deduction to Central Inventory Engine
      for (const item of dto.items) {
        const unitPrice = item.unitPrice || 0;
        const itemSubtotal = item.quantity * unitPrice;

        const prodRes = await client.query('SELECT name FROM products WHERE id = $1', [item.productId]);
        const productName = prodRes.rows[0]?.name || `Product #${item.productId}`;

        await client.query(
          `INSERT INTO pos_order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [orderId, item.productId, productName, item.quantity, unitPrice, itemSubtotal]
        );

        // Delegate Stock Deduction & Recipe Raw Material Consumption to Inventory Engine
        await this.inventoryRepository.recordStockOutTx(client, {
          branchId,
          warehouseId: branchId,
          productId: item.productId,
          quantity: item.quantity,
          transactionType: 'POS_SALE',
          referenceId: orderNo,
          userId: cashierId || 1,
        });
      }

      // 3. Update Customer History & Loyalty Points if customer assigned
      if (dto.customerId) {
        const earnedPoints = Math.floor(totalAmount / 100);
        await client.query(
          `UPDATE customers 
           SET loyalty_points = loyalty_points + $1,
               outstanding_balance = outstanding_balance + $2
           WHERE id = $3`,
          [earnedPoints, dto.paymentMethod === 'CREDIT' ? totalAmount : 0, dto.customerId]
        );
      }

      // 4. Audit Log
      await client.query(
        `INSERT INTO audit_logs (user_id, username, action, entity_name, entity_id, new_values)
         VALUES ($1, $2, 'POS_ORDER_CREATED', 'pos_orders', $3, $4)`,
        [cashierId || 1, 'cashier', String(orderId), JSON.stringify({ orderNo, totalAmount, paymentMethod: dto.paymentMethod, offlineRef })]
      );

      await client.query('COMMIT');

      return {
        orderId,
        orderNo,
        branchId,
        orderType: dto.orderType,
        subtotal,
        discountAmount: dto.discountAmount || 0,
        taxAmount,
        serviceCharge,
        totalAmount,
        paymentMethod: dto.paymentMethod,
        changeGiven,
        status: 'COMPLETED',
        createdAt,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async voidOrder(orderId: number, reason: string, voidedBy: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const orderRes = await client.query('SELECT * FROM pos_orders WHERE id = $1 AND status != \'VOIDED\' FOR UPDATE', [orderId]);
      if (orderRes.rows.length === 0) {
        throw new UnprocessableEntityError('Order not found or already voided');
      }

      const order = orderRes.rows[0];
      const itemsRes = await client.query('SELECT * FROM pos_order_items WHERE order_id = $1 FOR UPDATE', [orderId]);

      // Revert Stock via Central Inventory Engine
      for (const item of itemsRes.rows) {
        await this.inventoryRepository.recordStockInTx(client, {
          branchId: order.branch_id,
          warehouseId: order.branch_id,
          productId: item.product_id,
          quantity: parseFloat(item.quantity),
          transactionType: 'POS_VOID_RETURN',
          referenceId: `VOID-${order.order_no}`,
          userId: voidedBy,
        });
      }

      // Revert Customer Credit Balance & Loyalty Points if customer was assigned
      if (order.customer_id) {
        const orderTotal = parseFloat(order.total_amount || '0');
        const awardedPoints = Math.floor(orderTotal / 100);
        const creditReversal = order.payment_method === 'CREDIT' ? orderTotal : 0;

        await client.query(
          `UPDATE customers 
           SET loyalty_points = GREATEST(0, loyalty_points - $1),
               outstanding_balance = GREATEST(0, outstanding_balance - $2)
           WHERE id = $3`,
          [awardedPoints, creditReversal, order.customer_id]
        );
      }

      // Update Order Status
      await client.query(
        'UPDATE pos_orders SET status = \'VOIDED\', void_reason = $1, voided_by = $2 WHERE id = $3',
        [reason, voidedBy, orderId]
      );

      // Audit Log
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity_name, entity_id, new_values)
         VALUES ($1, 'POS_ORDER_VOIDED', 'pos_orders', $2, $3)`,
        [voidedBy, String(orderId), JSON.stringify({ reason, creditReversed: order.payment_method === 'CREDIT' ? order.total_amount : 0 })]
      );

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getKDSOrders(): Promise<KDSOrderTicketDto[]> {
    const result = await pool.query(
      `SELECT p.id, p.order_no, p.order_type, COALESCE(p.kds_status, 'RECEIVED') as kds_status, p.created_at,
              ARRAY_REMOVE(ARRAY_AGG(poi.product_name), NULL) as item_names,
              ARRAY_REMOVE(ARRAY_AGG(poi.quantity), NULL) as item_quantities,
              ARRAY_REMOVE(ARRAY_AGG(poi.product_id), NULL) as item_product_ids
       FROM pos_orders p
       LEFT JOIN pos_order_items poi ON p.id = poi.order_id
       WHERE p.status != 'VOIDED' AND COALESCE(p.kds_status, 'RECEIVED') IN ('RECEIVED', 'PREPARING', 'READY')
       GROUP BY p.id, p.order_no, p.order_type, p.kds_status, p.created_at
       ORDER BY p.created_at ASC`
    );

    return result.rows.map((row: any) => {
      const names = row.item_names || [];
      const quantities = row.item_quantities || [];
      const pids = row.item_product_ids || [];

      const items = names.map((name: string, idx: number) => ({
        productId: parseInt(pids[idx], 10) || 0,
        productName: name,
        quantity: parseFloat(quantities[idx] || '1'),
      }));

      let orderTypeStr = row.order_type;
      if (row.order_type === 'DINE_IN') orderTypeStr = 'Dine-In';
      else if (row.order_type === 'TAKE_AWAY' || row.order_type === 'TAKEAWAY') orderTypeStr = 'Take Away';
      else if (row.order_type === 'DELIVERY') orderTypeStr = 'Delivery';

      return {
        orderId: parseInt(row.id, 10),
        orderNo: row.order_no,
        orderType: orderTypeStr,
        kdsStatus: row.kds_status as 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED',
        items,
        createdAt: row.created_at,
      };
    });
  }

  async findKDSOrderById(id: number | string): Promise<{ id: number; orderNo: string; kdsStatus: string } | null> {
    const parsedId = typeof id === 'number' ? id : parseInt(id, 10);
    const result = await pool.query(
      `SELECT id, order_no, COALESCE(kds_status, 'RECEIVED') as kds_status FROM pos_orders WHERE id = $1 OR order_no = $2`,
      [isNaN(parsedId) ? -1 : parsedId, String(id)]
    );

    if (result.rows.length === 0) return null;
    return {
      id: parseInt(result.rows[0].id, 10),
      orderNo: result.rows[0].order_no,
      kdsStatus: result.rows[0].kds_status,
    };
  }

  async updateKDSStatus(id: number | string, status: string): Promise<boolean> {
    const parsedId = typeof id === 'number' ? id : parseInt(id, 10);
    await pool.query(
      `UPDATE pos_orders SET kds_status = $1 WHERE id = $2 OR order_no = $3`,
      [status, isNaN(parsedId) ? -1 : parsedId, String(id)]
    );
    return true;
  }

  async getAllOrders(filters: {
    search?: string;
    branchId?: number;
    orderType?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;

    const whereClauses: string[] = ['1=1'];
    const params: any[] = [];
    let paramIdx = 1;

    if (filters.branchId) {
      whereClauses.push(`p.branch_id = $${paramIdx++}`);
      params.push(filters.branchId);
    }

    if (filters.orderType) {
      whereClauses.push(`p.order_type = $${paramIdx++}`);
      params.push(filters.orderType);
    }

    if (filters.status) {
      whereClauses.push(`p.status = $${paramIdx++}`);
      params.push(filters.status);
    }

    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = `%${filters.search.trim()}%`;
      whereClauses.push(`(p.order_no ILIKE $${paramIdx} OR c.name ILIKE $${paramIdx} OR c.mobile ILIKE $${paramIdx})`);
      params.push(searchTerm);
      paramIdx++;
    }

    const whereSql = whereClauses.join(' AND ');

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM pos_orders p
      LEFT JOIN customers c ON p.customer_id = c.id
      WHERE ${whereSql}
    `;
    const countRes = await pool.query(countQuery, params);
    const totalCount = parseInt(countRes.rows[0].total || '0', 10);

    const query = `
      SELECT 
        p.id,
        p.order_no,
        p.created_at,
        COALESCE(c.name, 'Walk-in Customer') AS customer_name,
        p.order_type,
        p.total_amount,
        p.status,
        p.payment_method,
        ARRAY_REMOVE(ARRAY_AGG(poi.product_name), NULL) AS items
      FROM pos_orders p
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN pos_order_items poi ON p.id = poi.order_id
      WHERE ${whereSql}
      GROUP BY p.id, p.order_no, p.created_at, c.name, p.order_type, p.total_amount, p.status, p.payment_method
      ORDER BY p.created_at DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `;

    params.push(limit, offset);

    const res = await pool.query(query, params);

    const data = res.rows.map((row) => {
      let formattedType = row.order_type;
      if (row.order_type === 'DINE_IN') formattedType = 'Dine-In';
      else if (row.order_type === 'TAKE_AWAY' || row.order_type === 'TAKEAWAY') formattedType = 'Take Away';
      else if (row.order_type === 'DELIVERY') formattedType = 'Delivery';

      let formattedStatus = row.status;
      if (row.status === 'COMPLETED') formattedStatus = 'Completed';
      else if (row.status === 'VOIDED') formattedStatus = 'Cancelled';

      const d = new Date(row.created_at);
      const formattedDate = d.toISOString().split('T')[0];

      return {
        id: row.order_no,
        dbId: row.id,
        date: formattedDate,
        customer: row.customer_name,
        type: formattedType,
        total: parseFloat(row.total_amount || '0'),
        status: formattedStatus,
        items: row.items || [],
        paymentMethod: row.payment_method,
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getOrderById(orderId: number) {
    const orderRes = await pool.query(
      `SELECT p.*, COALESCE(c.name, 'Walk-in Customer') AS customer_name, c.mobile AS customer_mobile, u.name AS cashier_name,
              s.store_name, s.receipt_header, s.receipt_footer, s.tax_percentage, s.currency_symbol
       FROM pos_orders p
       LEFT JOIN customers c ON p.customer_id = c.id
       LEFT JOIN users u ON p.cashier_id = u.id
       LEFT JOIN system_settings s ON p.branch_id = s.branch_id
       WHERE p.id = $1 OR p.order_no = $2`,
      [isNaN(orderId) ? -1 : orderId, String(orderId)]
    );

    if (orderRes.rows.length === 0) {
      return null;
    }

    const order = orderRes.rows[0];

    const itemsRes = await pool.query(
      `SELECT id, product_id, product_name, quantity, unit_price, subtotal
       FROM pos_order_items
       WHERE order_id = $1`,
      [order.id]
    );

    return {
      id: order.id,
      orderNo: order.order_no,
      branchId: order.branch_id,
      storeName: order.store_name || 'NEXUSPOS Cafe & Restaurant',
      receiptHeader: order.receipt_header || 'Welcome to NEXUSPOS!',
      receiptFooter: order.receipt_footer || 'Thank you for dining with us!',
      currencySymbol: order.currency_symbol || 'Rs.',
      cashierName: order.cashier_name || 'System Cashier',
      customerName: order.customer_name,
      customerMobile: order.customer_mobile || 'N/A',
      orderType: order.order_type,
      subtotal: parseFloat(order.subtotal || '0'),
      discountAmount: parseFloat(order.discount_amount || '0'),
      taxAmount: parseFloat(order.tax_amount || '0'),
      serviceCharge: parseFloat(order.service_charge || '0'),
      totalAmount: parseFloat(order.total_amount || '0'),
      paymentMethod: order.payment_method,
      amountPaid: parseFloat(order.amount_paid || '0'),
      changeGiven: parseFloat(order.change_given || '0'),
      status: order.status,
      createdAt: order.created_at,
      items: itemsRes.rows.map((item) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        quantity: parseFloat(item.quantity || '0'),
        unitPrice: parseFloat(item.unit_price || '0'),
        subtotal: parseFloat(item.subtotal || '0'),
      })),
    };
  }
}
