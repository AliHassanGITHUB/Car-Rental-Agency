<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingRequest;
use App\Models\Booking;
use App\Models\DriverDocument;
use App\Models\Vehicle;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    public function store(StoreBookingRequest $request): JsonResponse
    {
        $user = $request->user();
        $vehicle = Vehicle::query()
            ->where('status', 'available')
            ->availableBetween($request->validated('start_date'), $request->validated('end_date'))
            ->findOrFail($request->validated('vehicle_id'));

        $price = $this->calculatePrice($vehicle, $request->validated());

        $booking = DB::transaction(function () use ($request, $user, $vehicle, $price): Booking {
            DriverDocument::updateOrCreate(
                ['user_id' => $user->id, 'license_number' => $request->validated('license_number')],
                [
                    'license_expiry' => $request->validated('license_expiry'),
                    'document_url' => $request->validated('document_url'),
                ]
            );

            $booking = Booking::create([
                'user_id' => $user->id,
                'vehicle_id' => $vehicle->id,
                'pickup_branch_id' => $request->validated('pickup_branch_id'),
                'return_branch_id' => $request->validated('return_branch_id'),
                'start_date' => $request->validated('start_date'),
                'end_date' => $request->validated('end_date'),
                'status' => 'confirmed',
                'total_price' => $price['total'],
                'reference' => 'AD-'.Str::upper(Str::random(8)),
            ]);

            foreach ($this->addonsFromRequest($request->validated(), $price) as $addon) {
                $booking->addons()->create($addon);
            }

            return $booking->load(['vehicle', 'addons']);
        });

        return response()->json(['data' => $booking, 'price' => $price], 201);
    }

    public function show(Booking $booking): JsonResponse
    {
        abort_unless(auth()->id() === $booking->user_id || auth()->user()?->role === 'admin', 403);

        return response()->json(['data' => $booking->load(['vehicle', 'pickupBranch', 'returnBranch', 'addons', 'payment'])]);
    }

    public function mine(): JsonResponse
    {
        return response()->json([
            'data' => auth()->user()->bookings()->with(['vehicle', 'payment'])->latest()->get(),
        ]);
    }

    private function calculatePrice(Vehicle $vehicle, array $data): array
    {
        $start = CarbonImmutable::parse($data['start_date']);
        $end = CarbonImmutable::parse($data['end_date']);
        $days = max(1, $start->diffInDays($end, false));
        $base = $days * (float) $vehicle->daily_rate;
        $insurance = ($data['insurance'] ?? 'basic') === 'full' ? $days * 18 : 0;
        $addons = (($data['gps'] ?? false) ? $days * 6 : 0)
            + (($data['child_seat'] ?? false) ? $days * 5 : 0)
            + (($data['additional_driver'] ?? false) ? $days * 12 : 0);
        $taxes = round(($base + $insurance + $addons) * 0.11, 2);

        return [
            'days' => $days,
            'base' => round($base, 2),
            'insurance' => round($insurance, 2),
            'addons' => round($addons, 2),
            'taxes' => $taxes,
            'total' => round($base + $insurance + $addons + $taxes, 2),
        ];
    }

    private function addonsFromRequest(array $data, array $price): array
    {
        $addons = [];
        if (($data['insurance'] ?? 'basic') === 'full') {
            $addons[] = ['addon_type' => 'full_insurance', 'price' => $price['insurance']];
        }
        if ($data['gps'] ?? false) {
            $addons[] = ['addon_type' => 'gps', 'price' => $price['days'] * 6];
        }
        if ($data['child_seat'] ?? false) {
            $addons[] = ['addon_type' => 'child_seat', 'price' => $price['days'] * 5];
        }
        if ($data['additional_driver'] ?? false) {
            $addons[] = ['addon_type' => 'additional_driver', 'price' => $price['days'] * 12];
        }

        return $addons;
    }
}
