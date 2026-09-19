import { Customer, CustomerGroup } from '../types/customer.types';

export const initialCustomers: Customer[] = [
  { name: 'Amal Jayasuriya', mobile: '0765432109', orders: 24, spend: 'Rs.32,400', lastVisit: 'Jul 29, 2026' },
  { name: 'Dilani Rathnayake', mobile: '0771122334', orders: 11, spend: 'Rs.14,800', lastVisit: 'Aug 1, 2026' }
];

export const initialCustomerGroups: CustomerGroup[] = [
  { id: 1, name: 'VIP Members', discount: '10%', members: 42 },
  { id: 2, name: 'Corporate Staff', discount: '15%', members: 128 },
  { id: 3, name: 'Regular Patrons', discount: '5%', members: 310 }
];
