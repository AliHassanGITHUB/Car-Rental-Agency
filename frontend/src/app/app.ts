import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="nav-brand">RentalCar</a>
        <div class="nav-links">
          <a routerLink="/fleet" routerLinkActive="active">Fleet</a>
          @if (auth.isLoggedIn()) {
            <a routerLink="/dashboard" routerLinkActive="active">My Bookings</a>
            @if (auth.isAdmin()) {
              <a routerLink="/admin" routerLinkActive="active">Admin</a>
            }
            <button class="nav-btn" (click)="auth.logout()">Logout</button>
          } @else {
            <a routerLink="/login" routerLinkActive="active">Login</a>
            <a routerLink="/register" class="nav-btn-primary" routerLinkActive="active">Sign Up</a>
          }
        </div>
      </div>
    </nav>
    <main class="main-content">
      <router-outlet />
    </main>
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-grid">
          <div class="footer-col">
            <h4>RentalCar</h4>
            <p>Premium car rental service with locations across the city. Quality vehicles, competitive prices, exceptional service.</p>
          </div>
          <div class="footer-col">
            <h4>Quick Links</h4>
            <a routerLink="/fleet">Browse Fleet</a>
            <a routerLink="/fleet">Locations</a>
            <a routerLink="/fleet">About Us</a>
          </div>
          <div class="footer-col">
            <h4>Support</h4>
            <p>Phone: +1 (555) 123-4567</p>
            <p>Email: support&#64;rentalcar.com</p>
            <p>24/7 Roadside Assistance</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 RentalCar Agency. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styleUrl: './app.scss',
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
