<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Booking extends Model
{
    protected $fillable = [
        'reference_number', 'user_id', 'vehicle_id', 'pickup_branch_id',
        'return_branch_id', 'start_date', 'end_date', 'status',
        'base_price', 'tax_amount', 'insurance_amount', 'total_price',
        'cancellation_policy',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'base_price' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'insurance_amount' => 'decimal:2',
            'total_price' => 'decimal:2',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($booking) {
            if (!$booking->reference_number) {
                $booking->reference_number = 'RCA-' . strtoupper(Str::random(8));
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function pickupBranch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'pickup_branch_id');
    }

    public function returnBranch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'return_branch_id');
    }

    public function addons(): HasMany
    {
        return $this->hasMany(BookingAddon::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function days(): int
    {
        return $this->start_date->diffInDays($this->end_date) ?: 1;
    }
}
