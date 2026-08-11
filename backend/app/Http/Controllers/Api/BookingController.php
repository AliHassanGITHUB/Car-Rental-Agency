<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateBookingRequest;
use App\Models\Booking;
use App\Models\BookingAddon;
use App\Models\Payment;
use App\Models\Vehicle;
use App\Services\Payment\PaymentGatewayInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(
        private PaymentGatewayInterface $paymentGateway,
    ) {}

    public function store(CreateBookingRequest $request): JsonResponse
    {
        $vehicle = Vehicle::findOrFail($request->vehicle_id);

        if (!$vehicle->isAvailableForDates($request->start_date, $request->end_date)) {
            return response()->json([
                'message' => 'Vehicle is not available for the selected dates.',
            ], 422);
        }

        $startDate = \Carbon\Carbon::parse($request->start_date);
        $endDate = \Carbon\Carbon::parse($request->end_date);
        $days = max(1, $startDate->diffInDays($endDate));
        $basePrice = (float) $vehicle->daily_rate * $days;

        $taxRate = 0.12;
        $taxAmount = round($basePrice * $taxRate, 2);

        $insuranceAmount = 0;
        $addonsData = [];

        if ($request->has('addons')) {
            $addonPrices = [
                'gps' => 10.00 * $days,
                'child_seat' => 15.00 * $days,
                'additional_driver' => 12.00 * $days,
                'full_insurance' => 25.00 * $days,
            ];

            foreach ($request->addons as $addon) {
                $price = $addonPrices[$addon['addon_type']] ?? 0;
                $addonsData[] = [
                    'addon_type' => $addon['addon_type'],
                    'price' => $price,
                ];
                if ($addon['addon_type'] === 'full_insurance') {
                    $insuranceAmount += $price;
                } else {
                    $basePrice += $price;
                }
            }
        }

        $totalPrice = round($basePrice + $taxAmount + $insuranceAmount, 2);

        $cancellationPolicy = "Free cancellation up to 48 hours before pickup. " .
            "50% refund for cancellations 24-48 hours before pickup. " .
            "No refund for cancellations less than 24 hours before pickup.";

        $booking = Booking::create([
            'user_id' => $request->user()->id,
            'vehicle_id' => $vehicle->id,
            'pickup_branch_id' => $request->pickup_branch_id,
            'return_branch_id' => $request->return_branch_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'status' => 'pending',
            'base_price' => $basePrice,
            'tax_amount' => $taxAmount,
            'insurance_amount' => $insuranceAmount,
            'total_price' => $totalPrice,
            'cancellation_policy' => $cancellationPolicy,
        ]);

        foreach ($addonsData as $addonData) {
            BookingAddon::create(array_merge($addonData, ['booking_id' => $booking->id]));
        }

        $paymentResult = $this->paymentGateway->charge(
            $totalPrice,
            'USD',
            $request->payment_method_id,
            "Booking {$booking->reference_number}"
        );

        if (!$paymentResult['success']) {
            $booking->update(['status' => 'cancelled']);
            return response()->json([
                'message' => 'Payment failed.',
                'error' => $paymentResult['error'] ?? 'Payment processing error.',
            ], 422);
        }

        Payment::create([
            'booking_id' => $booking->id,
            'amount' => $totalPrice,
            'currency' => 'USD',
            'provider_ref' => $paymentResult['provider_ref'],
            'status' => $paymentResult['status'],
        ]);

        $booking->update(['status' => 'confirmed']);
        $booking->load('vehicle', 'pickupBranch', 'returnBranch', 'addons', 'payment');

        return response()->json([
            'message' => 'Booking confirmed successfully.',
            'booking' => $booking,
        ], 201);
    }

    public function show(Request $request, Booking $booking): JsonResponse
    {
        if ($request->user()->role !== 'admin' && $booking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $booking->load('vehicle', 'pickupBranch', 'returnBranch', 'addons', 'payment', 'user');

        return response()->json($booking);
    }

    public function myBookings(Request $request): JsonResponse
    {
        $bookings = Booking::where('user_id', $request->user()->id)
            ->with('vehicle', 'pickupBranch')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($bookings);
    }

    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return response()->json([
                'message' => 'This booking cannot be cancelled.',
            ], 422);
        }

        $pickupTime = \Carbon\Carbon::parse($booking->start_date);
        $now = \Carbon\Carbon::now();
        $hoursUntilPickup = $now->diffInHours($pickupTime, false);

        $refundPercentage = 0;
        if ($hoursUntilPickup >= 48) {
            $refundPercentage = 1.0;
        } elseif ($hoursUntilPickup >= 24) {
            $refundPercentage = 0.5;
        }

        $booking->update(['status' => 'cancelled']);

        if ($refundPercentage > 0 && $booking->payment && $booking->payment->provider_ref) {
            $refundAmount = $booking->total_price * $refundPercentage;
            $this->paymentGateway->refund($booking->payment->provider_ref, $refundAmount);
            $booking->payment->update(['status' => 'refunded']);
        }

        return response()->json([
            'message' => 'Booking cancelled.',
            'refund_percentage' => $refundPercentage * 100,
        ]);
    }
}
