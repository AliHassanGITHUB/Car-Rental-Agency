<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\VehicleController;
use Illuminate\Support\Facades\Route;

Route::post('/v1/auth/register', [AuthController::class, 'register']);
Route::post('/v1/auth/login', [AuthController::class, 'login']);

Route::get('/v1/vehicles', [VehicleController::class, 'index']);
Route::get('/v1/vehicles/{vehicle}', [VehicleController::class, 'show']);
Route::get('/v1/vehicles/{vehicle}/reviews', [ReviewController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/v1/auth/logout', [AuthController::class, 'logout']);
    Route::get('/v1/auth/me', [AuthController::class, 'me']);

    Route::post('/v1/bookings', [BookingController::class, 'store']);
    Route::get('/v1/bookings/{booking}', [BookingController::class, 'show']);
    Route::get('/v1/users/me/bookings', [BookingController::class, 'myBookings']);
    Route::post('/v1/bookings/{booking}/cancel', [BookingController::class, 'cancel']);

    Route::post('/v1/vehicles/{vehicle}/reviews', [ReviewController::class, 'store']);

    Route::middleware('admin')->prefix('v1/admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/vehicles', [AdminController::class, 'vehicles']);
        Route::post('/vehicles', [AdminController::class, 'storeVehicle']);
        Route::put('/vehicles/{vehicle}', [AdminController::class, 'updateVehicle']);
        Route::delete('/vehicles/{vehicle}', [AdminController::class, 'destroyVehicle']);
        Route::get('/bookings', [AdminController::class, 'bookings']);
        Route::put('/bookings/{booking}/status', [AdminController::class, 'updateBookingStatus']);
        Route::get('/branches', [AdminController::class, 'branches']);
    });
});
