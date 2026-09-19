export interface PosCartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

export type PosOrderType = 'Take Away' | 'Dine-In' | 'Delivery';
