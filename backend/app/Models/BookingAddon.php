<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingAddon extends Model
{
    protected $fillable = ['booking_id', 'addon_type', 'price'];

    protected function casts(): array
    {
        return ['price' => 'decimal:2'];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
