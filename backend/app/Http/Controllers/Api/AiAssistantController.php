<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AiAssistantController extends Controller
{
    public function ask(Request $request)
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'min:3', 'max:1200'],
            'patientId' => ['nullable', 'integer', 'exists:patients,id'],
        ]);

        $question = trim($validated['question']);
        $patient = null;

        if (!empty($validated['patientId'])) {
            $patient = Patient::with([
                'user',
                'prescriptions.doctor',
                'prescriptions.items.medicine',
            ])->find($validated['patientId']);
        }

        $safetyResponse = $this->getSafetyResponse($question);

        if ($safetyResponse) {
            return response()->json([
                'success' => true,
                'data' => [
                    'answer' => $safetyResponse,
                    'source' => 'safety_rules',
                ],
            ]);
        }

        if (config('services.ai.provider') !== 'gemini') {
            return response()->json([
                'success' => true,
                'data' => [
                    'answer' => $this->localFallbackAnswer($question),
                    'source' => 'local',
                ],
            ]);
        }

        $apiKey = config('services.gemini.api_key');
        $model = config('services.gemini.model');

        if (!$apiKey) {
            return response()->json([
                'success' => false,
                'message' => 'No se ha configurado GEMINI_API_KEY en el backend.',
            ], 500);
        }

        $prompt = $this->buildPrompt($question, $patient);

        try {
            $response = Http::timeout(40)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'x-goog-api-key' => $apiKey,
                ])
                ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent", [
                    'contents' => [
                        [
                            'parts' => [
                                [
                                    'text' => $prompt,
                                ],
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'temperature' => 0.25,
                        'topP' => 0.8,
                        'maxOutputTokens' => 700,
                    ],
                ]);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gemini no pudo responder en este momento.',
                    'error' => $response->json(),
                ], 500);
            }

            $answer = data_get(
                $response->json(),
                'candidates.0.content.parts.0.text'
            );

            if (!$answer) {
                $answer = 'No pude generar una respuesta clara en este momento. Consulta al personal médico si la duda es importante.';
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'answer' => trim($answer),
                    'source' => 'gemini',
                ],
            ]);
        } catch (\Throwable $error) {
            return response()->json([
                'success' => false,
                'message' => 'Error al conectar con Gemini API.',
                'error' => $error->getMessage(),
            ], 500);
        }
    }

    private function getSafetyResponse(string $question): ?string
    {
        $normalizedQuestion = Str::lower($question);

        $emergencyKeywords = [
            'dolor en el pecho',
            'no puedo respirar',
            'dificultad para respirar',
            'convulsión',
            'convulsion',
            'desmayo',
            'sobredosis',
            'sangrado fuerte',
            'reacción alérgica fuerte',
            'reaccion alergica fuerte',
            'hinchazón de cara',
            'hinchazon de cara',
            'emergencia',
            'urgencia',
        ];

        foreach ($emergencyKeywords as $keyword) {
            if (str_contains($normalizedQuestion, $keyword)) {
                return 'Esto puede requerir atención médica inmediata. No puedo evaluar una emergencia desde el asistente. Acude a urgencias o comunícate con los servicios de emergencia de tu localidad. Si estás en México, puedes llamar al 911.';
            }
        }

        $forbiddenKeywords = [
            'recétame',
            'recetame',
            'qué medicamento tomo',
            'que medicamento tomo',
            'qué pastilla tomo',
            'que pastilla tomo',
            'dime qué tomar',
            'dime que tomar',
            'puedo cambiar mi dosis',
            'cambio mi dosis',
            'aumento la dosis',
            'bajo la dosis',
            'dejo de tomar',
            'suspendo mi medicamento',
            'me diagnosticas',
            'diagnostícame',
            'diagnosticame',
            'qué enfermedad tengo',
            'que enfermedad tengo',
            'tengo estos síntomas qué es',
            'tengo estos sintomas que es',
        ];

        foreach ($forbiddenKeywords as $keyword) {
            if (str_contains($normalizedQuestion, $keyword)) {
                return 'No puedo diagnosticar, recetar medicamentos, cambiar dosis ni indicar que suspendas un tratamiento. Esa decisión debe tomarla un médico. Puedo ayudarte a entender información general de tu receta, horarios, indicaciones o términos médicos de forma sencilla.';
            }
        }

        return null;
    }

    private function buildPrompt(string $question, ?Patient $patient): string {
        $patientContext = $this->buildPatientContext($patient);

        return <<<PROMPT
            Eres el Asistente IA de SmartPharmacy, una plataforma académica para apoyo informativo sobre recetas, medicamentos indicados y expediente clínico.

            REGLAS OBLIGATORIAS:
            1. Responde siempre en español claro, breve y fácil de entender.
            2. No diagnostiques enfermedades.
            3. No recetes medicamentos nuevos.
            4. No cambies dosis, frecuencia, duración ni indicaciones de una receta.
            5. No indiques suspender medicamentos.
            6. No afirmes que algo es seguro para todos los pacientes.
            7. Si la pregunta requiere decisión médica, responde que debe consultarlo con su médico.
            8. Si hay señales de emergencia, recomienda acudir a urgencias o servicios de emergencia.
            9. Usa únicamente el contexto clínico proporcionado. Si un dato no existe en el contexto, di que no está registrado.
            10. No inventes alergias, diagnósticos, tratamientos ni medicamentos.
            11. Puedes explicar de forma general para qué sirve un medicamento, cómo interpretar una indicación ya registrada, qué significa una frecuencia como "cada 8 horas" o cómo organizar recordatorios.
            12. Al final incluye siempre: "Esta información no sustituye la valoración de un profesional de la salud."

            CONTEXTO DEL PACIENTE:
            {$patientContext}

            PREGUNTA DEL USUARIO:
            {$question}

            RESPUESTA SEGURA:
            PROMPT;
    }

    private function buildPatientContext(?Patient $patient): string
    {
        if (!$patient) {
            return 'No se seleccionó un paciente. Responde solo con información general y pide seleccionar un paciente si la pregunta requiere datos del expediente o receta.';
        }

        $patient->loadMissing([
            'user',
            'prescriptions.doctor',
            'prescriptions.items.medicine',
        ]);

        $prescriptions = $patient->prescriptions
            ->sortByDesc('created_at')
            ->take(3)
            ->values();

        $prescriptionsText = $prescriptions->map(function ($prescription) {
            $itemsText = $prescription->items->map(function ($item) {
                $medicineName = $item->medicine?->name ?? 'Medicamento no registrado';
                $medicineCode = $item->medicine?->code ?? 'Sin código';

                return "- {$medicineCode} {$medicineName}: cantidad {$item->quantity}, dosis: " .
                    ($item->dosage ?? 'no registrada') .
                    ', frecuencia: ' . ($item->frequency ?? 'no registrada') .
                    ', duración: ' . ($item->duration ?? 'no registrada') .
                    ', indicaciones: ' . ($item->instructions ?? 'no registradas');
            })->implode("\n");

            return "Receta {$prescription->folio} ({$prescription->status})\n" .
                "Diagnóstico de consulta: " . ($prescription->diagnosis ?? 'no registrado') . "\n" .
                "Notas: " . ($prescription->notes ?? 'sin notas') . "\n" .
                "Medicamentos:\n{$itemsText}";
        })->implode("\n\n");

        if (!$prescriptionsText) {
            $prescriptionsText = 'El paciente no tiene recetas electrónicas registradas.';
        }

        return 'Nombre: ' . ($patient->user?->name ?? $patient->full_name) . "\n" .
            'Edad: ' . ($patient->age ?? 'no registrada') . "\n" .
            'Expediente: ' . $patient->record_number . "\n" .
            'Condición médica principal: ' . ($patient->diagnosis ?? 'no registrada') . "\n" .
            'Alergias registradas: ' . ($patient->allergies ?? 'no registradas') . "\n" .
            'Padecimientos o condiciones médicas: ' . ($patient->medical_conditions ?? 'no registrados') . "\n" .
            'Notas clínicas generales: ' . ($patient->clinical_notes ?? 'sin notas') . "\n\n" .
            "Últimas recetas:\n{$prescriptionsText}";
    }

    private function localFallbackAnswer(string $question): string
    {
        return 'Puedo ayudarte con información general sobre tus recetas y medicamentos registrados. Para usar respuestas inteligentes con Gemini, configura AI_PROVIDER=gemini y GEMINI_API_KEY en el archivo .env del backend. Esta información no sustituye la valoración de un profesional de la salud.';
    }
}