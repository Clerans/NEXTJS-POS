export type UnitType = 'Quantity' | 'Weight' | 'Volume';
export type UnitStatus = 'Active' | 'Inactive';

export interface Unit {
  id: number;
  icon: string;
  name: string;
  abbr: string;
  type: UnitType;
  status: UnitStatus;
}
