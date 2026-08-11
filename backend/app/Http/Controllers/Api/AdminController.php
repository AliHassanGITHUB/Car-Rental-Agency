<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\Branch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $totalVehicles = Vehicle::count();
        $availableVehicles = Vehicle::where('status', 'available')->count();
        $totalBranches = Branch::count();

        $totalBookings = \App\Models\Booking::count();
        $activeBookings = \App\Models\Booking::whereIn('status', ['pending', 'confirmed', 'picked_up'])->count();
        $revenue = \App\Models\Booking::where('status', 'confirmed')->sum('total_price');
        $monthlyRevenue = \App\Models\Booking::where('status', 'confirmed')
            ->where('created_at', '>=', now()->startOfMonth())
            ->sum('total_price');

        $bookingsByCategory = Vehicle::select('category')
            ->selectRaw('count(*) as count')
            ->groupBy('category')
            ->pluck('count', 'category');

        $recentBookings = \App\Models\Booking::with('user', 'vehicle')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $utilization = $totalVehicles > 0
            ? round(($activeBookings / $totalVehicles) * 100, 1)
            : 0;

        return response()->json([
            'total_vehicles' => $totalVehicles,
            'available_vehicles' => $availableVehicles,
            'total_branches' => $totalBranches,
            'total_bookings' => $totalBookings,
            'active_bookings' => $activeBookings,
            'total_revenue' => $revenue,
            'monthly_revenue' => $monthlyRevenue,
            'utilization_rate' => $utilization,
            'bookings_by_category' => $bookingsByCategory,
            'recent_bookings' => $recentBookings,
        ]);
    }

    public function vehicles(Request $request): JsonResponse
    {
        $vehicles = Vehicle::with('branch')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($vehicles);
    }

    public function storeVehicle(\App\Http\Requests\StoreVehicleRequest $request): JsonResponse
    {
        $vehicle = Vehicle::create($request->validated());

        return response()->json($vehicle, 201);
    }

    public function updateVehicle(\App\Http\Requests\StoreVehicleRequest $request, Vehicle $vehicle): JsonResponse
    {
        $vehicle->update($request->validated());

        return response()->json($vehicle);
    }

    public function destroyVehicle(Vehicle $vehicle): JsonResponse
    {
        $hasActiveBookings = $vehicle->bookings()
            ->whereIn('status', ['pending', 'confirmed', 'picked_up'])
            ->exists();

        if ($hasActiveBookings) {
            return response()->json([
                'message' => 'Cannot delete vehicle with active bookings.',
            ], 422);
        }

        $vehicle->delete();

        return response()->json(['message' => 'Vehicle deleted.']);
    }

    public function bookings(Request $request): JsonResponse
    {
        $query = \App\Models\Booking::with('user', 'vehicle', 'pickupBranch');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'ilike', "%{$search}%")
                    ->orWhereHas('user', function ($q2) use ($search) {
                        $q2->where('name', 'ilike', "%{$search}%")
                            ->orWhere('email', 'ilike', "%{$search}%");
                    });
            });
        }

        $bookings = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($bookings);
    }

    public function updateBookingStatus(Request $request, \App\Models\Booking $booking): JsonResponse
    {
        $validTransitions = [
            'pending' => ['confirmed', 'cancelled'],
            'confirmed' => ['picked_up', 'cancelled'],
            'picked_up' => ['returned'],
        ];

        $newStatus = $request->status;

        if (!isset($validTransitions[$booking->status]) || !in_array($newStatus, $validTransitions[$booking->status])) {
            return response()->json([
                'message' => "Cannot transition from '{$booking->status}' to '{$newStatus}'.",
            ], 422);
        }

        $booking->update(['status' => $newStatus]);

        return response()->json([
            'message' => "Booking status updated to '{$newStatus}'.",
            'booking' => $booking->load('user', 'vehicle'),
        ]);
    }

    public function branches(Request $request): JsonResponse
    {
        return response()->json(Branch::withCount('vehicles')->get());
    }
}
