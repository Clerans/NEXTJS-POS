import { SyncEngine } from '../syncEngine';

export function runSyncEngineTests(): void {
  const engine = new SyncEngine();
  const status = engine.getStatus();
  if (typeof status.isOnline !== 'boolean') {
    throw new Error('isOnline should be a boolean');
  }
  if (typeof status.pendingCount !== 'number') {
    throw new Error('pendingCount should be a number');
  }

  let called = false;
  const unsubscribe = engine.subscribe((s) => {
    called = true;
    if (typeof s.isOnline !== 'boolean') {
      throw new Error('Expected boolean status');
    }
  });

  if (!called) {
    throw new Error('Listener should have been called on subscription');
  }
  unsubscribe();
}
