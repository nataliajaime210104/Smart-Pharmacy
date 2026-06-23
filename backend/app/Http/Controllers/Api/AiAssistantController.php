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
                        'temperature' => 0.2,
                        'topP' => 0.8,
                        'maxOutputTokens' => 1500,
                    ],
                ]);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gemini no pudo responder. Revisa que GEMINI_API_KEY y GEMINI_MODEL sean correctos.',
                    'error' => $response->json(),
                    'status' => $response->status(),
                ], 422);
            }

            $responseData = $response->json();

            $answer = data_get(
                $responseData,
                'candidates.0.content.parts.0.text'
            );

            $finishReason = data_get(
                $responseData,
                'candidates.0.finishReason'
            );

            if (!$answer) {
                $answer = 'No pude generar una respuesta clara en este momento. Consulta al personal médico si la duda es importante.';
            }

            if ($finishReason === 'MAX_TOKENS') {
                $answer .= "\n\nNota: La respuesta fue resumida porque el asistente alcanzó el límite de extensión. Puedes pedir: \"continúa la respuesta\" si necesitas más detalle.";
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
                return "Atención médica inmediata:\n\n- Esto puede requerir atención médica urgente.\n- No puedo evaluar una emergencia desde el asistente.\n- Acude a urgencias o comunícate con los servicios de emergencia de tu localidad.\n- Si estás en México, puedes llamar al 911.\n\nEsta información no sustituye la valoración de un profesional de la salud.";
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
                return "No puedo realizar esa acción:\n\n- No puedo diagnosticar enfermedades.\n- No puedo recetar medicamentos nuevos.\n- No puedo cambiar dosis, frecuencia o duración de una receta.\n- No puedo indicar que suspendas un tratamiento.\n\nPuedo ayudarte a entender información general de tu receta, horarios, indicaciones o términos médicos de forma sencilla.\n\nEsta información no sustituye la valoración de un profesional de la salud.";
            }
        }

        return null;
    }

    private function buildPrompt(string $question, ?Patient $patient): string
    {
        $patientContext = $this->buildPatientContext($patient);

        return <<<PROMPT
        Eres el Asistente IA de SmartPharmacy, una plataforma académica para apoyo informativo sobre recetas, medicamentos indicados y expediente clínico.

        REGLAS MÉDICAS OBLIGATORIAS:
        1. Responde siempre en español claro, breve y fácil de entender.
        2. No diagnostiques enfermedades.
        3. No recetes medicamentos nuevos.
        4. No cambies dosis, frecuencia, duración ni indicaciones de una receta.
        5. No indiques suspender medicamentos.
        6. No afirmes que algo es seguro para todos los pacientes.
        7. Si la pregunta requiere decisión médica, responde que debe consultarlo con su médico.
        8. Si hay señales de emergencia, recomienda acudir a urgencias o servicios de emergencia.
        9. Usa únicamente el contexto clínico proporcionado.
        10. Si un dato no existe en el contexto, di que no está registrado.
        11. No inventes alergias, diagnósticos, tratamientos ni medicamentos.
        12. Puedes explicar de forma general para qué sirve un medicamento, cómo interpretar una indicación ya registrada, qué significa una frecuencia como "cada 8 horas" o cómo organizar recordatorios.
        13. Al final incluye siempre: "Esta información no sustituye la valoración de un profesional de la salud."

        REGLAS DE FORMATO OBLIGATORIAS:
        1. No uses Markdown.
        2. No uses asteriscos.
        3. No uses símbolos como **, ## o tablas Markdown.
        4. Organiza la respuesta con títulos simples.
        5. Cada dato importante debe ir en una línea separada.
        6. Usa guiones simples para listas.
        7. No pongas todos los datos en un solo párrafo.
        8. Responde en máximo 8 a 12 líneas cuando el usuario haga una pregunta general.
        9. Si el usuario pide historial clínico, muestra solo los datos principales y no repitas información innecesaria.
        10. Si la respuesta es muy extensa, termina con: "Puedo ampliar esta información si lo necesitas."
        11. No termines frases incompletas.
        12. Cierra siempre la respuesta con una oración completa.

        FORMATO CUANDO EL USUARIO PIDA INFORMACIÓN DEL PACIENTE:
        Información del paciente:
        - Expediente:
        - Nombre:
        - Edad:
        - Condición médica principal:
        - Alergias registradas:
        - Padecimientos o condiciones médicas:
        - Notas clínicas generales:

        Última receta:
        - Folio:
        - Estado:
        - Diagnóstico de consulta:
        - Notas de la receta:

        Medicamentos indicados:
        - Medicamento:
        Cantidad:
        Dosis:
        Frecuencia:
        Duración:
        Indicaciones:

        CONTEXTO DEL PACIENTE:
        {$patientContext}

        PREGUNTA DEL USUARIO:
        {$question}

        RESPUESTA SEGURA Y ORDENADA:
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

                return "- Medicamento: {$medicineCode} {$medicineName}\n" .
                    "  Cantidad: {$item->quantity}\n" .
                    "  Dosis: " . ($item->dosage ?? 'no registrada') . "\n" .
                    "  Frecuencia: " . ($item->frequency ?? 'no registrada') . "\n" .
                    "  Duración: " . ($item->duration ?? 'no registrada') . "\n" .
                    "  Indicaciones: " . ($item->instructions ?? 'no registradas');
            })->implode("\n");

            return "Receta: {$prescription->folio}\n" .
                "Estado: {$prescription->status}\n" .
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
        return "Asistente IA local:\n\n- Puedo ayudarte con información general sobre recetas y medicamentos registrados.\n- Para usar respuestas inteligentes con Gemini, configura AI_PROVIDER=gemini y GEMINI_API_KEY en el archivo .env del backend.\n\nEsta información no sustituye la valoración de un profesional de la salud.";
    }
}