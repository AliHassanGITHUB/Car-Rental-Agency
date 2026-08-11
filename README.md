# Rental Car Agency

Full-stack web application for a car rental agency — customers can search, compare, and book vehicles online, while agency staff manage the fleet, pricing, and reservations through a back-office dashboard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 22, TypeScript, Angular Router, Reactive Forms |
| Backend | Laravel 13 (PHP), REST API, Sanctum Auth |
| Database | PostgreSQL 18 |
| Payments | Stripe (test mode) |
| Auth | Laravel Sanctum, token-based |

## Project Structure

```
├── backend/          # Laravel REST API
│   ├── app/
│   │   ├── Http/Controllers/Api/   # API controllers
│   │   ├── Http/Middleware/        # Admin middleware
│   │   ├── Models/                # Eloquent models
│   │   ├── Services/Payment/      # Stripe payment gateway
│   │   └── Providers/             # Service providers
│   ├── config/                    # CORS, Sanctum config
│   ├── database/migrations/       # DB schema
│   └── routes/api.php             # API routes
└── frontend/         # Angular SPA
    └── src/app/
        ├── guards/                # Auth, admin, guest guards
        ├── interceptors/          # JWT auth interceptor
        ├── models/                # TypeScript interfaces
        ├── pages/                 # All page components
        │   ├── landing/           # Home page with search bar
        │   ├── fleet/             # Vehicle listing with filters
        │   ├── vehicle-detail/    # Vehicle info + reviews
        │   ├── booking/           # Checkout flow
        │   ├── booking-summary/   # Confirmation page
        │   ├── login/             # Login page
        │   ├── register/          # Registration page
        │   ├── dashboard/         # Customer dashboard
        │   └── admin/             # Admin dashboard + management
        └── services/              # API service layer
```

## Prerequisites

- PHP 8.2+ with required extensions (pgsql, mbstring, openssl, etc.)
- Composer 2.x
- Node.js 18+ and npm
- PostgreSQL 14+
- Angular CLI 22+

## Setup Instructions

### 1. Backend (Laravel API)

```bash
cd backend

# Install PHP dependencies
composer install

# Copy environment file and configure
cp .env.example .env

# Edit .env with your PostgreSQL credentials:
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=rental_car_agency
# DB_USERNAME=your_postgres_user
# DB_PASSWORD=your_postgres_password
#
# Stripe test keys:
# STRIPE_KEY=pk_test_your_key
# STRIPE_SECRET=sk_test_your_key

# Generate application key
php artisan key:generate

# Create PostgreSQL database (if not exists)
createdb -U postgres rental_car_agency

# Run migrations and seed data
php artisan migrate --seed

# Start the API server
php artisan serve --port=8000
```

The API will be available at `http://localhost:8000/api/v1/`.

### 2. Frontend (Angular App)

```bash
cd frontend

# Install npm dependencies
npm install

# Start the development server
ng serve
```

The frontend will be available at `http://localhost:4200`.

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rentalcaragency.com | password |
| Customer | john@example.com | password |

## API Endpoints

### Public
- `GET  /api/v1/vehicles` — Search and filter vehicles
- `GET  /api/v1/vehicles/{id}` — Vehicle details
- `POST /api/v1/auth/register` — Register new account
- `POST /api/v1/auth/login` — Login

### Authenticated
- `POST /api/v1/auth/logout` — Logout
- `GET  /api/v1/auth/me` — Current user profile
- `POST /api/v1/bookings` — Create booking with payment
- `GET  /api/v1/bookings/{id}` — Booking details
- `GET  /api/v1/users/me/bookings` — User's bookings
- `POST /api/v1/bookings/{id}/cancel` — Cancel booking

### Admin (role: admin)
- `GET  /api/v1/admin/dashboard` — Dashboard stats
- `GET  /api/v1/admin/vehicles` — List all vehicles
- `POST /api/v1/admin/vehicles` — Create vehicle
- `PUT  /api/v1/admin/vehicles/{id}` — Update vehicle
- `DELETE /api/v1/admin/vehicles/{id}` — Delete vehicle
- `GET  /api/v1/admin/bookings` — List all bookings
- `PUT  /api/v1/admin/bookings/{id}/status` — Update booking status
- `GET  /api/v1/admin/branches` — List branches

## Features

### Customer-Facing
- Landing page with single-screen search bar
- Fleet listing with live filtering (category, transmission, seats, price, branch)
- Vehicle detail page with specs, reviews, and pricing
- Complete booking flow: dates, branches, add-ons, driver verification, payment
- Live price breakdown shown before payment commitment
- Cancellation policy visible before checkout
- Customer dashboard with booking history

### Admin Dashboard
- Overview with key metrics (revenue, utilization, active bookings)
- Vehicle CRUD management
- Booking management with status workflow (pending → confirmed → picked_up → returned)
- Branch management

### Booking Status Workflow
```
pending → confirmed → picked_up → returned
   ↓          ↓
cancelled  cancelled
```

## Database Schema

- `users` — User accounts with roles (customer/admin)
- `vehicles` — Vehicle inventory with categories and pricing
- `branches` — Rental locations with geolocation
- `bookings` — Reservations with pricing breakdown
- `booking_addons` — Optional add-ons per booking
- `payments` — Payment records with Stripe references
- `driver_documents` — License verification documents
- `reviews` — Vehicle reviews and ratings

## Environment Variables

### Backend (.env)
```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=rental_car_agency
DB_USERNAME=postgres
DB_PASSWORD=your_password

STRIPE_KEY=pk_test_xxx
STRIPE_SECRET=sk_test_xxx

FRONTEND_URL=http://localhost:4200
```

## CORS Configuration

CORS is configured in `backend/config/cors.php` to allow `http://localhost:4200` as an allowed origin with credentials support enabled.

## License

This project is for educational purposes.
