import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Find Your Perfect Ride</h1>
        <p>Affordable car rentals at your fingertips. Browse our wide selection of vehicles.</p>
      </div>
    </section>

    <!-- Search Bar -->
    <section class="search-section">
      <div class="search-container">
        <div class="search-field">
          <label for="pickupLocation">Pickup Location</label>
          <select id="pickupLocation" [(ngModel)]="pickupLocation">
            <option value="">Select Location</option>
            <option value="new-york">New York</option>
            <option value="los-angeles">Los Angeles</option>
            <option value="chicago">Chicago</option>
            <option value="houston">Houston</option>
            <option value="miami">Miami</option>
          </select>
        </div>

        <div class="search-field">
          <label for="pickupDate">Pickup Date</label>
          <input
            type="date"
            id="pickupDate"
            [(ngModel)]="pickupDate"
          />
        </div>

        <div class="search-field">
          <label for="returnDate">Return Date</label>
          <input
            type="date"
            id="returnDate"
            [(ngModel)]="returnDate"
          />
        </div>

        <div class="search-field">
          <label for="vehicleCategory">Vehicle Category</label>
          <select id="vehicleCategory" [(ngModel)]="vehicleCategory">
            <option value="">All Categories</option>
            <option value="economy">Economy</option>
            <option value="suv">SUV</option>
            <option value="luxury">Luxury</option>
            <option value="van">Van</option>
          </select>
        </div>

        <button class="search-btn" (click)="onSearch()">Search Vehicles</button>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="features-container">
        <div class="feature-card">
          <div class="feature-icon">🚗</div>
          <h3>Wide Selection</h3>
          <p>Choose from hundreds of vehicles across all categories.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💰</div>
          <h3>Best Prices</h3>
          <p>Competitive rates with no hidden fees.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🕐</div>
          <h3>24/7 Support</h3>
          <p>Round-the-clock customer service for your peace of mind.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">✅</div>
          <h3>Easy Booking</h3>
          <p>Simple and fast online reservation process.</p>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="categories">
      <h2>Explore Our Categories</h2>
      <div class="categories-container">
        <div class="category-card">
          <div class="category-icon">🚗</div>
          <h3>Economy</h3>
          <p>Fuel-efficient and budget-friendly cars for everyday driving.</p>
          <a routerLink="/fleet" [queryParams]="{ category: 'economy' }" class="category-link">View Fleet</a>
        </div>
        <div class="category-card">
          <div class="category-icon">🚙</div>
          <h3>SUV</h3>
          <p>Spacious and powerful vehicles for family adventures.</p>
          <a routerLink="/fleet" [queryParams]="{ category: 'suv' }" class="category-link">View Fleet</a>
        </div>
        <div class="category-card">
          <div class="category-icon">🏎️</div>
          <h3>Luxury</h3>
          <p>Premium vehicles for a first-class experience.</p>
          <a routerLink="/fleet" [queryParams]="{ category: 'luxury' }" class="category-link">View Fleet</a>
        </div>
        <div class="category-card">
          <div class="category-icon">🚐</div>
          <h3>Van</h3>
          <p>Ample cargo space for moving and group travel.</p>
          <a routerLink="/fleet" [queryParams]="{ category: 'van' }" class="category-link">View Fleet</a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>&copy; 2026 Rental Car Agency. All rights reserved.</p>
    </footer>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Hero Section */
    .hero {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      padding: 100px 20px;
      text-align: center;
    }

    .hero-content h1 {
      font-size: 3rem;
      color: #fff;
      margin-bottom: 20px;
      font-weight: 700;
    }

    .hero-content p {
      font-size: 1.25rem;
      color: #b0b0b0;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Search Section */
    .search-section {
      background: #fff;
      padding: 40px 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      margin-top: -50px;
      position: relative;
      z-index: 10;
    }

    .search-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      gap: 20px;
      align-items: flex-end;
      flex-wrap: wrap;
      justify-content: center;
    }

    .search-field {
      flex: 1;
      min-width: 200px;
      max-width: 250px;
    }

    .search-field label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
    }

    .search-field select,
    .search-field input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
      box-sizing: border-box;
    }

    .search-field select:focus,
    .search-field input:focus {
      outline: none;
      border-color: #0f3460;
    }

    .search-btn {
      padding: 12px 32px;
      background: #e94560;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s, transform 0.2s;
      height: 46px;
    }

    .search-btn:hover {
      background: #c73a52;
      transform: translateY(-1px);
    }

    /* Features Section */
    .features {
      padding: 80px 20px;
      background: #f8f9fa;
    }

    .features-container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
    }

    .feature-card {
      background: #fff;
      padding: 40px 30px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 20px;
    }

    .feature-card h3 {
      font-size: 1.3rem;
      margin-bottom: 12px;
      color: #1a1a2e;
    }

    .feature-card p {
      color: #666;
      line-height: 1.6;
    }

    /* Categories Section */
    .categories {
      padding: 80px 20px;
      background: #fff;
    }

    .categories h2 {
      text-align: center;
      font-size: 2.2rem;
      margin-bottom: 50px;
      color: #1a1a2e;
    }

    .categories-container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 30px;
    }

    .category-card {
      background: #f8f9fa;
      padding: 40px 30px;
      border-radius: 12px;
      text-align: center;
      border: 2px solid transparent;
      transition: border-color 0.3s, transform 0.3s;
    }

    .category-card:hover {
      border-color: #e94560;
      transform: translateY(-5px);
    }

    .category-icon {
      font-size: 3.5rem;
      margin-bottom: 20px;
    }

    .category-card h3 {
      font-size: 1.4rem;
      margin-bottom: 12px;
      color: #1a1a2e;
    }

    .category-card p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .category-link {
      display: inline-block;
      padding: 10px 24px;
      background: #0f3460;
      color: #fff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      transition: background 0.3s;
    }

    .category-link:hover {
      background: #1a1a2e;
    }

    /* Footer */
    .footer {
      background: #1a1a2e;
      color: #b0b0b0;
      text-align: center;
      padding: 30px 20px;
    }
  `]
})
export class LandingComponent {
  private router: Router;

  pickupLocation = signal('');
  pickupDate = signal('');
  returnDate = signal('');
  vehicleCategory = signal('');

  locations = signal([
    { value: 'new-york', label: 'New York' },
    { value: 'los-angeles', label: 'Los Angeles' },
    { value: 'chicago', label: 'Chicago' },
    { value: 'houston', label: 'Houston' },
    { value: 'miami', label: 'Miami' }
  ]);

  categories = signal([
    { value: 'economy', label: 'Economy' },
    { value: 'suv', label: 'SUV' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'van', label: 'Van' }
  ]);

  constructor(router: Router) {
    this.router = router;
  }

  onSearch(): void {
    const queryParams: Record<string, string> = {};

    if (this.pickupLocation()) {
      queryParams['location'] = this.pickupLocation();
    }
    if (this.pickupDate()) {
      queryParams['pickupDate'] = this.pickupDate();
    }
    if (this.returnDate()) {
      queryParams['returnDate'] = this.returnDate();
    }
    if (this.vehicleCategory()) {
      queryParams['category'] = this.vehicleCategory();
    }

    this.router.navigate(['/fleet'], { queryParams });
  }
}
