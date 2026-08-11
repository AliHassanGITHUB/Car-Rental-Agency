import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { BranchService } from '../../services/branch.service';
import { BookingService } from '../../services/booking.service';
import { Vehicle, Branch } from '../../models';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="booking-page" *ngIf="!loading()">
      <div class="booking-header">
        <h1>Complete Your Booking</h1>
        <p>Review your selection and provide the required details below.</p>
      </div>

      <div class="booking-layout">
        <div class="booking-form-section">
          <!-- Vehicle Summary -->
          <div class="vehicle-summary" *ngIf="vehicle()">
            <div class="vehicle-image">
              <img [src]="vehicle()!.image_url || 'https://via.placeholder.com/200x120?text=No+Image'" [alt]="vehicle()!.model" />
            </div>
            <div class="vehicle-info">
              <h3>{{ vehicle()!.year }} {{ vehicle()!.make }} {{ vehicle()!.model }}</h3>
              <p class="vehicle-category">{{ vehicle()!.category }} • {{ vehicle()!.transmission }} • {{ vehicle()!.seats }} Seats</p>
              <p class="vehicle-rate">\${{ vehicle()!.daily_rate }} <span>/day</span></p>
            </div>
          </div>

          <!-- Pickup & Return Details -->
          <div class="form-section">
            <h2>Pickup & Return Details</h2>

            <div class="form-row">
              <div class="form-group">
                <label for="pickupDate">Pickup Date & Time *</label>
                <input
                  type="datetime-local"
                  id="pickupDate"
                  [ngModel]="pickupDate()"
                  (ngModelChange)="pickupDate.set($event)"
                  [min]="minDateTime()"
                />
                <span class="error" *ngIf="errors()['pickupDate']">{{ errors()['pickupDate'] }}</span>
              </div>

              <div class="form-group">
                <label for="returnDate">Return Date & Time *</label>
                <input
                  type="datetime-local"
                  id="returnDate"
                  [ngModel]="returnDate()"
                  (ngModelChange)="returnDate.set($event)"
                  [min]="minReturnDateTime()"
                />
                <span class="error" *ngIf="errors()['returnDate']">{{ errors()['returnDate'] }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="pickupBranch">Pickup Branch *</label>
                <select
                  id="pickupBranch"
                  [ngModel]="pickupBranchId()"
                  (ngModelChange)="pickupBranchId.set($event)"
                >
                  <option value="">Select pickup branch</option>
                  <option *ngFor="let branch of branches()" [value]="branch.id">
                    {{ branch.name }} - {{ branch.city }}
                  </option>
                </select>
                <span class="error" *ngIf="errors()['pickupBranch']">{{ errors()['pickupBranch'] }}</span>
              </div>

              <div class="form-group">
                <label for="returnBranch">Return Branch *</label>
                <select
                  id="returnBranch"
                  [ngModel]="returnBranchId()"
                  (ngModelChange)="returnBranchId.set($event)"
                >
                  <option value="">Select return branch</option>
                  <option *ngFor="let branch of branches()" [value]="branch.id">
                    {{ branch.name }} - {{ branch.city }}
                  </option>
                </select>
                <span class="error" *ngIf="errors()['returnBranch']">{{ errors()['returnBranch'] }}</span>
              </div>
            </div>
          </div>

          <!-- Add-ons -->
          <div class="form-section">
            <h2>Optional Add-ons</h2>
            <div class="addons-grid">
              <label class="addon-item" *ngFor="let addon of addonOptions">
                <input
                  type="checkbox"
                  [checked]="selectedAddons().includes(addon.type)"
                  (change)="toggleAddon(addon.type)"
                />
                <div class="addon-details">
                  <span class="addon-name">{{ addon.name }}</span>
                  <span class="addon-price">\${{ addon.price }}/day</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Driver Verification -->
          <div class="form-section">
            <h2>Driver Verification</h2>
            <div class="form-row">
              <div class="form-group">
                <label for="licenseNumber">License Number *</label>
                <input
                  type="text"
                  id="licenseNumber"
                  [ngModel]="licenseNumber()"
                  (ngModelChange)="licenseNumber.set($event)"
                  placeholder="e.g. DL-12345678"
                />
                <span class="error" *ngIf="errors()['licenseNumber']">{{ errors()['licenseNumber'] }}</span>
              </div>

              <div class="form-group">
                <label for="licenseExpiry">License Expiry Date *</label>
                <input
                  type="date"
                  id="licenseExpiry"
                  [ngModel]="licenseExpiry()"
                  (ngModelChange)="licenseExpiry.set($event)"
                />
                <span class="error" *ngIf="errors()['licenseExpiry']">{{ errors()['licenseExpiry'] }}</span>
              </div>
            </div>
          </div>

          <!-- Payment -->
          <div class="form-section">
            <h2>Payment Details</h2>
            <div class="payment-mock">
              <div class="card-icons">
                <span class="card-icon">VISA</span>
                <span class="card-icon">MC</span>
                <span class="card-icon">AMEX</span>
              </div>
              <div class="form-group full-width">
                <label for="cardNumber">Card Number *</label>
                <input
                  type="text"
                  id="cardNumber"
                  [ngModel]="cardNumber()"
                  (ngModelChange)="cardNumber.set($event)"
                  placeholder="1234 5678 9012 3456"
                  maxlength="19"
                />
                <span class="error" *ngIf="errors()['cardNumber']">{{ errors()['cardNumber'] }}</span>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="cardExpiry">Expiry *</label>
                  <input
                    type="text"
                    id="cardExpiry"
                    [ngModel]="cardExpiry()"
                    (ngModelChange)="cardExpiry.set($event)"
                    placeholder="MM/YY"
                    maxlength="5"
                  />
                  <span class="error" *ngIf="errors()['cardExpiry']">{{ errors()['cardExpiry'] }}</span>
                </div>
                <div class="form-group">
                  <label for="cardCvc">CVC *</label>
                  <input
                    type="text"
                    id="cardCvc"
                    [ngModel]="cardCvc()"
                    (ngModelChange)="cardCvc.set($event)"
                    placeholder="123"
                    maxlength="4"
                  />
                  <span class="error" *ngIf="errors()['cardCvc']">{{ errors()['cardCvc'] }}</span>
                </div>
              </div>
              <p class="stripe-notice">Stripe Elements would be integrated here in production.</p>
            </div>
          </div>

          <!-- Cancellation Policy -->
          <div class="cancellation-policy">
            <h3>Cancellation Policy</h3>
            <ul>
              <li><strong>Free cancellation:</strong> Up to 48 hours before pickup — full refund.</li>
              <li><strong>Late cancellation:</strong> Within 48 hours of pickup — 25% fee applies.</li>
              <li><strong>No-show:</strong> No refund will be issued.</li>
              <li>Changes to dates are subject to availability and may incur a fee.</li>
            </ul>
          </div>

          <!-- Submit Button -->
          <div class="submit-section">
            <span class="error general-error" *ngIf="errors()['general']">{{ errors()['general'] }}</span>
            <button
              class="submit-btn"
              (click)="onSubmit()"
              [disabled]="submitting()"
            >
              <span *ngIf="!submitting()">Confirm & Pay \${{ totalPrice() | number:'1.2-2' }}</span>
              <span *ngIf="submitting()">Processing...</span>
            </button>
          </div>
        </div>

        <!-- Price Breakdown (Sticky Panel) -->
        <div class="price-panel">
          <div class="price-panel-inner">
            <h3>Price Breakdown</h3>

            <div class="price-line">
              <span>Daily Rate</span>
              <span>\${{ dailyRate() | number:'1.2-2' }}</span>
            </div>

            <div class="price-line">
              <span>Number of Days</span>
              <span>{{ days() }}</span>
            </div>

            <div class="price-line">
              <span>Base Price</span>
              <span>\${{ basePrice() | number:'1.2-2' }}</span>
            </div>

            <div class="price-line addon-line" *ngFor="let addon of activeAddons()">
              <span>{{ addon.name }}</span>
              <span>\${{ addon.total | number:'1.2-2' }}</span>
            </div>

            <div class="price-line">
              <span>Add-ons Subtotal</span>
              <span>\${{ addonsTotal() | number:'1.2-2' }}</span>
            </div>

            <div class="price-line">
              <span>Tax (12%)</span>
              <span>\${{ taxAmount() | number:'1.2-2' }}</span>
            </div>

            <div class="price-line">
              <span>Insurance</span>
              <span>\${{ insuranceAmount() | number:'1.2-2' }}</span>
            </div>

            <div class="price-divider"></div>

            <div class="price-line total">
              <span>Total</span>
              <span>\${{ totalPrice() | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading-state" *ngIf="loading()">
      <p>Loading booking details...</p>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .booking-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .booking-header {
      margin-bottom: 30px;
    }

    .booking-header h1 {
      font-size: 2rem;
      color: #1a1a2e;
      margin-bottom: 8px;
    }

    .booking-header p {
      color: #666;
      font-size: 1rem;
    }

    .booking-layout {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 30px;
      align-items: flex-start;
    }

    .vehicle-summary {
      display: flex;
      gap: 20px;
      align-items: center;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }

    .vehicle-image img {
      width: 160px;
      height: 100px;
      object-fit: cover;
      border-radius: 8px;
    }

    .vehicle-info h3 {
      font-size: 1.25rem;
      color: #1a1a2e;
      margin-bottom: 4px;
    }

    .vehicle-category {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 8px;
    }

    .vehicle-rate {
      font-size: 1.5rem;
      font-weight: 700;
      color: #e94560;
    }

    .vehicle-rate span {
      font-size: 0.9rem;
      font-weight: 400;
      color: #666;
    }

    .form-section {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .form-section h2 {
      font-size: 1.2rem;
      color: #1a1a2e;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #f0f0f0;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      color: #333;
      margin-bottom: 6px;
      font-size: 0.9rem;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 10px 14px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 0.95rem;
      box-sizing: border-box;
      transition: border-color 0.3s;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #0f3460;
    }

    .error {
      color: #e94560;
      font-size: 0.8rem;
      margin-top: 4px;
      display: block;
    }

    .general-error {
      text-align: center;
      margin-bottom: 12px;
      font-size: 0.9rem;
    }

    .addons-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .addon-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: border-color 0.3s, background 0.3s;
    }

    .addon-item:hover {
      border-color: #0f3460;
    }

    .addon-item:has(input:checked) {
      border-color: #0f3460;
      background: #f0f4ff;
    }

    .addon-item input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #0f3460;
    }

    .addon-details {
      display: flex;
      flex-direction: column;
    }

    .addon-name {
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
    }

    .addon-price {
      color: #666;
      font-size: 0.8rem;
    }

    .payment-mock {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
    }

    .card-icons {
      display: flex;
      gap: 10px;
      margin-bottom: 16px;
    }

    .card-icon {
      padding: 4px 12px;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      color: #333;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .stripe-notice {
      color: #999;
      font-size: 0.8rem;
      text-align: center;
      margin-top: 12px;
      font-style: italic;
    }

    .cancellation-policy {
      background: #fff8e1;
      border: 1px solid #ffe082;
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 24px;
    }

    .cancellation-policy h3 {
      color: #f57f17;
      font-size: 1rem;
      margin-bottom: 10px;
    }

    .cancellation-policy ul {
      margin: 0;
      padding-left: 20px;
      color: #5d4037;
      font-size: 0.85rem;
      line-height: 1.8;
    }

    .cancellation-policy li strong {
      color: #e65100;
    }

    .submit-section {
      text-align: center;
    }

    .submit-btn {
      width: 100%;
      padding: 16px 32px;
      background: #e94560;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.3s, transform 0.2s;
    }

    .submit-btn:hover:not(:disabled) {
      background: #c73a52;
      transform: translateY(-1px);
    }

    .submit-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    /* Price Panel */
    .price-panel {
      position: sticky;
      top: 20px;
    }

    .price-panel-inner {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    }

    .price-panel-inner h3 {
      font-size: 1.1rem;
      color: #1a1a2e;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 2px solid #f0f0f0;
    }

    .price-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 0.9rem;
      color: #555;
    }

    .price-line.addon-line {
      color: #0f3460;
      font-size: 0.85rem;
    }

    .price-divider {
      border-top: 2px solid #e0e0e0;
      margin: 10px 0;
    }

    .price-line.total {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1a1a2e;
    }

    .loading-state {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .loading-state p {
      font-size: 1.1rem;
      color: #666;
    }

    @media (max-width: 900px) {
      .booking-layout {
        grid-template-columns: 1fr;
      }

      .price-panel {
        position: static;
        order: -1;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .addons-grid {
        grid-template-columns: 1fr;
      }

      .vehicle-summary {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class BookingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vehicleService = inject(VehicleService);
  private branchService = inject(BranchService);
  private bookingService = inject(BookingService);

  vehicle = signal<Vehicle | null>(null);
  branches = signal<Branch[]>([]);
  loading = signal(true);
  submitting = signal(false);

  pickupDate = signal('');
  returnDate = signal('');
  pickupBranchId = signal<number | string>('');
  returnBranchId = signal<number | string>('');

  selectedAddons = signal<string[]>([]);

  licenseNumber = signal('');
  licenseExpiry = signal('');

  cardNumber = signal('');
  cardExpiry = signal('');
  cardCvc = signal('');

  errors = signal<Record<string, string>>({});

  addonOptions = [
    { type: 'gps', name: 'GPS Navigation', price: 10 },
    { type: 'child_seat', name: 'Child Seat', price: 15 },
    { type: 'additional_driver', name: 'Additional Driver', price: 12 },
    { type: 'full_insurance', name: 'Full Insurance', price: 25 },
  ];

  minDateTime = computed(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  });

  minReturnDateTime = computed(() => {
    if (!this.pickupDate()) return this.minDateTime();
    const pickup = new Date(this.pickupDate());
    pickup.setHours(pickup.getHours() + 1);
    return pickup.toISOString().slice(0, 16);
  });

  dailyRate = computed(() => this.vehicle()?.daily_rate ?? 0);

  days = computed(() => {
    if (!this.pickupDate() || !this.returnDate()) return 0;
    const pickup = new Date(this.pickupDate());
    const returnDate = new Date(this.returnDate());
    const diffMs = returnDate.getTime() - pickup.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  });

  basePrice = computed(() => this.dailyRate() * this.days());

  activeAddons = computed(() => {
    const selected = this.selectedAddons();
    const days = this.days();
    return this.addonOptions
      .filter(a => selected.includes(a.type))
      .map(a => ({ name: a.name, total: a.price * days }));
  });

  addonsTotal = computed(() => this.activeAddons().reduce((sum, a) => sum + a.total, 0));

  insuranceAmount = computed(() => {
    const hasFullInsurance = this.selectedAddons().includes('full_insurance');
    return hasFullInsurance ? 0 : 0;
  });

  taxAmount = computed(() => (this.basePrice() + this.addonsTotal()) * 0.12);

  totalPrice = computed(() => this.basePrice() + this.addonsTotal() + this.taxAmount());

  ngOnInit(): void {
    const vehicleId = Number(this.route.snapshot.paramMap.get('id'));

    this.branchService.getAll().subscribe({
      next: (branches) => this.branches.set(branches),
    });

    this.vehicleService.getById(vehicleId).subscribe({
      next: (vehicle) => {
        this.vehicle.set(vehicle);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/fleet']);
      },
    });
  }

  toggleAddon(type: string): void {
    const current = this.selectedAddons();
    if (current.includes(type)) {
      this.selectedAddons.set(current.filter(a => a !== type));
    } else {
      this.selectedAddons.set([...current, type]);
    }
  }

  private validate(): boolean {
    const errs: Record<string, string> = {};

    if (!this.pickupDate()) {
      errs['pickupDate'] = 'Pickup date is required.';
    }

    if (!this.returnDate()) {
      errs['returnDate'] = 'Return date is required.';
    } else if (this.pickupDate() && new Date(this.returnDate()) <= new Date(this.pickupDate())) {
      errs['returnDate'] = 'Return date must be after pickup date.';
    }

    if (!this.pickupBranchId()) {
      errs['pickupBranch'] = 'Pickup branch is required.';
    }

    if (!this.returnBranchId()) {
      errs['returnBranch'] = 'Return branch is required.';
    }

    if (!this.licenseNumber().trim()) {
      errs['licenseNumber'] = 'License number is required.';
    }

    if (!this.licenseExpiry()) {
      errs['licenseExpiry'] = 'License expiry date is required.';
    } else if (new Date(this.licenseExpiry()) < new Date()) {
      errs['licenseExpiry'] = 'License has expired.';
    }

    if (!this.cardNumber().trim() || this.cardNumber().replace(/\s/g, '').length < 13) {
      errs['cardNumber'] = 'Valid card number is required.';
    }

    if (!this.cardExpiry().trim() || !/^\d{2}\/\d{2}$/.test(this.cardExpiry())) {
      errs['cardExpiry'] = 'Use MM/YY format.';
    }

    if (!this.cardCvc().trim() || this.cardCvc().length < 3) {
      errs['cardCvc'] = 'CVC is required.';
    }

    if (this.days() === 0) {
      errs['general'] = 'Rental period must be at least 1 day.';
    }

    this.errors.set(errs);
    return Object.keys(errs).length === 0;
  }

  onSubmit(): void {
    if (this.submitting()) return;
    if (!this.validate()) return;

    this.submitting.set(true);

    const vehicleId = this.vehicle()!.id;
    const addonsPayload = this.selectedAddons().map(type => ({ addon_type: type }));

    const payload = {
      vehicle_id: vehicleId,
      pickup_branch_id: Number(this.pickupBranchId()),
      return_branch_id: Number(this.returnBranchId()),
      start_date: this.pickupDate(),
      end_date: this.returnDate(),
      addons: addonsPayload.length > 0 ? addonsPayload : undefined,
      payment_method_id: 'mock_pm_' + this.cardNumber().replace(/\s/g, '').slice(-4),
    };

    this.bookingService.create(payload).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.router.navigate(['/booking-summary', res.booking.id]);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errors.set({
          general: err.error?.message || 'Booking failed. Please try again.',
        });
      },
    });
  }
}
