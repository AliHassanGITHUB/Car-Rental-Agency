import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { Booking } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Welcome, {{ userName() }}!</h1>
          <nav>
            <a routerLink="/vehicles" class="nav-link">Browse Vehicles</a>
            <button (click)="logout()" class="nav-link logout-btn">Logout</button>
          </nav>
        </div>
      </header>

      <div class="tabs">
        <button
          [class.active]="activeTab() === 'upcoming'"
          (click)="activeTab.set('upcoming')"
        >
          Upcoming Bookings
        </button>
        <button
          [class.active]="activeTab() === 'past'"
          (click)="activeTab.set('past')"
        >
          Past Bookings
        </button>
      </div>

      <div class="bookings-section">
        @if (isLoading()) {
          <div class="loading">Loading bookings...</div>
        } @else if (errorMessage()) {
          <div class="error-message">{{ errorMessage() }}</div>
        } @else if (filteredBookings().length === 0) {
          <div class="empty-state">
            <h3>No {{ activeTab() }} bookings</h3>
            <p>
              @if (activeTab() === 'upcoming') {
                You don't have any upcoming bookings yet.
                <a routerLink="/vehicles">Browse vehicles</a> to make a reservation.
              } @else {
                You don't have any past bookings yet.
              }
            </p>
          </div>
        } @else {
          <div class="bookings-list">
            @for (booking of filteredBookings(); track booking.id) {
              <div class="booking-card">
                <div class="booking-header">
                  <span class="reference">Ref: {{ booking.reference_number }}</span>
                  <span
                    class="status-badge"
                    [class]="'status-' + booking.status"
                  >
                    {{ booking.status | titlecase }}
                  </span>
                </div>

                <div class="booking-details">
                  <div class="detail-row">
                    <span class="label">Vehicle:</span>
                    <span class="value">
                      {{ booking.vehicle?.make }} {{ booking.vehicle?.model }}
                      ({{ booking.vehicle?.year }})
                    </span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Pickup Date:</span>
                    <span class="value">{{ booking.start_date | date:'mediumDate' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Return Date:</span>
                    <span class="value">{{ booking.end_date | date:'mediumDate' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Total Price:</span>
                    <span class="value price">\${{ booking.total_price | number:'1.2-2' }}</span>
                  </div>
                </div>

                @if (canCancel(booking)) {
                  <div class="booking-actions">
                    <button
                      class="cancel-btn"
                      (click)="confirmCancel(booking)"
                    >
                      Cancel Booking
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .dashboard-header {
      background-color: #007bff;
      color: white;
      padding: 1.5rem 2rem;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content h1 {
      margin: 0;
    }

    .header-content nav {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .nav-link {
      color: white;
      text-decoration: none;
      background: none;
      border: 1px solid rgba(255, 255, 255, 0.5);
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }

    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .logout-btn {
      font-size: 1rem;
    }

    .tabs {
      max-width: 1200px;
      margin: 2rem auto 0;
      padding: 0 2rem;
      display: flex;
      gap: 0.5rem;
    }

    .tabs button {
      padding: 0.75rem 1.5rem;
      border: 1px solid #ddd;
      background-color: white;
      cursor: pointer;
      font-size: 1rem;
      border-radius: 4px 4px 0 0;
    }

    .tabs button.active {
      background-color: #007bff;
      color: white;
      border-color: #007bff;
    }

    .bookings-section {
      max-width: 1200px;
      margin: 0 auto 2rem;
      padding: 2rem;
    }

    .loading, .error-message, .empty-state {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 8px;
    }

    .error-message {
      color: #c00;
      background-color: #fee;
      border: 1px solid #fcc;
    }

    .empty-state h3 {
      margin-bottom: 0.5rem;
      color: #666;
    }

    .empty-state a {
      color: #007bff;
    }

    .bookings-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .booking-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    }

    .booking-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #eee;
    }

    .reference {
      font-weight: 600;
      color: #333;
      font-size: 1.1rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .status-pending {
      background-color: #fff3cd;
      color: #856404;
    }

    .status-confirmed {
      background-color: #d4edda;
      color: #155724;
    }

    .status-active {
      background-color: #cce5ff;
      color: #004085;
    }

    .status-completed {
      background-color: #e2e3e5;
      color: #383d41;
    }

    .status-cancelled {
      background-color: #f8d7da;
      color: #721c24;
    }

    .booking-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
    }

    .detail-row {
      display: flex;
      flex-direction: column;
    }

    .label {
      font-size: 0.85rem;
      color: #888;
      margin-bottom: 0.25rem;
    }

    .value {
      color: #333;
      font-weight: 500;
    }

    .price {
      color: #28a745;
      font-size: 1.1rem;
    }

    .booking-actions {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
      text-align: right;
    }

    .cancel-btn {
      padding: 0.5rem 1rem;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .cancel-btn:hover {
      background-color: #c82333;
    }
  `]
})
export class DashboardComponent implements OnInit {
  bookings = signal<Booking[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');
  activeTab = signal<'upcoming' | 'past'>('upcoming');

  userName = computed(() => {
    const user = this.authService.currentUser();
    return user?.name || 'User';
  });

  filteredBookings = computed(() => {
    const now = new Date();
    return this.bookings().filter(b => {
      if (this.activeTab() === 'upcoming') {
        return new Date(b.end_date) >= now && b.status !== 'cancelled';
      }
      return new Date(b.end_date) < now || b.status === 'cancelled';
    });
  });

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.bookingService.getMyBookings().subscribe({
      next: (res) => {
        this.bookings.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to load bookings');
      }
    });
  }

  canCancel(booking: Booking): boolean {
    const now = new Date();
    const pickup = new Date(booking.start_date);
    return booking.status !== 'cancelled' && booking.status !== 'returned' && pickup > now;
  }

  confirmCancel(booking: Booking): void {
    if (confirm(`Are you sure you want to cancel booking ${booking.reference_number}?`)) {
      this.bookingService.cancel(booking.id).subscribe({
        next: () => {
          this.bookings.update(list =>
            list.map(b => b.id === booking.id ? { ...b, status: 'cancelled' as const } : b)
          );
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to cancel booking');
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
