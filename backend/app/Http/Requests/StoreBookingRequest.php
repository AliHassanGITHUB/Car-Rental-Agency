<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'pickup_branch_id' => ['required', 'exists:branches,id'],
            'return_branch_id' => ['required', 'exists:branches,id'],
            'start_date' => ['required', 'date', 'after_or_equal:now'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'renter_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:40'],
            'license_number' => ['required', 'string', 'max:80'],
            'license_expiry' => ['required', 'date', 'after:end_date'],
            'document_url' => ['required', 'url', 'max:2048'],
            'insurance' => ['nullable', 'in:basic,full'],
            'gps' => ['boolean'],
            'child_seat' => ['boolean'],
            'additional_driver' => ['boolean'],
            'accept_policy' => ['accepted'],
        ];
    }
}
