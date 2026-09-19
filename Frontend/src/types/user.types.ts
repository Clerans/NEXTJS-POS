export interface UserAccount {
  username: string;
  mobile: string;
  status: 'Active' | 'Inactive';
  role: 'Manager' | 'Barista' | 'Cashier' | 'Admin';
  lastLogin: string;
}
