import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DiningTableService } from '../service/tables.service.js';

describe('DiningTableService Unit Tests', () => {
  const service = new DiningTableService();

  it('should instantiate DiningTableService cleanly', () => {
    assert.ok(service);
  });
});
