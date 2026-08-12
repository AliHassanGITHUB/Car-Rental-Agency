<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VehicleRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'make' => ['required', 'string', 'max:120'],
            'model' => ['required', 'string', 'max:120'],
            'year' => ['required', 'integer', 'between:1990,2035'],
            'category' => ['required', 'in:economy,suv,luxury'],
            'transmission' => ['required', 'in:automatic,manual'],
            'seats' => ['required', 'integer', 'between:2,12'],
            'daily_rate' => ['required', 'numeric', 'min:1'],
            'status' => ['required', 'in:available,maintenance,retired'],
            'branch_id' => ['required', 'exists:branches,id'],
            'image_url' => ['nullable', 'url', 'max:2048'],
            'included_mileage' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
