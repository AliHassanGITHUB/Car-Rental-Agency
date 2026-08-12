<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $vehicles = Vehicle::query()
            ->with(['branch'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->where('status', 'available')
            ->when($request->query('category'), fn (Builder $query, string $category) => $query->where('category', $category))
            ->when($request->query('transmission'), fn (Builder $query, string $transmission) => $query->where('transmission', $transmission))
            ->when($request->query('seats'), fn (Builder $query, string $seats) => $query->where('seats', '>=', (int) $seats))
            ->when($request->query('min_price'), fn (Builder $query, string $price) => $query->where('daily_rate', '>=', (float) $price))
            ->when($request->query('max_price'), fn (Builder $query, string $price) => $query->where('daily_rate', '<=', (float) $price))
            ->when($request->query('pickup_location'), function (Builder $query, string $location): void {
                $query->whereHas('branch', function (Builder $branchQuery) use ($location): void {
                    $branchQuery->where('name', 'ilike', "%{$location}%")
                        ->orWhere('city', 'ilike', "%{$location}%");
                });
            })
            ->availableBetween($request->query('pickup_at'), $request->query('return_at'))
            ->orderBy('daily_rate')
            ->paginate(12);

        $vehicles->getCollection()->transform(function (Vehicle $vehicle): Vehicle {
            $vehicle->rating = round((float) ($vehicle->reviews_avg_rating ?? 4.8), 1);
            $vehicle->available = true;
            return $vehicle;
        });

        return response()->json($vehicles);
    }

    public function show(Vehicle $vehicle): JsonResponse
    {
        $vehicle->load(['branch', 'reviews.user'])->loadAvg('reviews', 'rating')->loadCount('reviews');
        $vehicle->rating = round((float) ($vehicle->reviews_avg_rating ?? 4.8), 1);

        return response()->json(['data' => $vehicle]);
    }
}
