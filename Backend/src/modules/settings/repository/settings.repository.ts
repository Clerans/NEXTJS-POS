import { pool } from '../../../config/db.js';
import { UpdateSettingsDto, SystemSettingsResponseDto, AuditLogResponseDto } from '../dto/settings.dto.js';

export class SettingRepository {
  async getSettings(branchId: number = 1): Promise<SystemSettingsResponseDto> {
    const result = await pool.query(
      `SELECT branch_id, store_name, receipt_header, receipt_footer, tax_percentage,
              currency_symbol, is_negative_stock_allowed, updated_at
       FROM system_settings WHERE branch_id = $1`,
      [branchId]
    );

    if (result.rows.length === 0) {
      return {
        branchId,
        storeName: 'NEXUSPOS Cafe & Restaurant',
        receiptHeader: 'Welcome to NEXUSPOS! Thank you for dining with us.',
        receiptFooter: 'Please come again! Built with NEXUSPOS Technology.',
        taxPercentage: 10.00,
        currencySymbol: 'Rs.',
        isNegativeStockAllowed: false,
        updatedAt: new Date(),
      };
    }

    const row = result.rows[0];
    return {
      branchId: parseInt(row.branch_id, 10),
      storeName: row.store_name,
      receiptHeader: row.receipt_header,
      receiptFooter: row.receipt_footer,
      taxPercentage: parseFloat(row.tax_percentage || 10),
      currencySymbol: row.currency_symbol || 'Rs.',
      isNegativeStockAllowed: row.is_negative_stock_allowed || false,
      updatedAt: row.updated_at,
    };
  }

  async updateSettings(dto: UpdateSettingsDto, branchId: number = 1): Promise<SystemSettingsResponseDto> {
    const current = await this.getSettings(branchId);
    const updated = { ...current, ...dto };

    await pool.query(
      `INSERT INTO system_settings (branch_id, store_name, receipt_header, receipt_footer, tax_percentage, currency_symbol, is_negative_stock_allowed, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
       ON CONFLICT (branch_id) DO UPDATE SET
         store_name = EXCLUDED.store_name,
         receipt_header = EXCLUDED.receipt_header,
         receipt_footer = EXCLUDED.receipt_footer,
         tax_percentage = EXCLUDED.tax_percentage,
         currency_symbol = EXCLUDED.currency_symbol,
         is_negative_stock_allowed = EXCLUDED.is_negative_stock_allowed,
         updated_at = CURRENT_TIMESTAMP`,
      [
        branchId,
        updated.storeName,
        updated.receiptHeader,
        updated.receiptFooter,
        updated.taxPercentage,
        updated.currencySymbol,
        updated.isNegativeStockAllowed,
      ]
    );

    return updated;
  }

  async getAuditLogs(): Promise<AuditLogResponseDto[]> {
    const result = await pool.query(
      `SELECT id, user_id, username, action, entity_name, entity_id, old_values, new_values, ip_address, created_at
       FROM audit_logs ORDER BY id DESC LIMIT 100`
    );

    return result.rows.map((row: any) => ({
      id: parseInt(row.id, 10),
      userId: parseInt(row.user_id || '1', 10),
      username: row.username || 'admin',
      action: row.action,
      entityName: row.entity_name,
      entityId: row.entity_id,
      oldValues: row.old_values,
      newValues: row.new_values,
      ipAddress: row.ip_address || '127.0.0.1',
      createdAt: row.created_at,
    }));
  }
}
