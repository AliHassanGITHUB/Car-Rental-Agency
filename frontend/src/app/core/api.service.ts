import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './environment';
import { Booking, Branch, PriceBreakdown, Vehicle } from './models';

export interface VehicleFilters {
  pickup_location?: string;
  pickup_at?: string;
  return_at?: string;
  category?: string;
  transmission?: string;
  seats?: number | string;
  min_price?: number | string;
  max_price?: number | string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  getVehicles(filters: VehicleFilters = {}): Observable<{ data: Vehicle[] }> {
    return this.http.get<{ data: Vehicle[] }>(`${environment.apiUrl}/vehicles`, {
      params: this.toParams(filters)
    });
  }

  getVehicle(id: string | number): Observable<{ data: Vehicle }> {
    return this.http.get<{ data: Vehicle }>(`${environment.apiUrl}/vehicles/${id}`);
  }

  getBranches(): Observable<{ data: Branch[] }> {
    return this.http.get<{ data: Branch[] }>(`${environment.apiUrl}/branches`);
  }

  createBooking(payload: Record<string, unknown>): Observable<{ data: Booking; price: PriceBreakdown }> {
    return this.http.post<{ data: Booking; price: PriceBreakdown }>(`${environment.apiUrl}/bookings`, payload);
  }

  myBookings(): Observable<{ data: Booking[] }> {
    return this.http.get<{ data: Booking[] }>(`${environment.apiUrl}/users/me/bookings`);
  }

  charge(payload: { booking_id: number; payment_method: string }): Observable<{ message: string; provider_ref: string }> {
    return this.http.post<{ message: string; provider_ref: string }>(`${environment.apiUrl}/payments/charge`, payload);
  }

  adminVehicles(): Observable<{ data: Vehicle[] }> {
    return this.http.get<{ data: Vehicle[] }>(`${environment.apiUrl}/admin/vehicles`);
  }

  saveAdminVehicle(vehicle: Partial<Vehicle>): Observable<{ data: Vehicle }> {
    if (vehicle.id) {
      return this.http.put<{ data: Vehicle }>(`${environment.apiUrl}/admin/vehicles/${vehicle.id}`, vehicle);
    }
    return this.http.post<{ data: Vehicle }>(`${environment.apiUrl}/admin/vehicles`, vehicle);
  }

  adminBookings(): Observable<{ data: Booking[] }> {
    return this.http.get<{ data: Booking[] }>(`${environment.apiUrl}/admin/bookings`);
  }

  private toParams(filters: VehicleFilters): HttpParams {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }
}
