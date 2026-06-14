<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\MedicineController;
use App\Http\Controllers\Api\InventoryController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'status' => 'ok',
        'message' => 'SmartPharmacy API funcionando correctamente',
    ]);
});

Route::post('/login', [AuthController::class, 'login']);

Route::get('/patients', [PatientController::class, 'index']);

Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::put('/users/{user}', [UserController::class, 'update']);
Route::patch('/users/{user}/deactivate', [UserController::class, 'deactivate']);

Route::get('/medicines', [MedicineController::class, 'index']);
Route::post('/medicines', [MedicineController::class, 'store']);
Route::put('/medicines/{medicine}', [MedicineController::class, 'update']);
Route::patch('/medicines/{medicine}/deactivate', [MedicineController::class, 'deactivate']);

Route::get('/inventory', [InventoryController::class, 'index']);
Route::get('/inventory/low-stock', [InventoryController::class, 'lowStock']);
Route::post('/inventory', [InventoryController::class, 'store']);
Route::put('/inventory/{inventory}', [InventoryController::class, 'update']);
Route::patch('/inventory/{inventory}/deactivate', [InventoryController::class, 'deactivate']);