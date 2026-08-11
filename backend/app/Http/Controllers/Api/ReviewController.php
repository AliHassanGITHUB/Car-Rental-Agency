<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request, Vehicle $vehicle): JsonResponse
    {
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $review = Review::updateOrCreate(
            ['vehicle_id' => $vehicle->id, 'user_id' => $request->user()->id],
            $validated
        );

        return response()->json($review->load('user'), 201);
    }

    public function index(Vehicle $vehicle): JsonResponse
    {
        $reviews = Review::where('vehicle_id', $vehicle->id)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($reviews);
    }
}
