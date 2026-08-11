<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'pickup_branch_id' => ['required', 'exists:branches,id'],
            'return_branch_id' => ['required', 'exists:branches,id'],
            'start_date' => ['required', 'date', 'after:now'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'addons' => ['sometimes', 'array'],
            'addons.*.addon_type' => ['required_with:addons', 'in:gps,child_seat,additional_driver,full_insurance'],
            'payment_method_id' => ['required', 'string'],
        ];
    }
}
