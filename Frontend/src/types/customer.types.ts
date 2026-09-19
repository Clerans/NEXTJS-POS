export interface Customer {
  name: string;
  mobile: string;
  orders: number;
  spend: string;
  lastVisit: string;
}

export interface CustomerGroup {
  id: number;
  name: string;
  discount: string;
  members: number;
}
