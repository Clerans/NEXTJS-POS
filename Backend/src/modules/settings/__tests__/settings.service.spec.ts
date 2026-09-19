import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { SettingService } from '../service/settings.service.js';

describe('SettingService', () => {
  let settingService: SettingService;

  beforeEach(() => {
    settingService = new SettingService();
  });

  it('should retrieve default system settings cleanly', async () => {
    const settings = await settingService.getSettings(1);
    assert.ok(settings);
    assert.ok(typeof settings.taxPercentage === 'number');
    assert.strictEqual(settings.currencySymbol, 'Rs.');
  });

  it('should update store name and tax percentage', async () => {
    const updated = await settingService.updateSettings({
      storeName: 'NEXUSPOS Premium Outlet',
      taxPercentage: 12.5,
    }, 1);

    assert.ok(updated);
    assert.strictEqual(updated.storeName, 'NEXUSPOS Premium Outlet');
    assert.strictEqual(updated.taxPercentage, 12.5);
  });
});
