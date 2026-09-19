import { describe, it } from 'node:test';
import assert from 'node:assert';
import { VipRoomService } from '../service/vip-rooms.service.js';

describe('VipRoomService Unit Tests', () => {
  const service = new VipRoomService();

  it('should instantiate VipRoomService cleanly', () => {
    assert.ok(service);
  });
});
