import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly searchForm = this.fb.nonNullable.group({
    pickup_location: ['Airport Terminal', Validators.required],
    pickup_at: ['2026-08-15T09:00', Validators.required],
    return_at: ['2026-08-18T18:00', Validators.required],
    category: ['']
  });

  readonly trustSignals = [
    'Free cancellation up to 24 hours before pickup',
    'Itemized pricing before payment',
    'License verification before handoff'
  ];

  search(): void {
    this.router.navigate(['/fleet'], { queryParams: this.searchForm.getRawValue() });
  }
}
