import { Unit } from '../types/unit.types';

export const initialUnits: Unit[] = [
  { id: 1, icon: '📦', name: 'Pieces', abbr: 'pcs', type: 'Quantity', status: 'Active' },
  { id: 2, icon: '⚖️', name: 'Grams', abbr: 'g', type: 'Weight', status: 'Active' },
  { id: 3, icon: '⚖️', name: 'Kilograms', abbr: 'kg', type: 'Weight', status: 'Active' },
  { id: 4, icon: '🥤', name: 'Liter', abbr: 'l', type: 'Volume', status: 'Active' },
  { id: 5, icon: '🥤', name: 'Milliliter', abbr: 'ml', type: 'Volume', status: 'Active' }
];
