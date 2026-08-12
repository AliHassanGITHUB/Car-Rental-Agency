import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Booking } from '../../core/models';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './customer-dashboard.component.html',
  styleUrl: './customer-dashboard.component.scss'
})
export class CustomerDashboardComponent implements OnInit {
  bookings: Booking[] = [];

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.api.myBookings().subscribe((response) => {
      this.bookings = response.data;
    });
  }
}
