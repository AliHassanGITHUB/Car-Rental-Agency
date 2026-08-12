<?php

namespace App\Services\Payments;

use App\Models\Booking;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class StripePaymentGateway implements PaymentGatewayInterface
{
    public function charge(Booking $booking, string $paymentMethod): PaymentResult
    {
        Stripe::setApiKey((string) config('services.stripe.secret'));

        $intent = PaymentIntent::create([
            'amount' => (int) round((float) $booking->total_price * 100),
            'currency' => config('services.stripe.currency', 'usd'),
            'payment_method' => $paymentMethod,
            'confirm' => true,
            'automatic_payment_methods' => [
                'enabled' => true,
                'allow_redirects' => 'never',
            ],
            'metadata' => [
                'booking_id' => $booking->id,
                'reference' => $booking->reference,
            ],
        ]);

        return new PaymentResult($intent->id, $intent->status);
    }
}
