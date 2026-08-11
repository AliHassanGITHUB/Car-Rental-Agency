import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Booking } from '../../models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-dashboard">
      <div class="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of your rental business</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon vehicles">🚗</div>
          <div class="stat-info">
            <span class="stat-value">{{ dashboardData()?.total_vehicles ?? 0 }}</span>
            <span class="stat-label">Total Vehicles</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon available">✅</div>
          <div class="stat-info">
            <span class="stat-value">{{ dashboardData()?.available_vehicles ?? 0 }}</span>
            <span class="stat-label">Available Vehicles</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bookings">📋</div>
          <div class="stat-info">
            <span class="stat-value">{{ dashboardData()?.active_bookings ?? 0 }}</span>
            <span class="stat-label">Active Bookings</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon revenue">💰</div>
          <div class="stat-info">
            <span class="stat-value">{{ formatCurrency(dashboardData()?.total_revenue ?? 0) }}</span>
            <span class="stat-label">Total Revenue</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon monthly">📅</div>
          <div class="stat-info">
            <span class="stat-value">{{ formatCurrency(dashboardData()?.monthly_revenue ?? 0) }}</span>
            <span class="stat-label">Monthly Revenue</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon utilization">📊</div>
          <div class="stat-info">
            <span class="stat-value">{{ (dashboardData()?.utilization_rate ?? 0).toFixed(1) }}%</span>
            <span class="stat-label">Utilization Rate</span>
          </div>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="quick-links">
        <a routerLink="/admin/vehicles" class="quick-link">
          <span class="link-icon">🚗</span>
          <span class="link-text">Manage Vehicles</span>
        </a>
        <a routerLink="/admin/bookings" class="quick-link">
          <span class="link-icon">📋</span>
          <span class="link-text">Manage Bookings</span>
        </a>
      </div>

      <div class="content-grid">
        <!-- Recent Bookings -->
        <div class="panel recent-bookings">
          <div class="panel-header">
            <h2>Recent Bookings</h2>
            <a routerLink="/admin/bookings" class="view-all">View All</a>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                @for (booking of recentBookings(); track booking.id) {
                  <tr>
                    <td class="ref-cell">{{ booking.reference_number }}</td>
                    <td>{{ booking.user?.name ?? 'N/A' }}</td>
                    <td>{{ booking.vehicle?.make }} {{ booking.vehicle?.model }}</td>
                    <td class="dates-cell">
                      <div>{{ formatDate(booking.start_date) }}</div>
                      <div class="date-separator">to</div>
                      <div>{{ formatDate(booking.end_date) }}</div>
                    </td>
                    <td>
                      <span class="status-badge" [class]="'status-' + booking.status">
                        {{ formatStatus(booking.status) }}
                      </span>
                    </td>
                    <td class="price-cell">{{ formatCurrency(booking.total_price) }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="empty-state">No recent bookings</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Bookings by Category -->
        <div class="panel category-breakdown">
          <div class="panel-header">
            <h2>Bookings by Category</h2>
          </div>
          <div class="category-list">
            @for (entry of categoryEntries(); track entry[0]) {
              <div class="category-item">
                <div class="category-info">
                  <span class="category-name">{{ entry[0] }}</span>
                  <span class="category-count">{{ entry[1] }} bookings</span>
                </div>
                <div class="category-bar">
                  <div class="category-bar-fill" [style.width.%]="getCategoryPercentage(entry[1])"></div>
                </div>
              </div>
            } @empty {
              <div class="empty-state">No booking data available</div>
            }
          </div>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-overlay">
          <div class="spinner"></div>
        </div>
      }

      @if (error()) {
        <div class="error-banner">
          {{ error() }}
          <button (click)="loadDashboard()">Retry</button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .admin-dashboard {
      max-width: 1400px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .admin-header {
      margin-bottom: 40px;
    }

    .admin-header h1 {
      font-size: 2rem;
      color: #1a1a2e;
      margin-bottom: 8px;
    }

    .admin-header p {
      color: #666;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: #fff;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-icon {
      font-size: 2rem;
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.vehicles { background: #e3f2fd; }
    .stat-icon.available { background: #e8f5e9; }
    .stat-icon.bookings { background: #fff3e0; }
    .stat-icon.revenue { background: #fce4ec; }
    .stat-icon.monthly { background: #f3e5f5; }
    .stat-icon.utilization { background: #e0f7fa; }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a1a2e;
    }

    .stat-label {
      font-size: 0.85rem;
      color: #666;
      margin-top: 4px;
    }

    /* Quick Links */
    .quick-links {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
    }

    .quick-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      background: #0f3460;
      color: #fff;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 600;
      transition: background 0.2s;
    }

    .quick-link:hover {
      background: #1a1a2e;
    }

    .link-icon {
      font-size: 1.3rem;
    }

    /* Content Grid */
    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }

    .panel {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #eee;
    }

    .panel-header h2 {
      font-size: 1.2rem;
      color: #1a1a2e;
    }

    .view-all {
      color: #e94560;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .view-all:hover {
      text-decoration: underline;
    }

    /* Table */
    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

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

    .dates-cell {
      font-size: 0.85rem;
    }

    .date-separator {
      color: #999;
      font-size: 0.8rem;
    }

    .price-cell {
      font-weight: 600;
      color: #1a1a2e;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .status-pending { background: #fff3e0; color: #e65100; }
    .status-confirmed { background: #e3f2fd; color: #1565c0; }
    .status-picked_up { background: #f3e5f5; color: #7b1fa2; }
    .status-returned { background: #e8f5e9; color: #2e7d32; }
    .status-cancelled { background: #fce4ec; color: #c62828; }

    /* Category Breakdown */
    .category-list {
      padding: 20px 24px;
    }

    .category-item {
      margin-bottom: 20px;
    }

    .category-item:last-child {
      margin-bottom: 0;
    }

    .category-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .category-name {
      font-weight: 600;
      color: #1a1a2e;
      text-transform: capitalize;
    }

    .category-count {
      color: #666;
      font-size: 0.85rem;
    }

    .category-bar {
      height: 8px;
      background: #f0f0f0;
      border-radius: 4px;
      overflow: hidden;
    }

    .category-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #0f3460, #e94560);
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    /* Empty & Loading States */
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #999;
    }

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

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-banner {
      background: #fce4ec;
      color: #c62828;
      padding: 16px 24px;
      border-radius: 8px;
      margin-top: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .error-banner button {
      padding: 6px 16px;
      background: #c62828;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }

    @media (max-width: 900px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminComponent implements OnInit {
  dashboardData = signal<any>(null);
  recentBookings = signal<Booking[]>([]);
  categoryEntries = signal<[string, number][]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  private totalBookings = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminService.getDashboard().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.recentBookings.set(data.recent_bookings ?? []);
        this.totalBookings = data.total_bookings ?? 0;
        const entries = Object.entries(data.bookings_by_category ?? {}) as [string, number][];
        this.categoryEntries.set(entries);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load dashboard data. Please try again.');
        this.loading.set(false);
      }
    });
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

  getCategoryPercentage(count: number): number {
    if (this.totalBookings === 0) return 0;
    return (count / this.totalBookings) * 100;
  }
}
