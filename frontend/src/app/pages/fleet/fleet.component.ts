import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { BranchService } from '../../services/branch.service';
import { Vehicle, Branch } from '../../models';

@Component({
  selector: 'app-fleet',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="fleet-page">
      <header class="fleet-header">
        <h1>Our Fleet</h1>
        <p>Find the perfect vehicle for your journey</p>
        <button class="filter-toggle" (click)="filtersOpen.set(!filtersOpen())">
          {{ filtersOpen() ? 'Hide Filters' : 'Show Filters' }}
        </button>
      </header>

      <div class="fleet-body" [class.filters-open]="filtersOpen()">
        <!-- Filter Sidebar -->
        <aside class="filter-sidebar" [class.open]="filtersOpen()">
          <div class="filter-section">
            <h3>Category</h3>
            <label *ngFor="let cat of categories">
              <input type="checkbox" [value]="cat" (change)="toggleCategory(cat)" [checked]="selectedCategories().includes(cat)">
              {{ cat }}
            </label>
          </div>

          <div class="filter-section">
            <h3>Transmission</h3>
            <label *ngFor="let t of transmissions">
              <input type="radio" name="transmission" [value]="t" (change)="selectedTransmission.set(t)" [checked]="selectedTransmission() === t">
              {{ t || 'Any' }}
            </label>
          </div>

          <div class="filter-section">
            <h3>Min Seats</h3>
            <input type="range" min="2" max="12" [ngModel]="minSeats()" (ngModelChange)="minSeats.set($event)">
            <span>{{ minSeats() }}+</span>
          </div>

          <div class="filter-section">
            <h3>Max Price / Day ($)</h3>
            <input type="number" min="0" placeholder="No limit" [ngModel]="maxPrice()" (ngModelChange)="maxPrice.set($event)">
          </div>

          <div class="filter-section">
            <h3>Branch</h3>
            <select [ngModel]="selectedBranchId()" (ngModelChange)="selectedBranchId.set($event)">
              <option value="">All Branches</option>
              <option *ngFor="let b of branches()" [value]="b.id">{{ b.name }}</option>
            </select>
          </div>

          <div class="filter-section">
            <h3>Pickup Date</h3>
            <input type="date" [ngModel]="startDate()" (ngModelChange)="startDate.set($event)">
          </div>

          <div class="filter-section">
            <h3>Return Date</h3>
            <input type="date" [ngModel]="endDate()" (ngModelChange)="endDate.set($event)">
          </div>

          <button class="apply-btn" (click)="applyFilters()">Apply Filters</button>
          <button class="clear-btn" (click)="clearFilters()">Clear All</button>
        </aside>

        <!-- Results -->
        <main class="fleet-results">
          <!-- Loading skeleton -->
          <div class="vehicle-grid" *ngIf="loading()">
            <div class="vehicle-card skeleton" *ngFor="let i of skeletonItems">
              <div class="skeleton-image"></div>
              <div class="skeleton-text"></div>
              <div class="skeleton-text short"></div>
              <div class="skeleton-text"></div>
            </div>
          </div>

          <!-- Empty state -->
          <div class="empty-state" *ngIf="!loading() && vehicles().length === 0">
            <div class="empty-icon">🚗</div>
            <h2>No vehicles found</h2>
            <p>Try adjusting your filters or search criteria.</p>
            <button (click)="clearFilters()">Clear Filters</button>
          </div>

          <!-- Vehicle grid -->
          <div class="vehicle-grid" *ngIf="!loading() && vehicles().length > 0">
            <div class="vehicle-card" *ngFor="let v of vehicles()">
              <div class="vehicle-image" [style.background-color]="getCategoryColor(v.category)">
                <span class="category-badge">{{ v.category }}</span>
              </div>
              <div class="vehicle-info">
                <h3>{{ v.make }} {{ v.model }} {{ v.year }}</h3>
                <div class="vehicle-meta">
                  <span>{{ v.transmission }}</span>
                  <span>{{ v.seats }} seats</span>
                  <span>{{ getBranchName(v.branch_id) }}</span>
                </div>
                <div class="vehicle-rating" *ngIf="v.average_rating">
                  <span *ngFor="let star of getStars(v.average_rating!)" [class.filled]="star <= v.average_rating!">&#9733;</span>
                </div>
                <div class="vehicle-price">
                  <span class="price">\${{ v.daily_rate }}</span>
                  <span class="per-day">/day</span>
                </div>
                <a class="view-btn" [routerLink]="['/fleet', v.id]" [queryParams]="getBookingParams()">View Details</a>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div class="pagination" *ngIf="!loading() && totalPages() > 1">
            <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 1">← Prev</button>
            <span>Page {{ currentPage() }} of {{ totalPages() }}</span>
            <button (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() === totalPages()">Next →</button>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .fleet-page { max-width: 1280px; margin: 0 auto; padding: 2rem 1rem; }
    .fleet-header { text-align: center; margin-bottom: 2rem; position: relative; }
    .fleet-header h1 { font-size: 2rem; margin-bottom: 0.25rem; }
    .fleet-header p { color: #666; }
    .filter-toggle { display: none; margin-top: 1rem; padding: 0.5rem 1rem; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; }

    .fleet-body { display: flex; gap: 2rem; }
    .filter-sidebar { width: 260px; flex-shrink: 0; }
    .filter-section { margin-bottom: 1.25rem; }
    .filter-section h3 { font-size: 0.875rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .filter-section label { display: block; font-size: 0.875rem; margin-bottom: 0.25rem; cursor: pointer; }
    .filter-section input[type="range"] { width: 100%; }
    .filter-section input[type="number"], .filter-section select, .filter-section input[type="date"] { width: 100%; padding: 0.4rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.875rem; box-sizing: border-box; }
    .apply-btn { width: 100%; padding: 0.6rem; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; margin-bottom: 0.5rem; }
    .clear-btn { width: 100%; padding: 0.6rem; background: transparent; color: #555; border: 1px solid #ccc; border-radius: 6px; cursor: pointer; font-size: 0.875rem; }

    .fleet-results { flex: 1; min-width: 0; }
    .vehicle-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; }
    .vehicle-card { border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; transition: box-shadow 0.2s; }
    .vehicle-card:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.1); }
    .vehicle-image { height: 160px; display: flex; align-items: flex-end; padding: 0.75rem; position: relative; }
    .category-badge { background: rgba(255,255,255,0.9); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .vehicle-info { padding: 1rem; }
    .vehicle-info h3 { margin: 0 0 0.5rem; font-size: 1rem; }
    .vehicle-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; font-size: 0.8rem; color: #666; margin-bottom: 0.5rem; }
    .vehicle-rating { margin-bottom: 0.5rem; font-size: 0.85rem; color: #ccc; }
    .vehicle-rating .filled { color: #f59e0b; }
    .vehicle-price { margin-bottom: 0.75rem; }
    .vehicle-price .price { font-size: 1.25rem; font-weight: 700; }
    .vehicle-price .per-day { font-size: 0.8rem; color: #888; }
    .view-btn { display: block; text-align: center; padding: 0.5rem; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px; font-size: 0.875rem; }

    /* Skeleton */
    .skeleton .skeleton-image { height: 160px; background: #e5e7eb; animation: pulse 1.5s infinite; border-radius: 10px 10px 0 0; }
    .skeleton .skeleton-text { height: 14px; background: #e5e7eb; border-radius: 4px; margin: 0.75rem 1rem 0; animation: pulse 1.5s infinite; }
    .skeleton .skeleton-text.short { width: 60%; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

    /* Empty state */
    .empty-state { text-align: center; padding: 4rem 1rem; color: #666; }
    .empty-state .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
    .empty-state h2 { color: #333; }
    .empty-state button { margin-top: 1rem; padding: 0.6rem 1.5rem; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; }

    /* Pagination */
    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 2rem; }
    .pagination button { padding: 0.4rem 1rem; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
    .pagination button:disabled { opacity: 0.4; cursor: default; }
    .pagination span { font-size: 0.875rem; }

    /* Responsive */
    @media (max-width: 768px) {
      .filter-toggle { display: inline-block; }
      .filter-sidebar { display: none; position: fixed; top: 0; left: 0; width: 280px; height: 100vh; background: #fff; z-index: 1000; padding: 1.5rem; overflow-y: auto; box-shadow: 2px 0 8px rgba(0,0,0,0.15); }
      .filter-sidebar.open { display: block; }
      .fleet-body { flex-direction: column; }
    }
  `]
})
export class FleetComponent implements OnInit {
  private vehicleService = inject(VehicleService);
  private branchService = inject(BranchService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  vehicles = signal<Vehicle[]>([]);
  branches = signal<Branch[]>([]);
  loading = signal(true);
  filtersOpen = signal(false);

  currentPage = signal(1);
  totalPages = signal(1);
  pageSize = 12;

  selectedCategories = signal<string[]>([]);
  selectedTransmission = signal<string>('');
  minSeats = signal(2);
  maxPrice = signal<number | null>(null);
  selectedBranchId = signal('');
  startDate = signal('');
  endDate = signal('');
  pickupLocation = signal('');

  categories = ['economy', 'compact', 'midsize', 'suv', 'luxury', 'van'];
  transmissions = ['', 'automatic', 'manual'];
  skeletonItems = Array.from({ length: 8 });

  private categoryColors: Record<string, string> = {
    economy: '#3b82f6',
    compact: '#10b981',
    midsize: '#f59e0b',
    suv: '#8b5cf6',
    luxury: '#ef4444',
    van: '#ec4899'
  };

  ngOnInit(): void {
    this.branchService.getAll().subscribe(b => this.branches.set(b));

    this.route.queryParams.subscribe(params => {
      if (params['category']) this.selectedCategories.set([params['category']]);
      if (params['start_date']) this.startDate.set(params['start_date']);
      if (params['end_date']) this.endDate.set(params['end_date']);
      if (params['pickup_location']) this.pickupLocation.set(params['pickup_location']);
      this.currentPage.set(params['page'] ? +params['page'] : 1);
      this.fetchVehicles();
    });
  }

  fetchVehicles(): void {
    this.loading.set(true);
    const params: Record<string, string> = {
      page: this.currentPage().toString(),
      per_page: this.pageSize.toString(),
    };
    if (this.selectedCategories().length > 0) {
      params['category'] = this.selectedCategories()[0];
    }
    if (this.selectedTransmission()) {
      params['transmission'] = this.selectedTransmission();
    }
    if (this.minSeats() > 2) {
      params['seats'] = this.minSeats().toString();
    }
    if (this.maxPrice()) {
      params['max_price'] = this.maxPrice()!.toString();
    }
    if (this.selectedBranchId()) {
      params['branch_id'] = this.selectedBranchId();
    }
    if (this.startDate()) {
      params['start_date'] = this.startDate();
    }
    if (this.endDate()) {
      params['end_date'] = this.endDate();
    }

    this.vehicleService.search(params).subscribe({
      next: (res: any) => {
        this.vehicles.set(res.data ?? []);
        this.totalPages.set(res.last_page ?? 1);
        this.loading.set(false);
      },
      error: () => {
        this.vehicles.set([]);
        this.loading.set(false);
      }
    });
  }

  toggleCategory(cat: string): void {
    const current = this.selectedCategories();
    this.selectedCategories.set(
      current.includes(cat) ? current.filter(c => c !== cat) : [...current, cat]
    );
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.updateUrl();
    this.fetchVehicles();
    this.filtersOpen.set(false);
  }

  clearFilters(): void {
    this.selectedCategories.set([]);
    this.selectedTransmission.set('');
    this.minSeats.set(2);
    this.maxPrice.set(null);
    this.selectedBranchId.set('');
    this.startDate.set('');
    this.endDate.set('');
    this.currentPage.set(1);
    this.updateUrl();
    this.fetchVehicles();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.updateUrl();
    this.fetchVehicles();
  }

  updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: this.selectedCategories().length === 1 ? this.selectedCategories()[0] : this.selectedCategories().join(',') || null,
        start_date: this.startDate() || null,
        end_date: this.endDate() || null,
        pickup_location: this.pickupLocation() || null,
        page: this.currentPage() > 1 ? this.currentPage() : null
      },
      queryParamsHandling: 'merge'
    });
  }

  getBookingParams(): Record<string, string> {
    const params: Record<string, string> = {};
    if (this.startDate()) params['start_date'] = this.startDate();
    if (this.endDate()) params['end_date'] = this.endDate();
    if (this.pickupLocation()) params['pickup_location'] = this.pickupLocation();
    return params;
  }

  getCategoryColor(category: string): string {
    return this.categoryColors[category] || '#6b7280';
  }

  getBranchName(branchId: number): string {
    const branch = this.branches().find(b => b.id === branchId);
    return branch?.name ?? '';
  }

  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
}
