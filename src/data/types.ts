export type MenuCategory =
  | 'Milk Tea'
  | 'Coffee'
  | 'Immune Teas'
  | 'Bellam Flavours'
  | 'Lassies'
  | 'Milk Shakes'
  | 'Chillers'
  | 'Mojitos'
  | 'Snacks';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  description: string;
  prepTime: number;
  image: string;
  popular?: boolean;
  available?: boolean;
}

export type CustomizationProfile =
  | 'hot_beverage'
  | 'cold_beverage'
  | 'shakes'
  | 'mojitos'
  | 'lassis'
  | 'snacks';

export interface Customization {
  sugarLevel: 'None' | 'Low' | 'Medium' | 'Full';
  milkType: 'Regular' | 'Skimmed' | 'Soy' | 'Almond' | 'Oat';
  temperature: 'Hot' | 'Warm' | 'Cold';
  thickness?: 'Regular' | 'Thick' | 'Extra Thick';
  toppings?: 'None' | 'Whipped Cream' | 'Chocolate Sauce' | 'Nuts';
  iceLevel?: 'Less' | 'Normal' | 'Extra';
  freshMint?: boolean;
  notes?: string;
}

export interface CartLine {
  uid: string;
  item: MenuItem;
  quantity: number;
  customization: Customization;
}

export type OrderStatus = 'Received' | 'Preparing' | 'Ready' | 'Served' | 'Cancelled';

export interface Order {
  id: string;
  orderNumber?: string;
  userId?: string;
  tableNumber: number;
  lines: CartLine[];
  status: OrderStatus;
  placedAt: number;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  splitBetween: number;
}

export interface Outlet {
  id: string;
  name: string;
  city: string;
  area: string;
  address: string;
  hours: string;
  phone: string;
  lat: number;
  lng: number;
  amenities: string[];
  dineIn: boolean;
  takeaway: boolean;
}

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  role: 'customer' | 'owner' | 'admin';
  loyalty_points?: number;
  tier?: 'Silver' | 'Gold' | 'Platinum';
  outlet_id?: string;
  avatar_url?: string;
}

export interface InventoryItem {
  id: string;
  outlet_id: string;
  item_name: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  status: 'OK' | 'LOW' | 'CRITICAL';
  last_restocked?: string;
}

export interface StaffMember {
  id: string;
  outlet_id: string;
  name: string;
  role: 'Manager' | 'Tea Maker' | 'Server' | 'Cashier' | 'Cleaner';
  shift: 'Morning' | 'Afternoon' | 'Evening' | 'Full';
  phone: string;
  present: boolean;
  salary: number;
}
