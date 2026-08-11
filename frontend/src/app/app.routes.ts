import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'fleet', loadComponent: () => import('./pages/fleet/fleet.component').then(m => m.FleetComponent) },
  { path: 'vehicle/:id', loadComponent: () => import('./pages/vehicle-detail/vehicle-detail.component').then(m => m.VehicleDetailComponent) },
  { path: 'booking/:vehicleId', loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent), canActivate: [authGuard] },
  { path: 'booking-summary/:id', loadComponent: () => import('./pages/booking-summary/booking-summary.component').then(m => m.BookingSummaryComponent), canActivate: [authGuard] },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent), canActivate: [guestGuard] },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent), canActivate: [guestGuard] },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'admin', loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent), canActivate: [adminGuard] },
  { path: 'admin/vehicles', loadComponent: () => import('./pages/admin/admin-vehicles/admin-vehicles.component').then(m => m.AdminVehiclesComponent), canActivate: [adminGuard] },
  { path: 'admin/bookings', loadComponent: () => import('./pages/admin/admin-bookings/admin-bookings.component').then(m => m.AdminBookingsComponent), canActivate: [adminGuard] },
  { path: '**', redirectTo: '' },
];
