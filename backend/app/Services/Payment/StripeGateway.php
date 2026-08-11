<?php

namespace App\Services\Payment;

use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Refund;
use Stripe\Exception\ApiErrorException;

class StripeGateway implements PaymentGatewayInterface
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function charge(float $amount, string $currency, string $paymentMethodId, string $description): array
    {
        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => (int) ($amount * 100),
                'currency' => strtolower($currency),
                'payment_method' => $paymentMethodId,
                'description' => $description,
                'confirm' => true,
                'automatic_payment_methods' => [
                    'enabled' => true,
                    'allow_redirects' => 'never',
                ],
            ]);

            return [
                'success' => true,
                'provider_ref' => $paymentIntent->id,
                'status' => $paymentIntent->status === 'succeeded' ? 'completed' : 'pending',
            ];
        } catch (ApiErrorException $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function refund(string $providerRef, float $amount): array
    {
        try {
            $refund = Refund::create([
                'payment_intent' => $providerRef,
                'amount' => (int) ($amount * 100),
            ]);

            return [
                'success' => true,
                'refund_id' => $refund->id,
            ];
        } catch (ApiErrorException $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
