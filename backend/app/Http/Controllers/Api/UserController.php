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

    public function profilePhoto(string $filename)
    {
        $safeFilename = basename($filename);

        $path = storage_path('app/public/profile-photos/' . $safeFilename);

        if (!file_exists($path)) {
            abort(404);
        }

        return response()->file($path, [
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    private function saveProfilePhotoIfPresent(Request $request, User $user): void
    {
        if (!$request->hasFile('profilePhoto')) {
            return;
        }

        if (!empty($user->profile_photo_path)) {
            Storage::disk('public')->delete($user->profile_photo_path);
        }

        $file = $request->file('profilePhoto');

        $fileName = 'user-' . $user->id . '-' . now()->format('YmdHis') . '.' . $file->getClientOriginalExtension();

        $photoPath = $file->storeAs(
            'profile-photos',
            $fileName,
            'public'
        );

        $user->update([
            'profile_photo_path' => $photoPath,
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
        if (empty($user->profile_photo_path)) {
            return null;
        }

        return '/api/profile-photos/' . basename($user->profile_photo_path);
    }
}