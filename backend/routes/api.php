<?php

use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\VehicleController as AdminVehicleController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\VehicleController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::middleware('throttle:10,1')->group(function (): void {
        Route::post('/auth/register', [AuthController::class, 'register']);
        Route::post('/auth/login', [AuthController::class, 'login']);
    });

    Route::get('/branches', [BranchController::class, 'index']);
    Route::get('/vehicles', [VehicleController::class, 'index']);
    Route::get('/vehicles/{vehicle}', [VehicleController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::get('/bookings/{booking}', [BookingController::class, 'show']);
        Route::get('/users/me/bookings', [BookingController::class, 'mine']);
        Route::post('/payments/charge', [PaymentController::class, 'charge']);

        Route::middleware('admin')->prefix('admin')->group(function (): void {
            Route::get('/vehicles', [AdminVehicleController::class, 'index']);
            Route::post('/vehicles', [AdminVehicleController::class, 'store']);
            Route::put('/vehicles/{vehicle}', [AdminVehicleController::class, 'update']);
            Route::get('/bookings', [AdminBookingController::class, 'index']);
        });
    });
});
