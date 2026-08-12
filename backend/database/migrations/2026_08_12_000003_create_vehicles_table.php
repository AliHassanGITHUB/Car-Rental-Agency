<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table): void {
            $table->id();
            $table->string('make');
            $table->string('model');
            $table->unsignedSmallInteger('year');
            $table->string('category')->index();
            $table->string('transmission')->index();
            $table->unsignedTinyInteger('seats')->index();
            $table->decimal('daily_rate', 10, 2)->index();
            $table->string('status')->default('available')->index();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->string('image_url')->nullable();
            $table->unsignedInteger('included_mileage')->default(250);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
