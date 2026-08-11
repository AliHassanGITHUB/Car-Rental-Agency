import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Branch } from '../models';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private apiUrl = 'http://localhost:8000/api/v1';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.apiUrl}/admin/branches`);
  }
}
