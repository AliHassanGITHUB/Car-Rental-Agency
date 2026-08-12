import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Vehicle } from '../../core/models';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './vehicle-detail.component.html',
  styleUrl: './vehicle-detail.component.scss'
})
export class VehicleDetailComponent implements OnInit {
  vehicle?: Vehicle;

  constructor(private readonly route: ActivatedRoute, private readonly api: ApiService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.getVehicle(id).subscribe((response) => {
        this.vehicle = response.data;
      });
    }
  }
}
