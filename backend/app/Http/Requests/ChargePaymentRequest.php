<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChargePaymentRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'booking_id' => ['required', 'exists:bookings,id'],
            'payment_method' => ['required', 'string', 'max:255'],
        ];
    }
}
