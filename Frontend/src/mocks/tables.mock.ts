import { DiningTable } from '../types/table.types';

export const initialTables: DiningTable[] = [
  { id: 1, branchId: 1, branchName: 'Malabe', tableNumber: '01', capacity: 4, availability: 'AVAILABLE', isActive: true },
  { id: 2, branchId: 1, branchName: 'Malabe', tableNumber: '02', capacity: 2, availability: 'OCCUPIED', isActive: true },
  { id: 3, branchId: 1, branchName: 'Malabe', tableNumber: '03', capacity: 4, availability: 'OCCUPIED', isActive: true },
  { id: 4, branchId: 1, branchName: 'Malabe', tableNumber: '04', capacity: 3, availability: 'AVAILABLE', isActive: true },
  { id: 5, branchId: 1, branchName: 'Malabe', tableNumber: '05', capacity: 2, availability: 'AVAILABLE', isActive: true },
  { id: 6, branchId: 1, branchName: 'Malabe', tableNumber: '06', capacity: 4, availability: 'AVAILABLE', isActive: true },
  { id: 7, branchId: 1, branchName: 'Malabe', tableNumber: '07', capacity: 4, availability: 'AVAILABLE', isActive: true },
];
