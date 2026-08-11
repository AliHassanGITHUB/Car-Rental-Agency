<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Vehicle::with('branch')->where('status', 'available');

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('transmission')) {
            $query->where('transmission', $request->transmission);
        }

        if ($request->filled('seats')) {
            $query->where('seats', '>=', $request->seats);
        }

        if ($request->filled('min_price')) {
            $query->where('daily_rate', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('daily_rate', '<=', $request->max_price);
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $startDate = $request->start_date;
            $endDate = $request->end_date;
            $query->whereDoesntHave('bookings', function ($q) use ($startDate, $endDate) {
                $q->whereIn('status', ['pending', 'confirmed', 'picked_up'])
                    ->where(function ($q2) use ($startDate, $endDate) {
                        $q2->whereBetween('start_date', [$startDate, $endDate])
                            ->orWhereBetween('end_date', [$startDate, $endDate])
                            ->orWhere(function ($q3) use ($startDate, $endDate) {
                                $q3->where('start_date', '<=', $startDate)
                                    ->where('end_date', '>=', $endDate);
                            });
                    });
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('make', 'ilike', "%{$search}%")
                    ->orWhere('model', 'ilike', "%{$search}%")
                    ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        $vehicles = $query->orderBy('daily_rate')->paginate($request->get('per_page', 12));

        $vehicles->getCollection()->transform(function ($vehicle) {
            $vehicle->average_rating = $vehicle->averageRating();
            $vehicle->review_count = $vehicle->reviews()->count();
            return $vehicle;
        });

        return response()->json($vehicles);
    }

    public function show(Vehicle $vehicle): JsonResponse
    {
        $vehicle->load('branch', 'reviews.user');
        $vehicle->average_rating = $vehicle->averageRating();
        $vehicle->review_count = $vehicle->reviews()->count();

        return response()->json($vehicle);
    }
}
