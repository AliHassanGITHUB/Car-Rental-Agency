# Car Rental Agency

Full-stack car rental platform with an Angular customer/admin frontend and a Laravel REST API.

## Apps

- `frontend/` - Angular customer site and role-protected admin dashboard
- `backend/` - Laravel API under `/api/v1`

## Local Ports

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:8000`

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

Create `frontend/src/environments/environment.ts` if you need to override defaults:

```ts
export const environment = {
  apiUrl: 'http://localhost:8000/api/v1'
};
```

## Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

Required backend environment variables:

```dotenv
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:4200
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=car_rental
DB_USERNAME=postgres
DB_PASSWORD=secret
STRIPE_KEY=pk_test_replace_me
STRIPE_SECRET=sk_test_replace_me
STRIPE_CURRENCY=usd
```

Seeded admin account:

- Email: `admin@rental.test`
- Password: `password`

## API Highlights

- `GET /api/v1/vehicles`
- `GET /api/v1/vehicles/{vehicle}`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/bookings`
- `GET /api/v1/users/me/bookings`
- `POST /api/v1/payments/charge`
- `GET /api/v1/admin/vehicles`
- `POST /api/v1/admin/vehicles`
- `PUT /api/v1/admin/vehicles/{vehicle}`
- `GET /api/v1/admin/bookings`

## Design Notes

The interface borrows the source portfolio's design language: clean Geist-style typography, cyan trust accents, compact translucent surfaces, dotted page texture, restrained red highlights, rounded-but-sharp controls, and airy content bands.
