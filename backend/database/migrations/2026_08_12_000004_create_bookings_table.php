<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->foreignId('pickup_branch_id')->constrained('branches')->restrictOnDelete();
            $table->foreignId('return_branch_id')->constrained('branches')->restrictOnDelete();
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->string('status')->default('pending')->index();
            $table->decimal('total_price', 10, 2);
            $table->string('reference')->unique();
            $table->timestamps();

            $table->index(['start_date', 'end_date', 'vehicle_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
