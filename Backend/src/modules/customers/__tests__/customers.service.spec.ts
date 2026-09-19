import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { CustomerService } from '../service/customers.service.js';

describe('CustomerService', () => {
  let customerService: CustomerService;

  beforeEach(() => {
    customerService = new CustomerService();
  });

  it('should retrieve list of registered CRM customers cleanly', async () => {
    const list = await customerService.getAllCustomers();
    assert.ok(Array.isArray(list));
    assert.ok(list.length >= 2);
  });

  it('should create new customer cleanly', async () => {
    const mobile = `+94 77 999 ${Date.now().toString().slice(-4)}`;
    const customer = await customerService.createCustomer({
      name: 'Kasun Kalhara',
      mobile,
    });

    assert.ok(customer);
    assert.strictEqual(customer.name, 'Kasun Kalhara');
    assert.strictEqual(customer.mobile, mobile);
  });

  it('should throw ConflictError when mobile number is already registered', async () => {
    try {
      await customerService.createCustomer({
        name: 'Duplicate Mobile User',
        mobile: '+94 77 123 0000',
      });
      assert.fail('Should have thrown ConflictError');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 409);
    }
  });

  it('should retrieve list of customer groups cleanly', async () => {
    const groups = await customerService.getAllGroups();
    assert.ok(Array.isArray(groups));
  });

  it('should create new customer group cleanly', async () => {
    const name = `VIP Group ${Date.now().toString().slice(-4)}`;
    const group = await customerService.createGroup({
      name,
      discountRate: 15.0,
    });

    assert.ok(group);
    assert.strictEqual(group.name, name);
    assert.strictEqual(group.discountRate, 15.0);
  });

  it('should throw ConflictError when creating duplicate customer group name', async () => {
    try {
      await customerService.createGroup({
        name: 'Regular Dining',
        discountRate: 0.0,
      });
      assert.fail('Should have thrown ConflictError');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 409);
    }
  });
});
