<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Receta {{ $prescription->folio }}</title>

    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #0f172a;
            font-size: 12px;
            line-height: 1.5;
        }

        .header {
            border-bottom: 3px solid #2563eb;
            padding-bottom: 14px;
            margin-bottom: 22px;
        }

        .title {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin: 0;
        }

        .subtitle {
            color: #64748b;
            margin: 4px 0 0 0;
        }

        .folio-box {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 10px;
            margin-top: 12px;
        }

        .section {
            margin-bottom: 18px;
        }

        .section-title {
            font-size: 15px;
            color: #1e40af;
            font-weight: bold;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 10px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }

        th {
            background: #f1f5f9;
            color: #334155;
            font-weight: bold;
            text-align: left;
            padding: 8px;
            border: 1px solid #e2e8f0;
        }

        td {
            padding: 8px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
        }

        .grid {
            width: 100%;
        }

        .grid td {
            border: none;
            padding: 4px 0;
        }

        .label {
            font-weight: bold;
            color: #334155;
        }

        .signature-box {
            margin-top: 30px;
            border-top: 1px solid #e2e8f0;
            padding-top: 18px;
        }

        .signature-image {
            width: 220px;
            height: auto;
            margin-bottom: 8px;
        }

        .hash-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 10px;
            font-size: 10px;
            word-break: break-all;
            margin-top: 8px;
        }

        .verification {
            background: #ecfdf5;
            border: 1px solid #bbf7d0;
            color: #166534;
            padding: 10px;
            font-weight: bold;
            border-radius: 8px;
            margin-top: 10px;
        }

        .footer {
            margin-top: 30px;
            font-size: 10px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">SmartPharmacy - Receta Electrónica</h1>
        <p class="subtitle">Documento generado desde el sistema SmartPharmacy</p>

        <div class="folio-box">
            <strong>Folio:</strong> {{ $prescription->folio }}<br>
            <strong>Estado:</strong> {{ $prescription->status }}<br>
            <strong>Fecha de emisión:</strong> {{ $prescription->created_at?->format('Y-m-d H:i:s') }}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Datos del paciente</div>

        <table class="grid">
            <tr>
                <td><span class="label">Paciente:</span> {{ $prescription->patient?->full_name }}</td>
            </tr>
            <tr>
                <td><span class="label">Expediente:</span> {{ $prescription->patient?->record_number }}</td>
            </tr>
            <tr>
                <td><span class="label">Diagnóstico:</span> {{ $prescription->diagnosis ?? 'N/A' }}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Datos del médico</div>

        <table class="grid">
            <tr>
                <td><span class="label">Médico responsable:</span> {{ $prescription->doctor?->name }}</td>
            </tr>
            <tr>
                <td><span class="label">Correo:</span> {{ $prescription->doctor?->email }}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Medicamentos recetados</div>

        <table>
            <thead>
                <tr>
                    <th>Medicamento</th>
                    <th>Cantidad</th>
                    <th>Dosis</th>
                    <th>Frecuencia</th>
                    <th>Duración</th>
                    <th>Indicaciones</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($prescription->items as $item)
                    <tr>
                        <td>
                            {{ $item->medicine?->code }} - {{ $item->medicine?->name }}
                        </td>
                        <td>{{ $item->quantity }}</td>
                        <td>{{ $item->dosage ?? 'N/A' }}</td>
                        <td>{{ $item->frequency ?? 'N/A' }}</td>
                        <td>{{ $item->duration ?? 'N/A' }}</td>
                        <td>{{ $item->instructions ?? 'N/A' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    @if ($prescription->notes)
        <div class="section">
            <div class="section-title">Notas generales</div>
            <p>{{ $prescription->notes }}</p>
        </div>
    @endif

    <div class="signature-box">
        <div class="section-title">Firma digital de la receta</div>

        @if ($signatureImage)
            <img class="signature-image" src="{{ $signatureImage }}" alt="Firma digital">
        @else
            <p>Sin imagen de firma registrada.</p>
        @endif

        <p>
            <strong>Firmado por:</strong> {{ $prescription->signed_by_name ?? $prescription->doctor?->name }}<br>
            <strong>Fecha de firma:</strong> {{ $prescription->signed_at?->format('Y-m-d H:i:s') }}
        </p>

        <div class="verification">
            Código de verificación: {{ $prescription->verification_code ?? 'N/A' }}
        </div>

        <div class="hash-box">
            <strong>Hash SHA-256:</strong><br>
            {{ $prescription->signature_hash ?? 'N/A' }}
        </div>
    </div>

    <div class="footer">
        Esta receta electrónica fue generada por SmartPharmacy. La firma digital implementada corresponde a una validación técnica simulada para fines académicos y de trazabilidad del sistema.
    </div>
</body>
</html>