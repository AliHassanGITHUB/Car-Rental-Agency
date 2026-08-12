<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Review;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@rental.test'],
            [
                'name' => 'Aster Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '+1 555 0101',
            ]
        );

        $customer = User::updateOrCreate(
            ['email' => 'customer@rental.test'],
            [
                'name' => 'Maya Stone',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'phone' => '+1 555 0102',
            ]
        );

        $branches = collect([
            ['name' => 'Airport Terminal', 'address' => '100 Arrivals Loop', 'city' => 'Metro City', 'lat' => 40.6413000, 'lng' => -73.7781000],
            ['name' => 'Downtown Hub', 'address' => '24 Market Street', 'city' => 'Metro City', 'lat' => 40.7128000, 'lng' => -74.0060000],
            ['name' => 'Marina Branch', 'address' => '8 Harbor Road', 'city' => 'Bayview', 'lat' => 40.7001000, 'lng' => -74.0122000],
        ])->map(fn (array $branch) => Branch::updateOrCreate(['name' => $branch['name']], $branch));

        $vehicles = [
            ['make' => 'Toyota', 'model' => 'Corolla', 'year' => 2026, 'category' => 'economy', 'transmission' => 'automatic', 'seats' => 5, 'daily_rate' => 58, 'status' => 'available', 'branch_id' => $branches[0]->id, 'included_mileage' => 250, 'image_url' => 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80'],
            ['make' => 'Hyundai', 'model' => 'Tucson', 'year' => 2026, 'category' => 'suv', 'transmission' => 'automatic', 'seats' => 5, 'daily_rate' => 92, 'status' => 'available', 'branch_id' => $branches[1]->id, 'included_mileage' => 300, 'image_url' => 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80'],
            ['make' => 'BMW', 'model' => '5 Series', 'year' => 2025, 'category' => 'luxury', 'transmission' => 'automatic', 'seats' => 5, 'daily_rate' => 168, 'status' => 'available', 'branch_id' => $branches[2]->id, 'included_mileage' => 220, 'image_url' => 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80'],
            ['make' => 'Jeep', 'model' => 'Grand Cherokee', 'year' => 2025, 'category' => 'suv', 'transmission' => 'automatic', 'seats' => 5, 'daily_rate' => 128, 'status' => 'maintenance', 'branch_id' => $branches[0]->id, 'included_mileage' => 260, 'image_url' => 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80'],
        ];

        foreach ($vehicles as $vehicleData) {
            $vehicle = Vehicle::updateOrCreate(
                ['make' => $vehicleData['make'], 'model' => $vehicleData['model'], 'year' => $vehicleData['year']],
                $vehicleData
            );

            Review::updateOrCreate(
                ['vehicle_id' => $vehicle->id, 'user_id' => $customer->id],
                ['rating' => 5, 'comment' => 'Clean pickup, clear invoice, and easy return.']
            );
        }

        $admin->reviews()->firstOrCreate([
            'vehicle_id' => Vehicle::first()->id,
        ], [
            'rating' => 4,
            'comment' => 'Reliable branch favorite for same-day bookings.',
        ]);
    }
}
