import { pool } from '../../../config/db.js';
import { CreatePromotionDto, SendSmsCampaignDto, PromotionResponseDto, SmsCampaignResponseDto } from '../dto/promotions.dto.js';
import { NotFoundError } from '../../../common/errors/app-error.js';

export class PromotionRepository {
  async findAll(): Promise<PromotionResponseDto[]> {
    const result = await pool.query(
      `SELECT id, code, name, type, discount_value, start_date, end_date, status, created_at
       FROM promotions ORDER BY id DESC`
    );

    return result.rows.map((row: any) => ({
      id: parseInt(row.id, 10),
      code: row.code,
      name: row.name,
      type: row.type,
      discountValue: parseFloat(row.discount_value),
      startDate: row.start_date,
      endDate: row.end_date,
      status: row.status,
      createdAt: row.created_at,
    }));
  }

  async findByCode(code: string): Promise<PromotionResponseDto | null> {
    const result = await pool.query(
      `SELECT id, code, name, type, discount_value, start_date, end_date, status, created_at
       FROM promotions WHERE LOWER(code) = LOWER($1)`,
      [code]
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];

    return {
      id: parseInt(row.id, 10),
      code: row.code,
      name: row.name,
      type: row.type,
      discountValue: parseFloat(row.discount_value),
      startDate: row.start_date,
      endDate: row.end_date,
      status: row.status,
      createdAt: row.created_at,
    };
  }

  async findActiveValidByCode(code: string): Promise<PromotionResponseDto | null> {
    const result = await pool.query(
      `SELECT id, code, name, type, discount_value, start_date, end_date, status, created_at
       FROM promotions
       WHERE LOWER(code) = LOWER($1)
         AND status = 'ACTIVE'
         AND CURRENT_DATE BETWEEN start_date::date AND end_date::date`,
      [code]
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];

    return {
      id: parseInt(row.id, 10),
      code: row.code,
      name: row.name,
      type: row.type,
      discountValue: parseFloat(row.discount_value),
      startDate: row.start_date,
      endDate: row.end_date,
      status: row.status,
      createdAt: row.created_at,
    };
  }

  async create(dto: CreatePromotionDto): Promise<PromotionResponseDto> {
    const result = await pool.query(
      `INSERT INTO promotions (code, name, type, discount_value, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE')
       RETURNING id, created_at`,
      [dto.code, dto.name, dto.type, dto.discountValue, dto.startDate, dto.endDate]
    );

    return {
      id: parseInt(result.rows[0].id, 10),
      code: dto.code,
      name: dto.name,
      type: dto.type,
      discountValue: dto.discountValue,
      startDate: dto.startDate,
      endDate: dto.endDate,
      status: 'ACTIVE',
      createdAt: result.rows[0].created_at,
    };
  }

  async toggleStatus(id: number, status: string): Promise<PromotionResponseDto> {
    const result = await pool.query(
      `UPDATE promotions SET status = $1 WHERE id = $2 RETURNING id, code, name, type, discount_value, start_date, end_date, status, created_at`,
      [status, id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Promotion #${id} not found`);
    }

    const row = result.rows[0];
    return {
      id: parseInt(row.id, 10),
      code: row.code,
      name: row.name,
      type: row.type,
      discountValue: parseFloat(row.discount_value),
      startDate: row.start_date,
      endDate: row.end_date,
      status: row.status,
      createdAt: row.created_at,
    };
  }

  async delete(id: number): Promise<void> {
    const result = await pool.query(`DELETE FROM promotions WHERE id = $1`, [id]);
    if ((result.rowCount || 0) === 0) {
      throw new NotFoundError(`Promotion #${id} not found`);
    }
  }

  async createSmsCampaign(dto: SendSmsCampaignDto): Promise<SmsCampaignResponseDto> {
    const result = await pool.query(
      `INSERT INTO sms_campaigns (message_text, recipients_count, status)
       VALUES ($1, $2, 'SENT')
       RETURNING id, sent_at`,
      [dto.messageText, 450]
    );

    return {
      id: parseInt(result.rows[0].id, 10),
      recipientsCount: 450,
      messageText: dto.messageText,
      status: 'SENT',
      sentAt: result.rows[0].sent_at,
    };
  }
}
