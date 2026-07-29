<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('patient')
            ->orderBy('id', 'asc')
            ->get()
            ->map(function ($user) {
                return $this->formatUser($user);
            });

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => [
                'required',
                Rule::in([
                    'Medico',
                    'Paciente',
                    'Administrador Farmacia',
                    'Administrador Sistema',
                ]),
            ],
            'status' => ['required', Rule::in(['Activo', 'Inactivo'])],
            'patientAge' => ['nullable', 'integer', 'min:0', 'max:120'],
            'profilePhoto' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $patientAge = $validated['patientAge'] ?? null;

        unset($validated['patientAge']);
        unset($validated['profilePhoto']);

        $user = User::create($validated);

        $this->saveProfilePhotoIfPresent($request, $user);

        $this->createPatientProfileIfNeeded($user, $patientAge);

        $user->refresh();
        $user->load('patient');

        return response()->json([
            'success' => true,
            'message' => 'Usuario creado correctamente.',
            'data' => $this->formatUser($user),
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => [
                'required',
                Rule::in([
                    'Medico',
                    'Paciente',
                    'Administrador Farmacia',
                    'Administrador Sistema',
                ]),
            ],
            'status' => ['required', Rule::in(['Activo', 'Inactivo'])],
            'patientAge' => ['nullable', 'integer', 'min:0', 'max:120'],
            'profilePhoto' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $patientAge = $validated['patientAge'] ?? null;

        unset($validated['patientAge']);
        unset($validated['profilePhoto']);

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $user->update($validated);

        $this->saveProfilePhotoIfPresent($request, $user);

        $user->refresh();

        $this->createPatientProfileIfNeeded($user, $patientAge);
        $this->syncPatientProfileIfExists($user, $patientAge);

        $user->load('patient');

        return response()->json([
            'success' => true,
            'message' => 'Usuario actualizado correctamente.',
            'data' => $this->formatUser($user),
        ]);
    }

    public function deactivate(User $user)
    {
        $user->update([
            'status' => 'Inactivo',
        ]);

        $user->load('patient');

        return response()->json([
            'success' => true,
            'message' => 'Usuario desactivado correctamente.',
            'data' => $this->formatUser($user),
        ]);
    }

    public function profilePhoto(User $user)
    {
        return $this->profilePhotoResponse($user);
    }

    /**
     * Mantiene compatibilidad con URLs guardadas por versiones anteriores.
     */
    public function profilePhotoByFilename(string $filename)
    {
        $safeFilename = basename($filename);

        $user = User::query()
            ->where(function ($query) use ($safeFilename) {
                $query->where('profile_photo_path', $safeFilename)
                    ->orWhere('profile_photo_path', 'like', '%/' . $safeFilename);
            })
            ->first();

        if ($user) {
            return $this->profilePhotoResponse($user);
        }

        $legacyPath = storage_path('app/public/profile-photos/' . $safeFilename);

        if (file_exists($legacyPath)) {
            return response()->file($legacyPath, [
                'Cache-Control' => 'public, max-age=86400',
            ]);
        }

        abort(404);
    }

    private function profilePhotoResponse(User $user)
    {
        if (!empty($user->profile_photo_data)) {
            $binary = base64_decode($user->profile_photo_data, true);

            if ($binary !== false) {
                return response($binary, 200, [
                    'Content-Type' => $user->profile_photo_mime ?: 'image/jpeg',
                    'Cache-Control' => 'public, max-age=86400',
                    'Content-Length' => (string) strlen($binary),
                ]);
            }
        }

        // Compatibilidad con fotografías subidas antes de guardar archivos
        // directamente en PostgreSQL.
        if (!empty($user->profile_photo_path)) {
            $legacyPath = storage_path(
                'app/public/profile-photos/' . basename($user->profile_photo_path)
            );

            if (file_exists($legacyPath)) {
                return response()->file($legacyPath, [
                    'Cache-Control' => 'public, max-age=86400',
                ]);
            }
        }

        abort(404);
    }

    private function saveProfilePhotoIfPresent(Request $request, User $user): void
    {
        if (!$request->hasFile('profilePhoto')) {
            return;
        }

        // Elimina únicamente una posible copia local heredada. La fotografía
        // principal se guarda en PostgreSQL porque el filesystem de Render es
        // efímero cuando no existe un disco persistente.
        if (!empty($user->profile_photo_path)) {
            Storage::disk('public')->delete($user->profile_photo_path);
        }

        $file = $request->file('profilePhoto');
        $photoBinary = file_get_contents($file->getRealPath());

        if ($photoBinary === false) {
            throw new \RuntimeException('No fue posible leer la fotografía seleccionada.');
        }

        $extension = strtolower($file->getClientOriginalExtension() ?: 'jpg');
        $fileName = 'user-' . $user->id . '-' . now()->format('YmdHis') . '.' . $extension;

        $user->update([
            'profile_photo_path' => 'profile-photos/' . $fileName,
            'profile_photo_data' => base64_encode($photoBinary),
            'profile_photo_mime' => $file->getMimeType()
                ?: $file->getClientMimeType()
                ?: 'image/jpeg',
        ]);
    }

    private function createPatientProfileIfNeeded(User $user, ?int $patientAge = null): void
    {
        if ($user->role !== 'Paciente') {
            return;
        }

        if ($user->patient) {
            return;
        }

        Patient::create([
            'user_id' => $user->id,
            'record_number' => $this->generatePatientRecordNumber(),
            'full_name' => $user->name,
            'birth_date' => null,
            'age' => $patientAge,
            'diagnosis' => 'Pendiente por registrar',
            'allergies' => 'Pendiente por registrar',
            'last_treatment' => 'Pendiente por registrar',
        ]);
    }

    private function syncPatientProfileIfExists(User $user, ?int $patientAge = null): void
    {
        if (!$user->patient) {
            return;
        }

        $patientData = [
            'full_name' => $user->name,
        ];

        if ($patientAge !== null) {
            $patientData['age'] = $patientAge;
        }

        $user->patient->update($patientData);
    }

    private function generatePatientRecordNumber(): string
    {
        $year = now()->format('Y');

        $lastPatient = Patient::where('record_number', 'like', "EXP-{$year}-%")
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = 1;

        if ($lastPatient) {
            $parts = explode('-', $lastPatient->record_number);
            $lastNumber = (int) end($parts);
            $nextNumber = $lastNumber + 1;
        }

        do {
            $recordNumber = 'EXP-' . $year . '-' . str_pad((string) $nextNumber, 3, '0', STR_PAD_LEFT);
            $nextNumber++;
        } while (Patient::where('record_number', $recordNumber)->exists());

        return $recordNumber;
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
            'profilePhotoUrl' => $this->getProfilePhotoUrl($user),
            'patientAge' => $user->patient?->age,
        ];
    }

    private function getProfilePhotoUrl(User $user): ?string
    {
        if (empty($user->profile_photo_path) && empty($user->profile_photo_data)) {
            return null;
        }

        return '/api/profile-photos/user/' . $user->id;
    }
}