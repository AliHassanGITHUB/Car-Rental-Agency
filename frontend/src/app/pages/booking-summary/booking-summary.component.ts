import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models';

@Component({
  selector: 'app-booking-summary',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="summary-page" *ngIf="!loading()">
      <!-- Success Banner -->
      <div class="success-banner">
        <div class="checkmark">&#10003;</div>
        <h1>Booking Confirmed!</h1>
        <p>Your reservation has been successfully created. A confirmation has been sent to your email.</p>
      </div>

      <div class="summary-content">
        <!-- Booking Details -->
        <div class="details-card">
          <h2>Booking Details</h2>

          <div class="detail-row">
            <span class="label">Reference Number</span>
            <span class="value ref-number">{{ booking()!.reference_number }}</span>
          </div>

          <div class="detail-row">
            <span class="label">Status</span>
            <span class="value status-badge" [attr.data-status]="booking()!.status">
              {{ booking()!.status | titlecase }}
            </span>
          </div>

          <div class="detail-row">
            <span class="label">Vehicle</span>
            <span class="value">
              {{ booking()!.vehicle?.year }} {{ booking()!.vehicle?.make }} {{ booking()!.vehicle?.model }}
            </span>
          </div>

          <div class="detail-row">
            <span class="label">Category</span>
            <span class="value">{{ booking()!.vehicle?.category | titlecase }}</span>
          </div>

          <div class="detail-row">
            <span class="label">Pickup Date</span>
            <span class="value">{{ booking()!.start_date | date:'medium' }}</span>
          </div>

          <div class="detail-row">
            <span class="label">Return Date</span>
            <span class="value">{{ booking()!.end_date | date:'medium' }}</span>
          </div>

          <div class="detail-row">
            <span class="label">Pickup Branch</span>
            <span class="value">
              {{ booking()!.pickup_branch?.name }}
              <small>({{ booking()!.pickup_branch?.city }})</small>
            </span>
          </div>

          <div class="detail-row">
            <span class="label">Return Branch</span>
            <span class="value">
              {{ booking()!.return_branch?.name }}
              <small>({{ booking()!.return_branch?.city }})</small>
            </span>
          </div>

          <div class="detail-row" *ngIf="booking()!.cancellation_policy">
            <span class="label">Cancellation Policy</span>
            <span class="value">{{ booking()!.cancellation_policy }}</span>
          </div>
        </div>

        <!-- Price Breakdown -->
        <div class="details-card">
          <h2>Price Breakdown</h2>

          <div class="price-row">
            <span>Base Price</span>
            <span>\${{ booking()!.base_price | number:'1.2-2' }}</span>
          </div>

          <div class="price-row addon" *ngFor="let addon of booking()!.addons">
            <span>{{ addon.addon_type | titlecase }}</span>
            <span>\${{ addon.price | number:'1.2-2' }}</span>
          </div>

          <div class="price-row" *ngIf="booking()!.addons && booking()!.addons!.length > 0">
            <span>Add-ons Subtotal</span>
            <span>\${{ addonsTotal() | number:'1.2-2' }}</span>
          </div>

          <div class="price-row">
            <span>Tax</span>
            <span>\${{ booking()!.tax_amount | number:'1.2-2' }}</span>
          </div>

          <div class="price-row">
            <span>Insurance</span>
            <span>\${{ booking()!.insurance_amount | number:'1.2-2' }}</span>
          </div>

          <div class="price-divider"></div>

          <div class="price-row total">
            <span>Total</span>
            <span>\${{ booking()!.total_price | number:'1.2-2' }}</span>
          </div>
        </div>

        <!-- Payment Status -->
        <div class="details-card">
          <h2>Payment</h2>
          <div class="payment-info">
            <div class="detail-row">
              <span class="label">Status</span>
              <span class="value payment-status" [attr.data-status]="booking()!.payment?.status">
                {{ booking()!.payment?.status ? (booking()!.payment!.status | titlecase) : 'Pending' }}
              </span>
            </div>
            <div class="detail-row" *ngIf="booking()!.payment">
              <span class="label">Amount Paid</span>
              <span class="value">\${{ booking()!.payment!.amount | number:'1.2-2' }} {{ booking()!.payment!.currency }}</span>
            </div>
            <div class="detail-row" *ngIf="booking()!.payment">
              <span class="label">Provider</span>
              <span class="value">{{ booking()!.payment!.provider | titlecase }}</span>
            </div>
          </div>
        </div>

        <!-- Addons -->
        <div class="details-card" *ngIf="booking()!.addons && booking()!.addons!.length > 0">
          <h2>Selected Add-ons</h2>
          <div class="addons-list">
            <div class="addon-tag" *ngFor="let addon of booking()!.addons">
              <span class="addon-icon">&#10003;</span>
              <span>{{ formatAddon(addon.addon_type) }}</span>
              <span class="addon-price">\${{ addon.price | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>

        <!-- Cancellation Policy Reminder -->
        <div class="cancellation-reminder">
          <h3>Cancellation Policy Reminder</h3>
          <ul>
            <li><strong>Free cancellation:</strong> Up to 48 hours before pickup — full refund.</li>
            <li><strong>Late cancellation:</strong> Within 48 hours of pickup — 25% fee applies.</li>
            <li><strong>No-show:</strong> No refund will be issued.</li>
          </ul>
        </div>

        <!-- Actions -->
        <div class="actions">
          <button class="action-btn primary" (click)="downloadConfirmation()">Download Confirmation</button>
          <a routerLink="/dashboard" class="action-btn secondary">Back to Dashboard</a>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading-state" *ngIf="loading()">
      <p>Loading booking details...</p>
    </div>

    <!-- Error State -->
    <div class="error-state" *ngIf="error()">
      <p>{{ error() }}</p>
      <a routerLink="/dashboard" class="action-btn secondary">Back to Dashboard</a>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .summary-page {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .success-banner {
      background: linear-gradient(135deg, #1b5e20, #2e7d32);
      color: #fff;
      text-align: center;
      padding: 48px 24px;
      border-radius: 16px;
      margin-bottom: 32px;
    }

    .checkmark {
      width: 72px;
      height: 72px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      margin: 0 auto 20px;
      border: 3px solid rgba(255, 255, 255, 0.5);
    }

    .success-banner h1 {
      font-size: 2rem;
      margin-bottom: 8px;
    }

    .success-banner p {
      color: rgba(255, 255, 255, 0.85);
      font-size: 1rem;
    }

    .summary-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .details-card {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 24px;
    }

    .details-card h2 {
      font-size: 1.15rem;
      color: #1a1a2e;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 2px solid #f0f0f0;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #f5f5f5;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .label {
      color: #666;
      font-size: 0.9rem;
    }

    .value {
      font-weight: 600;
      color: #333;
      text-align: right;
    }

    .value small {
      color: #999;
      font-weight: 400;
    }

    .ref-number {
      font-family: monospace;
      font-size: 1rem;
      color: #0f3460;
      letter-spacing: 1px;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-badge[data-status="confirmed"] {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .status-badge[data-status="pending"] {
      background: #fff3e0;
      color: #e65100;
    }

    .status-badge[data-status="cancelled"] {
      background: #ffebee;
      color: #c62828;
    }

    .status-badge[data-status="picked_up"] {
      background: #e3f2fd;
      color: #1565c0;
    }

    .status-badge[data-status="returned"] {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 0.9rem;
      color: #555;
    }

    .price-row.addon {
      color: #0f3460;
      padding-left: 16px;
      font-size: 0.85rem;
    }

    .price-divider {
      border-top: 2px solid #e0e0e0;
      margin: 10px 0;
    }

    .price-row.total {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1a1a2e;
    }

    .payment-info {
      display: flex;
      flex-direction: column;
    }

    .payment-status {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .payment-status[data-status="succeeded"] {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .payment-status[data-status="pending"] {
      background: #fff3e0;
      color: #e65100;
    }

    .payment-status[data-status="failed"] {
      background: #ffebee;
      color: #c62828;
    }

    .addons-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .addon-tag {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      background: #f0f4ff;
      border-radius: 8px;
      font-size: 0.9rem;
    }

    .addon-icon {
      color: #2e7d32;
      font-weight: 700;
      font-size: 1rem;
    }

    .addon-price {
      margin-left: auto;
      font-weight: 600;
      color: #0f3460;
    }

    .cancellation-reminder {
      background: #fff8e1;
      border: 1px solid #ffe082;
      border-radius: 12px;
      padding: 20px 24px;
    }

    .cancellation-reminder h3 {
      color: #f57f17;
      font-size: 1rem;
      margin-bottom: 10px;
    }

    .cancellation-reminder ul {
      margin: 0;
      padding-left: 20px;
      color: #5d4037;
      font-size: 0.85rem;
      line-height: 1.8;
    }

    .cancellation-reminder li strong {
      color: #e65100;
    }

    .actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      padding-top: 8px;
    }

    .action-btn {
      padding: 14px 32px;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      text-align: center;
      cursor: pointer;
      transition: background 0.3s, transform 0.2s;
      border: none;
    }

    .action-btn.primary {
      background: #0f3460;
      color: #fff;
    }

    .action-btn.primary:hover {
      background: #1a1a2e;
      transform: translateY(-1px);
    }

    .action-btn.secondary {
      background: #fff;
      color: #333;
      border: 2px solid #e0e0e0;
      display: inline-block;
    }

    .action-btn.secondary:hover {
      border-color: #0f3460;
      color: #0f3460;
      transform: translateY(-1px);
    }

    .loading-state,
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      gap: 20px;
    }

    .loading-state p,
    .error-state p {
      font-size: 1.1rem;
      color: #666;
    }

    .error-state p {
      color: #e94560;
    }

    @media (max-width: 600px) {
      .summary-page {
        padding: 20px 16px;
      }

      .success-banner {
        padding: 32px 16px;
      }

      .success-banner h1 {
        font-size: 1.5rem;
      }

      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .value {
        text-align: left;
      }

      .actions {
        flex-direction: column;
      }
    }
  `]
})
export class BookingSummaryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingService);

  booking = signal<Booking | null>(null);
  loading = signal(true);
  error = signal('');

  addonsTotal = signal(0);

  ngOnInit(): void {
    const bookingId = Number(this.route.snapshot.paramMap.get('id'));

    this.bookingService.getById(bookingId).subscribe({
      next: (booking) => {
        this.booking.set(booking);
        const total = (booking.addons ?? []).reduce((sum, a) => sum + a.price, 0);
        this.addonsTotal.set(total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Booking not found. Please check your booking reference.');
      },
    });
  }

  formatAddon(type: string): string {
    const map: Record<string, string> = {
      gps: 'GPS Navigation',
      child_seat: 'Child Seat',
      additional_driver: 'Additional Driver',
      full_insurance: 'Full Insurance',
    };
    return map[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  downloadConfirmation(): void {
    alert('Booking confirmation for reference: ' + this.booking()!.reference_number + '\n\nPrint/save this page for your records.');
  }
}
