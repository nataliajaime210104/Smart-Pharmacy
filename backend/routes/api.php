<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\MedicineController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\PrescriptionController;
use App\Http\Controllers\Api\AiAssistantController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'status' => 'ok',
        'message' => 'SmartPharmacy API funcionando correctamente',
    ]);
});

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::get('/patients', [PatientController::class, 'index']);
Route::post('/patients', [PatientController::class, 'store']);
Route::put('/patients/{patient}/clinical-data', [PatientController::class, 'updateClinicalData']);

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

Route::get('/prescriptions', [PrescriptionController::class, 'index']);
Route::post('/prescriptions/check-stock', [PrescriptionController::class, 'checkStock']);
Route::post('/prescriptions', [PrescriptionController::class, 'store']);
Route::post('/prescriptions/{prescription}/sign', [PrescriptionController::class, 'sign']);
Route::post('/prescriptions/{prescription}/dispense', [PrescriptionController::class, 'dispense']);
Route::get('/prescriptions/{prescription}/pdf', [PrescriptionController::class, 'pdf']);
Route::get('/patient/prescriptions/{userId}', [PatientController::class, 'myPrescriptions']);

Route::post('/ai-assistant/ask', [AiAssistantController::class, 'ask']);    