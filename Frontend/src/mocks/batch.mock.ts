import { BatchItem } from '../types/batch.types';

export const initialBatchProducts: BatchItem[] = [
  { batch: 'BATCH-2026-000144', branch: 'Malabe', item: 'Egg & Seeni Sambal Puff', code: 'PP001', grn: 'GRN-2026-000005', qty: '7 / 10', percent: 70, expiry: 'Apr 13, 2026', status: 'Active' },
  { batch: 'BATCH-2026-000150', branch: 'Malabe', item: 'Chocolate Filling Croissant', code: 'CR001', grn: 'GRN-2026-000009', qty: '5 / 6', percent: 83, expiry: 'Apr 17, 2026', status: 'Active' },
  { batch: 'BATCH-2026-000151', branch: 'Malabe', item: 'White Red Cherry Cake', code: 'CI003', grn: 'GRN-2026-000010', qty: '1 / 1', percent: 100, expiry: 'Apr 18, 2026', status: 'Active' },
  { batch: 'BATCH-2026-000224', branch: 'Malabe', item: 'Coffee & Choclate Fudge Cake', code: 'CI010', grn: 'GRN-2026-000014', qty: '0 / 2', percent: 0, expiry: 'Apr 21, 2026', status: 'Active' },
  { batch: 'BATCH-2026-000255', branch: 'Malabe', item: 'Srumbled Egg & Cheese Croissant', code: 'ALAC004', grn: 'GRN-2026-000017', qty: '1 / 25', percent: 4, expiry: 'Apr 21, 2026', status: 'Active' }
];

export const initialBatchRawMaterials: BatchItem[] = [
  { batch: 'BATCH-2026-000007', branch: 'Malabe', item: 'Brioche Burger Bun 80g', code: 'MONDE/RM/001', grn: 'GRN-2026-000090', qty: '10 / 10', percent: 100, expiry: 'May 15, 2026', status: 'Active' },
  { batch: 'BATCH-2026-000008', branch: 'Malabe', item: 'Brioche Hot Dog Bun 60g', code: 'MONDE/RM/002', grn: 'GRN-2026-000090', qty: '5 / 5', percent: 100, expiry: 'May 15, 2026', status: 'Active' },
  { batch: 'BATCH-2026-000009', branch: 'Malabe', item: 'Milk sandwitch loaf 1200g', code: 'MONDE/RM/003', grn: 'GRN-2026-000090', qty: '4 / 4', percent: 100, expiry: 'May 15, 2026', status: 'Active' },
  { batch: 'BATCH-2026-000092', branch: 'Malabe -WH', item: 'potato', code: 'VPT001', grn: 'GRN-2026-000170', qty: '1 / 1', percent: 100, expiry: 'May 29, 2026', status: 'Active' },
  { batch: 'BATCH-2026-000093', branch: 'Malabe -WH', item: 'B ONIONS', code: 'T_RM_K_VEG_012', grn: 'GRN-2026-000170', qty: '0 / 1', percent: 0, expiry: 'May 29, 2026', status: 'Active' }
];
