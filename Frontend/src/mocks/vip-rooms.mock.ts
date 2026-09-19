import { VipRoom } from '../types/vip-room.types';

export const initialVipRooms: VipRoom[] = [
  { id: 1, branchId: 1, branchName: 'Malabe', name: 'VIP Room 2', category: 'Medium', hourlyRate: 10000, discountPercentage: 0, isActive: true },
  { id: 2, branchId: 1, branchName: 'Malabe', name: 'VIP Room 1', category: 'Small', hourlyRate: 5000, discountPercentage: 0, isActive: true }
];
