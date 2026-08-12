import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { debounceTime, startWith, switchMap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Vehicle } from '../../core/models';

@Component({
  selector: 'app-fleet',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './fleet.component.html',
  styleUrl: './fleet.component.scss'
})
export class FleetComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  vehicles: Vehicle[] = [];
  loading = true;

  readonly filters = this.fb.nonNullable.group({
    pickup_location: [''],
    pickup_at: [''],
    return_at: [''],
    category: [''],
    transmission: [''],
    seats: [''],
    min_price: [''],
    max_price: ['']
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.filters.patchValue({
        pickup_location: params.get('pickup_location') ?? '',
        pickup_at: params.get('pickup_at') ?? '',
        return_at: params.get('return_at') ?? '',
        category: params.get('category') ?? ''
      }, { emitEvent: true });
    });

    this.filters.valueChanges.pipe(
      startWith(this.filters.getRawValue()),
      debounceTime(180),
      switchMap((value) => {
        this.loading = true;
        return this.api.getVehicles(value);
      })
    ).subscribe({
      next: (response) => {
        this.vehicles = response.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
