<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChargePaymentRequest;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\Payments\PaymentGatewayInterface;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentGatewayInterface $gateway)
    {
    }

    public function charge(ChargePaymentRequest $request): JsonResponse
    {
        $booking = Booking::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($request->validated('booking_id'));

        $result = $this->gateway->charge($booking, $request->validated('payment_method'));

        Payment::updateOrCreate(
            ['booking_id' => $booking->id],
            [
                'amount' => $booking->total_price,
                'currency' => config('services.stripe.currency', 'usd'),
                'provider_ref' => $result->providerRef,
                'status' => $result->status,
            ]
        );

        $booking->update(['status' => $result->status === 'succeeded' ? 'paid' : 'confirmed']);

        return response()->json([
            'message' => 'Payment processed.',
            'provider_ref' => $result->providerRef,
            'status' => $result->status,
        ]);
    }
}
