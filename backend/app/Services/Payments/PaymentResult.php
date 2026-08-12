<?php

namespace App\Services\Payments;

class PaymentResult
{
    public function __construct(
        public readonly string $providerRef,
        public readonly string $status,
    ) {
    }
}
