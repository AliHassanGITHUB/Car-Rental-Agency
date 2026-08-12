import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Booking, Vehicle } from '../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);

  vehicles = signal<Vehicle[]>([]);
  bookings = signal<Booking[]>([]);
  saved = signal(false);

  readonly vehicleForm = this.fb.nonNullable.group({
    id: [''],
    make: ['', Validators.required],
    model: ['', Validators.required],
    year: [2026, Validators.required],
    category: ['economy', Validators.required],
    transmission: ['automatic', Validators.required],
    seats: [5, Validators.required],
    daily_rate: [82, Validators.required],
    status: ['available', Validators.required],
    branch_id: [1, Validators.required],
    image_url: ['']
  });

  ngOnInit(): void {
    this.refresh();
  }

  edit(vehicle: Vehicle): void {
    this.vehicleForm.patchValue({ ...vehicle, id: String(vehicle.id) });
  }

  save(): void {
    const raw = this.vehicleForm.getRawValue();
    const payload = {
      ...raw,
      id: raw.id ? Number(raw.id) : undefined
    } as Partial<Vehicle>;

    this.api.saveAdminVehicle(payload).subscribe(() => {
      this.saved.set(true);
      this.vehicleForm.reset({
        id: '',
        make: '',
        model: '',
        year: 2026,
        category: 'economy',
        transmission: 'automatic',
        seats: 5,
        daily_rate: 82,
        status: 'available',
        branch_id: 1,
        image_url: ''
      });
      this.refresh();
    });
  }

  private refresh(): void {
    this.api.adminVehicles().subscribe((response) => this.vehicles.set(response.data));
    this.api.adminBookings().subscribe((response) => this.bookings.set(response.data));
  }
}
