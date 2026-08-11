import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { Booking, PaginatedResponse } from '../../../models';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-bookings">
      <div class="page-header">
        <h1>Manage Bookings</h1>
        <p>{{ totalBookings() }} total bookings</p>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by reference or customer..."
            [(ngModel)]="searchTerm"
            (input)="onSearchDebounced()"
          />
        </div>
        <div class="filter-group">
          <label>Status:</label>
          <select [(ngModel)]="statusFilter" (change)="onFilterChange()">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="picked_up">Picked Up</option>
            <option value="returned">Returned</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <!-- Bookings Table -->
      <div class="table-panel">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Pickup Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (booking of bookings(); track booking.id) {
                <tr>
                  <td class="ref-cell">{{ booking.reference_number }}</td>
                  <td>
                    <div class="customer-name">{{ booking.user?.name ?? 'N/A' }}</div>
                    <div class="customer-email">{{ booking.user?.email ?? '' }}</div>
                  </td>
                  <td>
                    <div>{{ booking.vehicle?.make }} {{ booking.vehicle?.model }}</div>
                    <div class="vehicle-year">{{ booking.vehicle?.year }}</div>
                  </td>
                  <td>{{ formatDate(booking.start_date) }}</td>
                  <td>{{ formatDate(booking.end_date) }}</td>
                  <td>
                    <span class="status-badge" [class]="'status-' + booking.status">
                      {{ formatStatus(booking.status) }}
                    </span>
                  </td>
                  <td class="price-cell">{{ formatCurrency(booking.total_price) }}</td>
                  <td class="actions-cell">
                    <div class="action-buttons">
                      @for (action of getActions(booking.status); track action.status) {
                        <button
                          class="btn-action"
                          [class]="'btn-action-' + action.type"
                          [disabled]="updatingId() === booking.id"
                          (click)="updateStatus(booking.id, action.status)"
                          [title]="action.label"
                        >
                          {{ action.icon }} {{ action.label }}
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="empty-state">
                    @if (loading()) {
                      Loading bookings...
                    } @else {
                      No bookings found
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="pagination">
            <button class="page-btn" [disabled]="currentPage() === 1" (click)="goToPage(currentPage() - 1)">← Previous</button>
            <span class="page-info">Page {{ currentPage() }} of {{ totalPages() }}</span>
            <button class="page-btn" [disabled]="currentPage() === totalPages()" (click)="goToPage(currentPage() + 1)">Next →</button>
          </div>
        }
      </div>

      @if (loading() && bookings().length === 0) {
        <div class="loading-overlay">
          <div class="spinner"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .admin-bookings {
      max-width: 1400px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .page-header {
      margin-bottom: 30px;
    }

    .page-header h1 {
      font-size: 2rem;
      color: #1a1a2e;
      margin-bottom: 4px;
    }

    .page-header p { color: #666; }

    /* Filters */
    .filters-bar {
      display: flex;
      gap: 20px;
      margin-bottom: 24px;
      flex-wrap: wrap;
      align-items: center;
    }

    .search-box {
      display: flex;
      align-items: center;
      background: #fff;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 0 14px;
      flex: 1;
      min-width: 280px;
      max-width: 400px;
      transition: border-color 0.2s;
    }

    .search-box:focus-within { border-color: #0f3460; }

    .search-icon { margin-right: 8px; color: #999; }

    .search-box input {
      border: none;
      outline: none;
      padding: 10px 0;
      font-size: 0.95rem;
      width: 100%;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .filter-group label {
      font-weight: 600;
      color: #555;
      font-size: 0.9rem;
    }

    .filter-group select {
      padding: 10px 14px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 0.95rem;
      background: #fff;
      cursor: pointer;
    }

    .filter-group select:focus {
      outline: none;
      border-color: #0f3460;
    }

    /* Table */
    .table-panel {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    .table-container { overflow-x: auto; }

    table { width: 100%; border-collapse: collapse; }

    th, td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid #f0f0f0;
      font-size: 0.9rem;
    }

    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #555;
    }

    .ref-cell {
      font-family: monospace;
      font-weight: 600;
      color: #0f3460;
    }

    .customer-name { font-weight: 600; color: #1a1a2e; }
    .customer-email { font-size: 0.8rem; color: #999; }
    .vehicle-year { font-size: 0.8rem; color: #999; }

    .price-cell { font-weight: 600; color: #1a1a2e; }

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: capitalize;
      white-space: nowrap;
    }

    .status-pending { background: #fff3e0; color: #e65100; }
    .status-confirmed { background: #e3f2fd; color: #1565c0; }
    .status-picked_up { background: #f3e5f5; color: #7b1fa2; }
    .status-returned { background: #e8f5e9; color: #2e7d32; }
    .status-cancelled { background: #fce4ec; color: #c62828; }

    .actions-cell { white-space: nowrap; }

    .action-buttons {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .btn-action {
      padding: 5px 10px;
      border: none;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
      white-space: nowrap;
    }

    .btn-action:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-action-confirm { background: #e3f2fd; color: #1565c0; }
    .btn-action-confirm:hover:not(:disabled) { background: #bbdefb; }

    .btn-action-pickup { background: #f3e5f5; color: #7b1fa2; }
    .btn-action-pickup:hover:not(:disabled) { background: #e1bee7; }

    .btn-action-return { background: #e8f5e9; color: #2e7d32; }
    .btn-action-return:hover:not(:disabled) { background: #c8e6c9; }

    .btn-action-cancel { background: #fce4ec; color: #c62828; }
    .btn-action-cancel:hover:not(:disabled) { background: #f8bbd0; }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }

    /* Pagination */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 20px;
      border-top: 1px solid #f0f0f0;
    }

    .page-btn {
      padding: 8px 16px;
      background: #f0f0f0;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }

    .page-btn:hover:not(:disabled) { background: #e0e0e0; }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .page-info { color: #666; font-size: 0.9rem; }

    /* Loading */
    .loading-overlay {
      position: fixed;
      inset: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f0f0f0;
      border-top-color: #e94560;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AdminBookingsComponent implements OnInit {
  bookings = signal<Booking[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  totalBookings = signal(0);
  updatingId = signal<number | null>(null);

  statusFilter = '';
  searchTerm = '';
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading.set(true);
    this.adminService.getBookings(
      this.currentPage(),
      this.statusFilter || undefined,
      this.searchTerm || undefined
    ).subscribe({
      next: (res) => {
        this.bookings.set(res.data);
        this.totalPages.set(res.last_page);
        this.totalBookings.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadBookings();
  }

  onSearchDebounced(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadBookings();
    }, 350);
  }

  getActions(status: string): { status: string; label: string; icon: string; type: string }[] {
    switch (status) {
      case 'pending':
        return [
          { status: 'confirmed', label: 'Confirm', icon: '✅', type: 'confirm' },
          { status: 'cancelled', label: 'Cancel', icon: '❌', type: 'cancel' }
        ];
      case 'confirmed':
        return [
          { status: 'picked_up', label: 'Picked Up', icon: '🚗', type: 'pickup' },
          { status: 'cancelled', label: 'Cancel', icon: '❌', type: 'cancel' }
        ];
      case 'picked_up':
        return [
          { status: 'returned', label: 'Returned', icon: '🏁', type: 'return' }
        ];
      default:
        return [];
    }
  }

  updateStatus(bookingId: number, newStatus: string): void {
    this.updatingId.set(bookingId);
    this.adminService.updateBookingStatus(bookingId, newStatus).subscribe({
      next: () => {
        this.updatingId.set(null);
        this.loadBookings();
      },
      error: () => this.updatingId.set(null)
    });
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadBookings();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatStatus(status: string): string {
    return status.replace('_', ' ');
  }
}
