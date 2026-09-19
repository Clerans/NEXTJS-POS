import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { PromotionService } from '../service/promotions.service.js';

describe('PromotionService', () => {
  let promotionService: PromotionService;

  beforeEach(() => {
    promotionService = new PromotionService();
  });

  it('should create new promo campaign cleanly', async () => {
    const code = `WKND${Date.now().toString().slice(-4)}`;
    const promo = await promotionService.createPromotion({
      code,
      name: 'Weekend LKR 500 Discount',
      type: 'FLAT',
      discountValue: 500,
      startDate: '2026-08-01',
      endDate: '2026-08-31',
    });

    assert.ok(promo);
    assert.strictEqual(promo.code, code);
    assert.strictEqual(promo.discountValue, 500);
  });

  it('should throw ConflictError when registering existing promo code', async () => {
    try {
      await promotionService.createPromotion({
        code: 'HAPPYHOUR15',
        name: 'Duplicate Promo',
        type: 'PERCENTAGE',
        discountValue: 15,
        startDate: '2026-08-01',
        endDate: '2026-08-31',
      });
      assert.fail('Should have thrown ConflictError');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 409);
    }
  });

  it('should dispatch bulk SMS campaign cleanly', async () => {
    const res = await promotionService.sendSmsCampaign({
      messageText: 'Enjoy 15% off all espresso drinks today at NEXUSPOS!',
    });

    assert.ok(res);
    assert.ok(res.recipientsCount > 0);
    assert.strictEqual(res.status, 'SENT');
  });
});
