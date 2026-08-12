<?php

namespace App\Services\Payments;

use App\Models\Booking;

interface PaymentGatewayInterface
{
    public function charge(Booking $booking, string $paymentMethod): PaymentResult;
}
