import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { UserService } from '../service/users.service.js';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  it('should instantiate UserService cleanly', () => {
    assert.ok(userService);
  });
});
