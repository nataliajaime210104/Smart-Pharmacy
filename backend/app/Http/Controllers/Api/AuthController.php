<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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

        $token = $user->createToken(
            $this->deviceName($request),
            ['*'],
            now()->addDays(30),
        )->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Inicio de sesión correcto.',
            'token' => $token,
            'user' => $this->formatUser($user),
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

        $token = $user->createToken(
            $this->deviceName($request),
            ['*'],
            now()->addDays(30),
        )->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Usuario registrado correctamente.',
            'token' => $token,
            'user' => $this->formatUser($user),
        ], 201);
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $this->formatUser($request->user()),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada correctamente.',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
            'profilePhotoUrl' => $this->getProfilePhotoUrl($user),
        ];
    }

    private function getProfilePhotoUrl(User $user): ?string
    {
        if (empty($user->profile_photo_path)) {
            return null;
        }

        return '/api/profile-photos/' . basename($user->profile_photo_path);
    }

    private function deviceName(Request $request): string
    {
        $agent = trim((string) $request->userAgent());

        return 'smartpharmacy-web-' . substr(hash('sha256', $agent ?: 'unknown'), 0, 12);
    }
}
