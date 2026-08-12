import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from './environment';
import { User } from './models';

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSignal = signal<User | null>(this.loadUser());
  readonly currentUser = computed(() => this.userSignal());
  readonly isLoggedIn = computed(() => !!this.userSignal());

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  login(payload: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
      tap((response) => this.persist(response))
    );
  }

  register(payload: { name: string; email: string; password: string; phone?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload).pipe(
      tap((response) => this.persist(response))
    );
  }

  logout(): void {
    localStorage.removeItem('aster_drive_token');
    localStorage.removeItem('aster_drive_user');
    this.userSignal.set(null);
    this.router.navigateByUrl('/');
  }

  private persist(response: AuthResponse): void {
    localStorage.setItem('aster_drive_token', response.token);
    localStorage.setItem('aster_drive_user', JSON.stringify(response.user));
    this.userSignal.set(response.user);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem('aster_drive_user');
    return raw ? (JSON.parse(raw) as User) : null;
  }
}
