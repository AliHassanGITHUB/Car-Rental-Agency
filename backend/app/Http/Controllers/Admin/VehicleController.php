<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\VehicleRequest;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;

class VehicleController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Vehicle::with('branch')->orderBy('make')->get()]);
    }

    public function store(VehicleRequest $request): JsonResponse
    {
        return response()->json(['data' => Vehicle::create($request->validated())], 201);
    }

    public function update(VehicleRequest $request, Vehicle $vehicle): JsonResponse
    {
        $vehicle->update($request->validated());

        return response()->json(['data' => $vehicle->refresh()->load('branch')]);
    }
}
