<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\Review;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@rentalcaragency.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '+1-555-0100',
        ]);

        $customer = User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'phone' => '+1-555-0200',
        ]);

        $branches = [
            Branch::create(['name' => 'Downtown', 'address' => '123 Main St', 'city' => 'New York', 'lat' => 40.7128, 'lng' => -74.0060]),
            Branch::create(['name' => 'Airport', 'address' => '456 Terminal Blvd', 'city' => 'New York', 'lat' => 40.6413, 'lng' => -73.7781]),
            Branch::create(['name' => 'Beachside', 'address' => '789 Ocean Ave', 'city' => 'Miami', 'lat' => 25.7617, 'lng' => -80.1918]),
        ];

        $vehicles = [
            ['make' => 'Toyota', 'model' => 'Corolla', 'year' => 2024, 'category' => 'economy', 'transmission' => 'automatic', 'seats' => 5, 'daily_rate' => 35.00, 'color' => 'White', 'license_plate' => 'NYC-1001', 'description' => 'Fuel-efficient compact sedan, perfect for city driving.'],
            ['make' => 'Honda', 'model' => 'Civic', 'year' => 2024, 'category' => 'economy', 'transmission' => 'automatic', 'seats' => 5, 'daily_rate' => 38.00, 'color' => 'Blue', 'license_plate' => 'NYC-1002', 'description' => 'Reliable and comfortable with excellent fuel economy.'],
            ['make' => 'Hyundai', 'model' => 'Elantra', 'year' => 2023, 'category' => 'economy', 'transmission' => 'automatic', 'seats' => 5, 'daily_rate' => 32.00, 'color' => 'Silver', 'license_plate' => 'NYC-1003', 'description' => 'Modern features at an affordable rate.'],
            ['make' => 'Ford', 'model' => 'Focus', 'year' => 2023, 'category' => 'compact', 'transmission' => 'automatic', 'seats' => 5, 'daily_rate' => 42.00, 'color' => 'Red', 'license_plate' => 'NYC-2001', 'description' => 'Peppy and fun-to-drive compact with tech features.'],
            ['make' => 'Volkswagen', 'model' => 'Jetta', 'year' => 2024, 'category' => 'compact', 'transmission' => 'automatic', 'seats' => 5, 'daily_rate' => 45.00, 'color' => 'Gray', 'license_plate' => 'NYC-2002', 'description' => 'German engineering with a smooth ride.'],
            ['make' => 'Toyota', 'model' => 'Camry', 'year' => 2024, 'category' => 'midsize', 'transmission' => 'automatic', 'seats' => 5, 'daily_rate' => 55.00, 'color' => 'Black', 'license_plate' => 'NYC-3001', 'description' => 'Spacious and refined midsize sedan.'],
            ['make' => 'Honda', 'model' => 'Accord', 'year' => 2024, 'category' => 'midsize', 'transmission' => 'automatic', 'seats' => 5, 'daily_rate' => 58.00, 'color' => 'White', 'license_plate' => 'NYC-3002', 'description' => 'Award-winning comfort and reliability.'],
            ['make' => 'Nissan', 'model' => 'Altima', 'year' => 2023, 'category' => 'midsize', 'transmission' => 'automatic', 'seats' => 5, 'daily_rate' => 50.00, 'color' => 'Navy', 'license_plate' => 'NYC-3003', 'description' => 'Stylish sedan with advanced safety features.'],
            ['make' => 'Toyota', 'model' => 'RAV4', 'year' => 2024, 'category' => 'suv', 'transmission' => 'automatic', 'seats' => 5, 'daily_rate' => 65.00, 'color' => 'Green', 'license_plate' => 'NYC-4001', 'description' => 'Versatile SUV with excellent cargo space.'],
            ['make' => 'Ford', 'model' => 'Explorer', 'year' => 2024, 'category' => 'suv', 'transmission' => 'automatic', 'seats' => 7, 'daily_rate' => 80.00, 'color' => 'Black', 'license_plate' => 'NYC-4002', 'description' => 'Family-friendly 3-row SUV with power.'],
            ['make' => 'Jeep', 'model' => 'Grand Cherokee', 'year' => 2023, 'category' => 'suv', 'transmission' => 'automatic', 'seats' => 5, 'daily_rate' => 85.00, 'color' => 'Red', 'license_plate' => 'NYC-4003', 'description' => 'Capability meets luxury in this premium SUV.'],
            ['make' => 'Chevrolet', 'model' => 'Suburban', 'year' => 2024, 'category' => 'suv', 'transmission' => 'automatic', 'seats' => 8, 'daily_rate' => 95.00, 'color' => 'Silver', 'license_plate' => 'NYC-4004', 'description' => 'Full-size SUV for large families or groups.'],
            ['make' => 'Mercedes-Benz', 'model' => 'E-Class', 'year' => 2024, 'category' => 'luxury', 'transmission' => 'automatic', 'seats' => 5, 'daily_rate' => 120.00, 'color' => 'Black', 'license_plate' => 'NYC-5001', 'description' => 'Uncompromising luxury and cutting-edge technology.'],
            ['make' => 'BMW', 'model' => '5 Series', 'year' => 2024, 'category' => 'luxury', 'transmission' => 'automatic', 'seats' => 5, 'daily_rate' => 115.00, 'color' => 'White', 'license_plate' => 'NYC-5002', 'description' => 'Dynamic performance with premium comfort.'],
            ['make' => 'Audi', 'model' => 'A6', 'year' => 2023, 'category' => 'luxury', 'transmission' => 'automatic', 'seats' => 5, 'daily_rate' => 110.00, 'color' => 'Gray', 'license_plate' => 'NYC-5003', 'description' => 'Refined elegance with Quattro all-wheel drive.'],
            ['make' => 'Tesla', 'model' => 'Model S', 'year' => 2024, 'category' => 'luxury', 'transmission' => 'automatic', 'seats' => 5, 'daily_rate' => 130.00, 'color' => 'Red', 'license_plate' => 'NYC-5004', 'description' => 'All-electric luxury with incredible range and performance.'],
            ['make' => 'Chrysler', 'model' => 'Pacifica', 'year' => 2024, 'category' => 'van', 'transmission' => 'automatic', 'seats' => 8, 'daily_rate' => 75.00, 'color' => 'White', 'license_plate' => 'NYC-6001', 'description' => 'The ultimate family hauler with Stow n Go seats.'],
            ['make' => 'Ford', 'model' => 'Transit', 'year' => 2023, 'category' => 'van', 'transmission' => 'automatic', 'seats' => 12, 'daily_rate' => 90.00, 'color' => 'White', 'license_plate' => 'NYC-6002', 'description' => 'Spacious passenger van for groups and events.'],
        ];

        foreach ($vehicles as $index => $data) {
            $branchIndex = $index % count($branches);
            Vehicle::create(array_merge($data, ['branch_id' => $branches[$branchIndex]->id]));
        }

        Review::create([
            'vehicle_id' => 1,
            'user_id' => $customer->id,
            'rating' => 5,
            'comment' => 'Great car! Smooth ride and excellent gas mileage.',
        ]);

        Review::create([
            'vehicle_id' => 6,
            'user_id' => $customer->id,
            'rating' => 4,
            'comment' => 'Comfortable and spacious. Perfect for business trips.',
        ]);

        Review::create([
            'vehicle_id' => 9,
            'user_id' => $customer->id,
            'rating' => 5,
            'comment' => 'Best SUV I have ever driven. Highly recommend!',
        ]);
    }
}
