<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('make');
            $table->string('model');
            $table->integer('year');
            $table->enum('category', ['economy', 'compact', 'midsize', 'suv', 'luxury', 'van']);
            $table->enum('transmission', ['automatic', 'manual']);
            $table->integer('seats');
            $table->decimal('daily_rate', 8, 2);
            $table->enum('status', ['available', 'maintenance', 'retired'])->default('available');
            $table->foreignId('branch_id')->constrained();
            $table->string('color')->nullable();
            $table->string('license_plate')->nullable();
            $table->integer('mileage_included')->default(200);
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->timestamps();

            $table->index(['status', 'category', 'branch_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
