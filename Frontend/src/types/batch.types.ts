export interface BatchItem {
  batch: string;
  branch: string;
  item: string;
  code: string;
  grn: string;
  qty: string;
  percent: number;
  expiry: string;
  status: 'Active' | 'Inactive';
}
