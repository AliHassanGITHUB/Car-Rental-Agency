<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    protected $fillable = [
        'make',
        'model',
        'year',
        'category',
        'transmission',
        'seats',
        'daily_rate',
        'status',
        'branch_id',
        'image_url',
        'included_mileage',
    ];

    protected function casts(): array
    {
        return [
            'daily_rate' => 'decimal:2',
            'included_mileage' => 'integer',
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

    public function scopeAvailableBetween(Builder $query, ?string $startDate, ?string $endDate): Builder
    {
        if (!$startDate || !$endDate) {
            return $query;
        }

        return $query->whereDoesntHave('bookings', function (Builder $bookingQuery) use ($startDate, $endDate): void {
            $bookingQuery
                ->whereIn('status', ['confirmed', 'paid', 'picked_up'])
                ->where('start_date', '<', $endDate)
                ->where('end_date', '>', $startDate);
        });
    }
}
