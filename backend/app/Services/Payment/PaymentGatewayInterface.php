<?php

namespace App\Services\Payment;

interface PaymentGatewayInterface
{
    public function charge(float $amount, string $currency, string $paymentMethodId, string $description): array;

    public function refund(string $providerRef, float $amount): array;
}
