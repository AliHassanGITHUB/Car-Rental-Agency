<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    protected $fillable = [
        'make', 'model', 'year', 'category', 'transmission',
        'seats', 'daily_rate', 'status', 'branch_id', 'color',
        'license_plate', 'mileage_included', 'description', 'image_url',
    ];

    protected function casts(): array
    {
        return [
            'daily_rate' => 'decimal:2',
            'year' => 'integer',
            'seats' => 'integer',
            'mileage_included' => 'integer',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function averageRating(): float
    {
        return round($this->reviews()->avg('rating') ?? 0, 1);
    }

    public function isAvailableForDates(string $startDate, string $endDate): bool
    {
        if ($this->status !== 'available') {
            return false;
        }

        return !$this->bookings()
            ->whereIn('status', ['pending', 'confirmed', 'picked_up'])
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate])
                    ->orWhere(function ($q) use ($startDate, $endDate) {
                        $q->where('start_date', '<=', $startDate)
                          ->where('end_date', '>=', $endDate);
                    });
            })
            ->exists();
    }
}
