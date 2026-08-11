<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('vehicle_id')->constrained();
            $table->foreignId('pickup_branch_id')->constrained('branches');
            $table->foreignId('return_branch_id')->constrained('branches');
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->enum('status', ['pending', 'confirmed', 'picked_up', 'returned', 'cancelled'])->default('pending');
            $table->decimal('base_price', 10, 2);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('insurance_amount', 10, 2)->default(0);
            $table->decimal('total_price', 10, 2);
            $table->text('cancellation_policy')->nullable();
            $table->timestamps();

            $table->index(['vehicle_id', 'start_date', 'end_date']);
            $table->index(['user_id', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
