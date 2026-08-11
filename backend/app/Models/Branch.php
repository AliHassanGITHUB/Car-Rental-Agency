<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    protected $fillable = ['name', 'address', 'city', 'lat', 'lng'];

    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class);
    }
}
