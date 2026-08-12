export type Role = 'guest' | 'customer' | 'admin';
export type VehicleCategory = 'economy' | 'suv' | 'luxury';
export type BookingStatus = 'pending' | 'confirmed' | 'paid' | 'cancelled' | 'picked_up' | 'returned';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
}

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  category: VehicleCategory;
  transmission: 'automatic' | 'manual';
  seats: number;
  daily_rate: number;
  status: 'available' | 'maintenance' | 'retired';
  branch_id: number;
  image_url?: string;
  included_mileage?: number;
  rating?: number;
  reviews_count?: number;
  available?: boolean;
  branch?: Branch;
}

export interface Booking {
  id: number;
  user_id: number;
  vehicle_id: number;
  pickup_branch_id: number;
  return_branch_id: number;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  total_price: number;
  reference?: string;
  vehicle?: Vehicle;
}

export interface PriceBreakdown {
  days: number;
  base: number;
  insurance: number;
  addons: number;
  taxes: number;
  total: number;
}
