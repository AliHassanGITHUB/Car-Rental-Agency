import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/v1';

  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);
  isLoggedIn = computed(() => !!this.token());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor(private http: HttpClient, private router: Router) {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      this.token.set(savedToken);
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  register(data: { name: string; email: string; password: string; password_confirmation: string; phone?: string }): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>(`${this.apiUrl}/auth/register`, data).pipe(
      tap(res => this.setSession(res))
    );
  }

  login(email: string, password: string): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => this.setSession(res))
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe();
    this.clearSession();
    this.router.navigate(['/']);
  }

  fetchMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`).pipe(
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  private setSession(res: { user: User; token: string }): void {
    this.token.set(res.token);
    this.currentUser.set(res.user);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
  }

  clearSession(): void {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}
