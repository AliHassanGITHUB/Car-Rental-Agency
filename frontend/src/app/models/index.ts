export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone: string | null;
  created_at: string;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
  vehicles_count?: number;
}

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  category: string;
  transmission: string;
  seats: number;
  daily_rate: number;
  status: string;
  branch_id: number;
  branch?: Branch;
  color: string | null;
  license_plate: string | null;
  mileage_included: number;
  description: string | null;
  image_url: string | null;
  average_rating?: number;
  review_count?: number;
  reviews?: Review[];
}

export interface Booking {
  id: number;
  reference_number: string;
  user_id: number;
  vehicle_id: number;
  pickup_branch_id: number;
  return_branch_id: number;
  start_date: string;
  end_date: string;
  status: 'pending' | 'confirmed' | 'picked_up' | 'returned' | 'cancelled';
  base_price: number;
  tax_amount: number;
  insurance_amount: number;
  total_price: number;
  cancellation_policy: string | null;
  vehicle?: Vehicle;
  pickup_branch?: Branch;
  return_branch?: Branch;
  addons?: BookingAddon[];
  payment?: Payment;
  user?: User;
  created_at: string;
}

export interface BookingAddon {
  id: number;
  booking_id: number;
  addon_type: string;
  price: number;
}

export interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  currency: string;
  provider: string;
  provider_ref: string | null;
  status: string;
}

export interface Review {
  id: number;
  vehicle_id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  user?: { id: number; name: string };
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PriceBreakdown {
  daily_rate: number;
  days: number;
  base_price: number;
  tax_amount: number;
  insurance_amount: number;
  addons_total: number;
  total_price: number;
}
