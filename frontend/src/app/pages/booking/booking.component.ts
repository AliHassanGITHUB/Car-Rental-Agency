import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Booking, Branch, PriceBreakdown, Vehicle } from '../../core/models';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  vehicles = signal<Vehicle[]>([]);
  branches = signal<Branch[]>([]);
  createdBooking = signal<Booking | null>(null);
  paymentRef = signal<string | null>(null);
  error = signal<string | null>(null);

  readonly bookingForm = this.fb.nonNullable.group({
    vehicle_id: ['', Validators.required],
    pickup_branch_id: ['1', Validators.required],
    return_branch_id: ['1', Validators.required],
    start_date: ['2026-08-15T09:00', Validators.required],
    end_date: ['2026-08-18T18:00', Validators.required],
    renter_name: ['', Validators.required],
    phone: ['', Validators.required],
    license_number: ['', Validators.required],
    license_expiry: ['', Validators.required],
    document_url: ['', Validators.required],
    insurance: ['full'],
    gps: [true],
    child_seat: [false],
    additional_driver: [false],
    accept_policy: [false, Validators.requiredTrue]
  });

  readonly price = signal<PriceBreakdown>({ days: 3, base: 0, insurance: 54, addons: 18, taxes: 0, total: 0 });

  ngOnInit(): void {
    this.api.getVehicles().subscribe((response) => {
      this.vehicles.set(response.data);
      const vehicleId = this.route.snapshot.queryParamMap.get('vehicle_id') ?? String(response.data[0]?.id ?? '');
      this.bookingForm.controls.vehicle_id.setValue(vehicleId);
      this.updatePrice();
    });

    this.api.getBranches().subscribe((response) => this.branches.set(response.data));
    this.bookingForm.valueChanges.subscribe(() => this.updatePrice());
  }

  reserve(): void {
    this.error.set(null);
    if (!this.auth.isLoggedIn()) {
      this.error.set('Please sign in or create an account before confirming this booking.');
      return;
    }

    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      this.error.set('Please complete renter, driver verification, and policy acceptance fields.');
      return;
    }

    this.api.createBooking(this.bookingForm.getRawValue()).subscribe({
      next: (response) => {
        this.createdBooking.set(response.data);
        this.price.set(response.price);
      },
      error: () => this.error.set('Booking could not be created. Please review availability and try again.')
    });
  }

  pay(): void {
    const booking = this.createdBooking();
    if (!booking) {
      return;
    }

    this.api.charge({ booking_id: booking.id, payment_method: 'pm_card_visa' }).subscribe({
      next: (response) => this.paymentRef.set(response.provider_ref),
      error: () => this.error.set('Payment failed in test mode. Use a Stripe test payment method.')
    });
  }

  selectedVehicle(): Vehicle | undefined {
    const id = Number(this.bookingForm.controls.vehicle_id.value);
    return this.vehicles().find((vehicle) => vehicle.id === id);
  }

  private updatePrice(): void {
    const vehicle = this.selectedVehicle();
    if (!vehicle) {
      return;
    }

    const start = new Date(this.bookingForm.controls.start_date.value);
    const end = new Date(this.bookingForm.controls.end_date.value);
    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / msPerDay));
    const base = days * Number(vehicle.daily_rate);
    const insurance = this.bookingForm.controls.insurance.value === 'full' ? days * 18 : 0;
    const addons =
      (this.bookingForm.controls.gps.value ? days * 6 : 0) +
      (this.bookingForm.controls.child_seat.value ? days * 5 : 0) +
      (this.bookingForm.controls.additional_driver.value ? days * 12 : 0);
    const taxes = Math.round((base + insurance + addons) * 0.11 * 100) / 100;
    const total = Math.round((base + insurance + addons + taxes) * 100) / 100;
    this.price.set({ days, base, insurance, addons, taxes, total });
  }
}
