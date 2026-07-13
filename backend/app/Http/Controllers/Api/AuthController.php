<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Patient;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $request->email)
            ->where('status', 'Activo')
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales incorrectas.',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Inicio de sesión correcto.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
            ],
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'min:8'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'Paciente',
            'status' => 'Activo',
        ]);

        Patient::create([
            'user_id' => $user->id,
            'record_number' => 'EXP-' . str_pad($user->id, 6, '0', STR_PAD_LEFT),
            'full_name' => $user->name,
            'age' => null,
            'diagnosis' => null,
            'allergies' => null,
            'medical_conditions' => null,
            'clinical_notes' => null,
            'last_treatment' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Usuario registrado correctamente.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
            ],
        ], 201);
    }
}