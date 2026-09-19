import { syncDb, PendingOrderRecord } from './syncDb';
import { api } from '../api/axiosInstance';
import { toast } from 'sonner';

export interface SyncEngineStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
}

type StatusListener = (status: SyncEngineStatus) => void;

const MAX_RETRIES = 3;

export class SyncEngine {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSyncing: boolean = false;
  private pendingCount: number = 0;
  private listeners: Set<StatusListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
    this.refreshCount();
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notify();
    toast.success('Connection restored. Auto-syncing pending orders...');
    this.processQueue();
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notify();
    toast.warning('Working offline. Orders will be saved locally.');
  };

  public subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => this.listeners.delete(listener);
  }

  public getStatus(): SyncEngineStatus {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: this.pendingCount,
    };
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach((fn) => fn(status));
  }

  public async refreshCount(): Promise<number> {
    try {
      this.pendingCount = await syncDb.getPendingCount();
    } catch {
      this.pendingCount = 0;
    }
    this.notify();
    return this.pendingCount;
  }

  public async enqueueOrder(orderPayload: any): Promise<PendingOrderRecord> {
    const record = await syncDb.savePendingOrder(orderPayload);
    await this.refreshCount();

    toast.warning('Saved offline. Will sync automatically when connection restores.');

    if (this.isOnline) {
      this.processQueue();
    }

    return record;
  }

  public async processQueue(): Promise<void> {
    if (this.isSyncing || !this.isOnline) return;

    this.isSyncing = true;
    this.notify();

    try {
      const orders = await syncDb.getPendingOrders();
      if (orders.length === 0) {
        this.isSyncing = false;
        await this.refreshCount();
        return;
      }

      for (const orderRecord of orders) {
        if (!this.isOnline) break;

        // Skip orders that failed max retries unless manually forced
        if (orderRecord.attempts >= MAX_RETRIES && orderRecord.status === 'FAILED') {
          continue;
        }

        let success = false;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            await api.post('/pos/orders', orderRecord.payload, {
              headers: {
                'X-Offline-Ref': orderRecord.offline_ref,
                'Idempotency-Key': orderRecord.offline_ref,
              },
            });

            await syncDb.removePendingOrder(orderRecord.offline_ref);
            toast.success(`Synced offline order (${orderRecord.offline_ref})`);
            success = true;
            break;
          } catch (err: any) {
            const isNetworkErr = !err.response || err.message?.includes('Network Error');
            const errorMsg = err.response?.data?.message || err.message || 'Sync error';

            if (isNetworkErr) {
              const nextAttempts = orderRecord.attempts + 1;
              await syncDb.updateRecord({
                ...orderRecord,
                attempts: nextAttempts,
                lastError: errorMsg,
                status: nextAttempts >= MAX_RETRIES ? 'FAILED' : 'PENDING',
              });

              if (attempt >= MAX_RETRIES) {
                this.isOnline = false;
                break;
              }
            } else {
              // Permanent HTTP rejection (e.g. 400 Bad Request)
              console.error('[SyncEngine] Permanent error on order:', orderRecord.offline_ref, errorMsg);
              await syncDb.updateRecord({
                ...orderRecord,
                attempts: MAX_RETRIES,
                lastError: errorMsg,
                status: 'FAILED',
              });
              break;
            }
          }
        }

        if (!success && !this.isOnline) {
          break;
        }
      }
    } catch (err) {
      console.error('[SyncEngine] Error processing sync queue:', err);
    } finally {
      this.isSyncing = false;
      await this.refreshCount();
    }
  }
}

export const syncEngine = new SyncEngine();
