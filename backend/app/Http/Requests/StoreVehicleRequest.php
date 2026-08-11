<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'make' => ['required', 'string', 'max:100'],
            'model' => ['required', 'string', 'max:100'],
            'year' => ['required', 'integer', 'min:2000', 'max:' . (date('Y') + 1)],
            'category' => ['required', 'in:economy,compact,midsize,suv,luxury,van'],
            'transmission' => ['required', 'in:automatic,manual'],
            'seats' => ['required', 'integer', 'min:2', 'max:15'],
            'daily_rate' => ['required', 'numeric', 'min:0'],
            'branch_id' => ['required', 'exists:branches,id'],
            'color' => ['nullable', 'string', 'max:50'],
            'license_plate' => ['nullable', 'string', 'max:20'],
            'mileage_included' => ['nullable', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'url'],
        ];
    }
}
