import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Branch, PaginatedResponse, Vehicle, Booking } from '../models';

interface DashboardData {
  total_vehicles: number;
  available_vehicles: number;
  total_branches: number;
  total_bookings: number;
  active_bookings: number;
  total_revenue: number;
  monthly_revenue: number;
  utilization_rate: number;
  bookings_by_category: Record<string, number>;
  recent_bookings: Booking[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'http://localhost:8000/api/v1/admin';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`);
  }

  getVehicles(page = 1): Observable<PaginatedResponse<Vehicle>> {
    return this.http.get<PaginatedResponse<Vehicle>>(`${this.apiUrl}/vehicles`, { params: { page } });
  }

  createVehicle(data: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.apiUrl}/vehicles`, data);
  }

  updateVehicle(id: number, data: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.apiUrl}/vehicles/${id}`, data);
  }

  deleteVehicle(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/vehicles/${id}`);
  }

  getBookings(page = 1, status?: string, search?: string): Observable<PaginatedResponse<Booking>> {
    let params: Record<string, string> = { page: page.toString() };
    if (status) params['status'] = status;
    if (search) params['search'] = search;
    return this.http.get<PaginatedResponse<Booking>>(`${this.apiUrl}/bookings`, { params });
  }

  updateBookingStatus(bookingId: number, status: string): Observable<{ message: string; booking: Booking }> {
    return this.http.put<{ message: string; booking: Booking }>(`${this.apiUrl}/bookings/${bookingId}/status`, { status });
  }

  getBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.apiUrl}/branches`);
  }
}
