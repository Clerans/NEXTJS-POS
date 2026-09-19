import { pool } from '../../../config/db.js';
import { CreatePODto, POResponseDto } from '../dto/po.dto.js';

export class PORepository {
  async findAll(): Promise<POResponseDto[]> {
    const result = await pool.query(
      `SELECT p.id, p.po_number, p.branch_id, p.total_amount, p.status, p.created_at,
              s.id as supplier_id, s.name as supplier_name,
              COUNT(pi.id) as items_count
       FROM purchase_orders p
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       LEFT JOIN po_items pi ON p.id = pi.purchase_order_id
       GROUP BY p.id, s.id
       ORDER BY p.id DESC`
    );

    return result.rows.map((row: any) => ({
      id: parseInt(row.id, 10),
      poNumber: row.po_number,
      supplier: { id: parseInt(row.supplier_id || '1', 10), name: row.supplier_name || 'Vendor Supplier' },
      branchId: parseInt(row.branch_id || '1', 10),
      totalAmount: parseFloat(row.total_amount || 0),
      status: row.status,
      itemsCount: parseInt(row.items_count || '0', 10),
      createdAt: row.created_at,
    }));
  }

  async findById(id: number): Promise<POResponseDto | null> {
    const orderRes = await pool.query(
      `SELECT p.id, p.po_number, p.branch_id, p.total_amount, p.status, p.created_at,
              s.id as supplier_id, s.name as supplier_name
       FROM purchase_orders p
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.id = $1`,
      [id]
    );

    if (orderRes.rows.length === 0) return null;

    const row = orderRes.rows[0];

    const itemsRes = await pool.query(
      `SELECT id, product_id, raw_material_id, quantity, COALESCE(received_quantity, 0) as received_quantity, unit_cost, total_cost
       FROM po_items
       WHERE purchase_order_id = $1`,
      [id]
    );

    return {
      id: parseInt(row.id, 10),
      poNumber: row.po_number,
      supplier: { id: parseInt(row.supplier_id || '1', 10), name: row.supplier_name || 'Vendor Supplier' },
      branchId: parseInt(row.branch_id || '1', 10),
      totalAmount: parseFloat(row.total_amount || 0),
      status: row.status,
      itemsCount: itemsRes.rows.length,
      createdAt: row.created_at,
      items: itemsRes.rows.map((item: any) => ({
        id: parseInt(item.id, 10),
        productId: item.product_id ? parseInt(item.product_id, 10) : undefined,
        rawMaterialId: item.raw_material_id ? parseInt(item.raw_material_id, 10) : undefined,
        quantity: parseFloat(item.quantity),
        receivedQuantity: parseFloat(item.received_quantity),
        unitCost: parseFloat(item.unit_cost),
        totalCost: parseFloat(item.total_cost),
      })),
    };
  }

  async create(dto: CreatePODto, poNumber: string, totalAmount: number, initialStatus: 'APPROVED' | 'PENDING_APPROVAL' | 'DRAFT'): Promise<POResponseDto> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const poRes = await client.query(
        `INSERT INTO purchase_orders (po_number, supplier_id, branch_id, total_amount, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, created_at`,
        [poNumber, dto.supplierId, dto.branchId || 1, totalAmount, initialStatus]
      );

      const poId = parseInt(poRes.rows[0].id, 10);

      for (const item of dto.items) {
        const itemTotal = item.quantity * item.unitCost;
        await client.query(
          `INSERT INTO po_items (purchase_order_id, product_id, raw_material_id, quantity, received_quantity, unit_cost, total_cost)
           VALUES ($1, $2, $3, $4, 0, $5, $6)`,
          [poId, item.productId || null, item.rawMaterialId || null, item.quantity, item.unitCost, itemTotal]
        );
      }

      await client.query('COMMIT');

      const supRes = await pool.query('SELECT name FROM suppliers WHERE id = $1', [dto.supplierId]);

      return {
        id: poId,
        poNumber,
        supplier: { id: dto.supplierId, name: supRes.rows[0]?.name || 'Vendor Supplier' },
        branchId: dto.branchId || 1,
        totalAmount,
        status: initialStatus,
        itemsCount: dto.items.length,
        createdAt: poRes.rows[0].created_at,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateStatus(id: number, status: 'APPROVED' | 'REJECTED' | 'PARTIALLY_RECEIVED' | 'FULLY_RECEIVED' | 'CLOSED' | 'CANCELLED'): Promise<boolean> {
    await pool.query('UPDATE purchase_orders SET status = $1 WHERE id = $2', [status, id]);
    return true;
  }
}
