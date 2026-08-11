<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DriverDocument extends Model
{
    protected $fillable = [
        'user_id', 'license_number', 'license_expiry',
        'document_url', 'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'license_expiry' => 'date',
            'verified_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
