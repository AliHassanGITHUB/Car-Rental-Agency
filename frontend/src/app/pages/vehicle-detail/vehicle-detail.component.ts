import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle, Review } from '../../models';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    @if (loading()) {
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Loading vehicle details...</p>
      </div>
    } @else if (vehicle()) {
      <!-- Hero Image Section -->
      <section class="hero-section" [style.background-color]="categoryColor()">
        <div class="hero-overlay">
          <div class="hero-content">
            <span class="category-badge">{{ vehicle()!.category }}</span>
            <h1>{{ vehicle()!.year }} {{ vehicle()!.make }} {{ vehicle()!.model }}</h1>
            <div class="hero-meta">
              @if (vehicle()!.average_rating) {
                <span class="rating-display">
                  <span class="stars">{{ getStars(vehicle()!.average_rating!) }}</span>
                  <span class="rating-text">{{ vehicle()!.average_rating!.toFixed(1) }}</span>
                  <span class="review-count">({{ vehicle()!.review_count }} reviews)</span>
                </span>
              }
              <span class="branch-location">
                <span class="location-icon">&#128205;</span>
                {{ vehicle()!.branch?.name }} - {{ vehicle()!.branch?.city }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Content -->
      <div class="detail-container">
        <!-- Left Column - Vehicle Info -->
        <div class="detail-main">
          <!-- Vehicle Info Card -->
          <div class="info-card">
            <h2>Vehicle Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Make</span>
                <span class="info-value">{{ vehicle()!.make }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Model</span>
                <span class="info-value">{{ vehicle()!.model }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Year</span>
                <span class="info-value">{{ vehicle()!.year }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Category</span>
                <span class="info-value category-tag">{{ vehicle()!.category }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Transmission</span>
                <span class="info-value">{{ vehicle()!.transmission }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Seats</span>
                <span class="info-value">{{ vehicle()!.seats }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Color</span>
                <span class="info-value">{{ vehicle()!.color || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Daily Rate</span>
                <span class="info-value rate">\${{ vehicle()!.daily_rate.toFixed(2) }}/day</span>
              </div>
            </div>
          </div>

          <!-- Branch Location Card -->
          <div class="info-card">
            <h2>Location</h2>
            <div class="branch-info">
              <div class="branch-icon">&#127968;</div>
              <div class="branch-details">
                <h3>{{ vehicle()!.branch?.name }}</h3>
                <p>{{ vehicle()!.branch?.address }}</p>
                <p>{{ vehicle()!.branch?.city }}</p>
              </div>
            </div>
          </div>

          <!-- Specs Grid Card -->
          <div class="info-card">
            <h2>Specifications</h2>
            <div class="specs-grid">
              <div class="spec-item">
                <span class="spec-icon">&#9881;</span>
                <span class="spec-label">Transmission</span>
                <span class="spec-value">{{ vehicle()!.transmission }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-icon">&#128186;</span>
                <span class="spec-label">Seats</span>
                <span class="spec-value">{{ vehicle()!.seats }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-icon">&#128200;</span>
                <span class="spec-label">Mileage Included</span>
                <span class="spec-value">{{ vehicle()!.mileage_included }} km/day</span>
              </div>
              <div class="spec-item">
                <span class="spec-icon">&#9981;</span>
                <span class="spec-label">Fuel Type</span>
                <span class="spec-value">N/A</span>
              </div>
            </div>
          </div>

          <!-- Reviews Section -->
          <div class="info-card reviews-section">
            <h2>Customer Reviews</h2>
            @if (reviews().length > 0) {
              <div class="reviews-list">
                @for (review of reviews(); track review.id) {
                  <div class="review-item">
                    <div class="review-header">
                      <span class="reviewer-name">{{ review.user?.name || 'Anonymous' }}</span>
                      <span class="review-stars">{{ getStars(review.rating) }}</span>
                      <span class="review-rating">{{ review.rating }}/5</span>
                    </div>
                    @if (review.comment) {
                      <p class="review-comment">{{ review.comment }}</p>
                    }
                    <span class="review-date">{{ review.created_at | date:'mediumDate' }}</span>
                  </div>
                }
              </div>
            } @else {
              <p class="no-reviews">No reviews yet. Be the first to review this vehicle!</p>
            }
          </div>
        </div>

        <!-- Right Column - Booking Sidebar -->
        <div class="detail-sidebar">
          <div class="booking-card">
            <div class="price-display">
              <span class="price-amount">\${{ vehicle()!.daily_rate.toFixed(2) }}</span>
              <span class="price-period">/day</span>
            </div>

            <!-- Price Breakdown -->
            <div class="price-breakdown">
              <h3>Price Breakdown</h3>
              <div class="breakdown-row">
                <span>Daily Rate</span>
                <span>\${{ vehicle()!.daily_rate.toFixed(2) }}</span>
              </div>
              <div class="breakdown-row">
                <span>Number of Days</span>
                <span>{{ calculatedDays() }}</span>
              </div>
              <div class="breakdown-row subtotal">
                <span>Subtotal</span>
                <span>\${{ subtotal().toFixed(2) }}</span>
              </div>
              <div class="breakdown-row tax">
                <span>Tax (10%)</span>
                <span>\${{ taxAmount().toFixed(2) }}</span>
              </div>
              <div class="breakdown-row total">
                <span>Estimated Total</span>
                <span>\${{ totalEstimate().toFixed(2) }}</span>
              </div>
            </div>

            <button class="book-btn" (click)="bookVehicle()">
              Book This Vehicle
            </button>

            <div class="booking-note">
              <p>&#128274; Free cancellation up to 24 hours before pickup</p>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="error-container">
        <h2>Vehicle not found</h2>
        <a routerLink="/fleet" class="back-link">Back to Fleet</a>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      gap: 16px;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e0e0e0;
      border-top-color: #e94560;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .hero-section {
      position: relative;
      height: 400px;
      display: flex;
      align-items: flex-end;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%);
      display: flex;
      align-items: flex-end;
      padding: 40px;
    }

    .hero-content h1 {
      font-size: 2.5rem;
      color: #fff;
      margin: 0 0 8px 0;
      font-weight: 700;
    }

    .category-badge {
      display: inline-block;
      background: #e94560;
      color: #fff;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }

    .hero-meta {
      display: flex;
      gap: 24px;
      align-items: center;
      flex-wrap: wrap;
    }

    .rating-display {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #fff;
    }

    .stars {
      color: #ffc107;
      font-size: 1.1rem;
    }

    .rating-text {
      font-weight: 600;
    }

    .review-count {
      color: #b0b0b0;
      font-size: 0.9rem;
    }

    .branch-location {
      color: #e0e0e0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .location-icon {
      font-size: 1.1rem;
    }

    .detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 40px;
    }

    .detail-main {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .info-card {
      background: #fff;
      border-radius: 12px;
      padding: 28px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    }

    .info-card h2 {
      font-size: 1.3rem;
      color: #1a1a2e;
      margin: 0 0 20px 0;
      padding-bottom: 12px;
      border-bottom: 2px solid #f0f0f0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-label {
      font-size: 0.85rem;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 1.05rem;
      color: #333;
      font-weight: 500;
    }

    .category-tag {
      display: inline-block;
      background: #e8f4f8;
      color: #0f3460;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.9rem;
      text-transform: capitalize;
    }

    .rate {
      color: #e94560;
      font-weight: 700;
      font-size: 1.15rem;
    }

    .branch-info {
      display: flex;
      gap: 20px;
      align-items: flex-start;
    }

    .branch-icon {
      font-size: 2.5rem;
    }

    .branch-details h3 {
      margin: 0 0 8px 0;
      color: #1a1a2e;
      font-size: 1.1rem;
    }

    .branch-details p {
      margin: 0;
      color: #666;
      line-height: 1.6;
    }

    .specs-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .spec-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
      text-align: center;
    }

    .spec-icon {
      font-size: 1.8rem;
      margin-bottom: 8px;
    }

    .spec-label {
      font-size: 0.8rem;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .spec-value {
      font-size: 1rem;
      color: #333;
      font-weight: 600;
    }

    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .review-item {
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .review-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .reviewer-name {
      font-weight: 600;
      color: #333;
    }

    .review-stars {
      color: #ffc107;
    }

    .review-rating {
      color: #888;
      font-size: 0.9rem;
    }

    .review-comment {
      margin: 0 0 8px 0;
      color: #555;
      line-height: 1.5;
    }

    .review-date {
      font-size: 0.8rem;
      color: #aaa;
    }

    .no-reviews {
      color: #888;
      text-align: center;
      padding: 20px;
    }

    .booking-card {
      background: #fff;
      border-radius: 12px;
      padding: 28px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      position: sticky;
      top: 20px;
    }

    .price-display {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f0f0f0;
    }

    .price-amount {
      font-size: 2.2rem;
      font-weight: 700;
      color: #e94560;
    }

    .price-period {
      font-size: 1rem;
      color: #888;
    }

    .price-breakdown {
      margin-bottom: 24px;
    }

    .price-breakdown h3 {
      font-size: 1rem;
      color: #333;
      margin: 0 0 16px 0;
    }

    .breakdown-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      color: #666;
      font-size: 0.95rem;
    }

    .breakdown-row.subtotal {
      border-top: 1px solid #eee;
      margin-top: 8px;
      padding-top: 12px;
      font-weight: 600;
      color: #333;
    }

    .breakdown-row.tax {
      color: #888;
      font-size: 0.9rem;
    }

    .breakdown-row.total {
      border-top: 2px solid #e94560;
      margin-top: 12px;
      padding-top: 12px;
      font-weight: 700;
      font-size: 1.1rem;
      color: #1a1a2e;
    }

    .book-btn {
      width: 100%;
      padding: 16px;
      background: #e94560;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s, transform 0.2s;
    }

    .book-btn:hover {
      background: #c73a52;
      transform: translateY(-2px);
    }

    .booking-note {
      margin-top: 16px;
      text-align: center;
    }

    .booking-note p {
      margin: 0;
      font-size: 0.85rem;
      color: #888;
    }

    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      gap: 20px;
    }

    .back-link {
      color: #e94560;
      text-decoration: none;
      font-weight: 600;
    }

    .back-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 900px) {
      .detail-container {
        grid-template-columns: 1fr;
      }

      .hero-section {
        height: 300px;
      }

      .hero-content h1 {
        font-size: 1.8rem;
      }

      .info-grid, .specs-grid {
        grid-template-columns: 1fr;
      }

      .booking-card {
        position: static;
      }
    }
  `]
})
export class VehicleDetailComponent implements OnInit {
  vehicle = signal<Vehicle | null>(null);
  reviews = signal<Review[]>([]);
  loading = signal(true);

  startDate = signal('');
  endDate = signal('');

  calculatedDays = computed(() => {
    const start = this.startDate();
    const end = this.endDate();
    if (!start || !end) return 1;
    const startMs = new Date(start).getTime();
    const endMs = new Date(end).getTime();
    const diff = endMs - startMs;
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 1;
  });

  subtotal = computed(() => {
    return (this.vehicle()?.daily_rate || 0) * this.calculatedDays();
  });

  taxAmount = computed(() => this.subtotal() * 0.10);

  totalEstimate = computed(() => this.subtotal() + this.taxAmount());

  categoryColor = computed(() => {
    const category = this.vehicle()?.category?.toLowerCase();
    switch (category) {
      case 'economy': return '#4CAF50';
      case 'suv': return '#2196F3';
      case 'luxury': return '#9C27B0';
      case 'van': return '#FF9800';
      default: return '#607D8B';
    }
  });

  private vehicleId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.vehicleId = +params['id'];
      this.loadVehicle();
    });

    this.route.queryParams.subscribe(params => {
      this.startDate.set(params['start_date'] || '');
      this.endDate.set(params['end_date'] || '');
    });
  }

  loadVehicle(): void {
    this.loading.set(true);
    this.vehicleService.getById(this.vehicleId).subscribe({
      next: (vehicle) => {
        this.vehicle.set(vehicle);
        this.loadReviews();
      },
      error: () => {
        this.loading.set(false);
        this.vehicle.set(null);
      }
    });
  }

  loadReviews(): void {
    this.vehicleService.getReviews(this.vehicleId).subscribe({
      next: (response) => {
        this.reviews.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  getStars(rating: number): string {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '\u2605'.repeat(full) + (half ? '\u00BD' : '') + '\u2606'.repeat(empty);
  }

  bookVehicle(): void {
    const queryParams: Record<string, string> = {};
    if (this.startDate()) queryParams['start_date'] = this.startDate();
    if (this.endDate()) queryParams['end_date'] = this.endDate();
    this.router.navigate(['/booking', this.vehicleId], { queryParams });
  }
}
