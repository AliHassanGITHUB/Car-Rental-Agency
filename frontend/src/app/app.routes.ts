import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/guards';
import { HomeComponent } from './pages/home/home.component';
import { FleetComponent } from './pages/fleet/fleet.component';
import { VehicleDetailComponent } from './pages/vehicle-detail/vehicle-detail.component';
import { BookingComponent } from './pages/booking/booking.component';
import { LoginComponent } from './pages/login/login.component';
import { CustomerDashboardComponent } from './pages/customer-dashboard/customer-dashboard.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { StaticPageComponent } from './pages/static-page/static-page.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'fleet', component: FleetComponent },
  { path: 'vehicles/:id', component: VehicleDetailComponent },
  { path: 'booking', component: BookingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: CustomerDashboardComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'about', component: StaticPageComponent, data: { page: 'about' } },
  { path: 'locations', component: StaticPageComponent, data: { page: 'locations' } },
  { path: 'terms', component: StaticPageComponent, data: { page: 'terms' } },
  { path: 'contact', component: StaticPageComponent, data: { page: 'contact' } },
  { path: '**', redirectTo: '' }
];
