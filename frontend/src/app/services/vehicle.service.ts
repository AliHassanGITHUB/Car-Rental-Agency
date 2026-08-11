import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle, PaginatedResponse, Review, Branch } from '../models';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private apiUrl = 'http://localhost:8000/api/v1';

  constructor(private http: HttpClient) {}

  search(filters: Record<string, string>): Observable<PaginatedResponse<Vehicle>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params = params.set(key, value);
    });
    return this.http.get<PaginatedResponse<Vehicle>>(`${this.apiUrl}/vehicles`, { params });
  }

  getById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/vehicles/${id}`);
  }

  getReviews(vehicleId: number): Observable<PaginatedResponse<Review>> {
    return this.http.get<PaginatedResponse<Review>>(`${this.apiUrl}/vehicles/${vehicleId}/reviews`);
  }

  submitReview(vehicleId: number, data: { rating: number; comment?: string }): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/vehicles/${vehicleId}/reviews`, data);
  }
}
