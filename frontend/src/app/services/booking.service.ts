import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking, PaginatedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = 'http://localhost:8000/api/v1';

  constructor(private http: HttpClient) {}

  create(data: {
    vehicle_id: number;
    pickup_branch_id: number;
    return_branch_id: number;
    start_date: string;
    end_date: string;
    addons?: { addon_type: string }[];
    payment_method_id: string;
  }): Observable<{ message: string; booking: Booking }> {
    return this.http.post<{ message: string; booking: Booking }>(`${this.apiUrl}/bookings`, data);
  }

  getById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/bookings/${id}`);
  }

  getMyBookings(): Observable<PaginatedResponse<Booking>> {
    return this.http.get<PaginatedResponse<Booking>>(`${this.apiUrl}/users/me/bookings`);
  }

  cancel(bookingId: number): Observable<{ message: string; refund_percentage: number }> {
    return this.http.post<{ message: string; refund_percentage: number }>(`${this.apiUrl}/bookings/${bookingId}/cancel`, {});
  }
}
