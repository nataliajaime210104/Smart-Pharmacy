<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Receta {{ $prescription->folio }}</title>
    <style>

    body{
        font-family: DejaVu Sans, sans-serif;
        color:#243447;
        font-size:11px;
    }
    
    .container{
        width:100%;
    }

    /* HEADER */

    .header{
        width:100%;
        border-bottom:3px solid #1e63d6;
        padding-bottom:12px;
    }

    .logo{
        width:60%;
        float:left;
    }

    .logo h1{
        margin:0;
        font-size:28px;
        color:#1e63d6;
    }

    .logo span{
        color:#1f2937;
    }

    .logo small{
        color:#6b7280;
    }

    .section{
        margin-top:20px;
    }

    .section-title{
        color:#0b4fb5;
        font-size:18px;
        font-weight:bold;
        border-bottom:2px solid #0b4fb5;
        padding-bottom:6px;
        margin-top:18px;
        margin-bottom:12px;
        text-transform:uppercase;
    }

    .info td{
        padding:8px 4px;
    }
    
    .label{
        width:170px;
        font-weight:bold;
        color:#111827;
    }
    
    .recipe-box{
        background:#0b4fb5;
        color:white;
        width:180px;
        padding:12px 0;
        border-radius:8px;
        text-align:center;
        font-size:18px;
        font-weight:bold;
    }
    
    .recipe-box strong{
        font-size:15px;
    }
    
    .clear{
        clear:both;
    }

     /* TARJETAS */
     
    .card{
        margin-top:20px;
        background:white;
        border:1px solid #d9e5f2;
        border-radius:12px;
        padding:18px;
    }
    
    .card-title{
        color:#1e63d6;
        font-weight:bold;
        font-size:13px;
        border-bottom:2px solid #1e63d6;
        padding-bottom:5px;
        margin-bottom:10px;
    }

    /* TABLAS */
    
    table{
        border-spacing:0;
    }

    .info{
        width:100%;
        border-collapse:collapse;
    }
    
    .info td{
        padding:6px;
    }
    
    .label{
        font-weight:bold;
        color:#374151;
    }
    
    /* MEDICAMENTOS */
    
    .medicamentos{
        width:100%;
        border-collapse:collapse;
        margin-top:10px;
        border-radius:8px;
        overflow:hidden;

}

    .medicamentos th{
        background:#0b4fb5;
        color:white;
        padding:11px;
        text-align:center;
        font-size:12px;
    }

    .medicamentos td{
        border:1px solid #d5d5d5;
        padding:10px;
        text-align:center;
    }
    
    /* DOS COLUMNAS */
    
    .columns{
        width:100%;
        margin-top:15px;
    }
    
    .columns td{
        padding-right:20px;
        vertical-align:top;
    }

    /* FIRMA */

    .signature{
        margin-top:20px;
        border:1px solid #d9e4f5;
        border-radius:12px;
        background:white;
        text-align:center;
        padding:18px;
    }
    
    .line{
        width:270px;
        margin:8px auto;
        border-top:2px solid #1e63d6;
    }

    .signature img{
        height:90px;
    }

    /* FOOTER */
    
    .footer{
        margin-top:25px;
        padding:15px;
        background:white;
        border:1px solid #d9e5f2;
        border-radius:12px;
    }
    
    .footer td{
        padding:5px;
    }
    </style>
    </head>
<body>

<div class="container">

    <!-- ENCABEZADO -->
    <div class="header">
        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td width="75%">
                    <table cellpadding="0" cellspacing="0">
                        <tr>
                            <td width="70">
                                <img src="{{ asset('public/assets/logo/smartpharmacy-logo.png') }}" style="height:60px;">
                            </td>
                            
                            <td>
                                <div style="font-size:30px;font-weight:bold;color:#0d4cb5;">
                                    Smart<span style="color:#222;">Pharmacy</span>
                                </div>
                                
                                <div style="font-size:12px;color:#777;">
                                    TU SALUD, NUESTRA PRIORIDAD
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
                
                <td width="25%" align="right">
                    <div class="recipe-box">
                        RECETA MÉDICA
                    </div>
                </td>
            </tr>
        </table>
    </div>
</td>
</tr>
</table>

</div>
    
    <!-- FOLIO -->
    <div class="card">
        <table width="100%">
            <tr>
                <td width="70%">
                    <p><b>Folio de receta:</b> {{ $prescription->folio }}</p>
                    <p><b>Emitida por:</b> SmartPharmacy</p>
                    <p><b>Fecha de emisión:</b>
                    {{ $prescription->created_at?->format('Y-m-d H:i:s') }}
                </p>
            </td>
        
        <td align="center">
            <!-- Aquí poner el QR -->
        </td>
        </tr>
    </table>
    </div>

    <!-- DATOS PACIENTE -->
    <div class="section">
        <div class="section-title">
            DATOS GENERALES
        </div>
        
        <table class="info">
            
        <tr>
            <td class="label">Paciente:</td>
            <td>{{ $prescription->patient?->full_name }}</td>
        </tr>
        
        <tr>
            <td class="label">Expediente:</td>            
            <td>{{ $prescription->patient?->record_number }}</td>
        </tr>
        
    <tr>
        <td class="label">Diagnóstico:</td>
        <td>
        {{ $prescription->diagnosis }}
    </td>
</tr>
    
    <tr>
        <td class="label">Médico:</td>
        <td>{{ $prescription->doctor?->name }}</td>
    </tr>
    
    <tr>
        <td class="label">Correo:</td>
        <td>{{ $prescription->doctor?->email }}</td>
    </tr>
</table>
</div>
    <div class="section">        
        <div class="section-title">Medicamentos recetados</div>
        <table class="medicamentos">            
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
    
    <table class="columns">
        <tr>
            <td>
                <div class="section-title">
                    INDICACIONES CLÍNICAS
                </div>
                
                {{ $prescription->notes ?? 'Sin observaciones' }}
            </td>
            
            <td>
                <div class="section-title">
                    RECOMENDACIONES
                </div>
                Tomar medicamentos según prescripción médica.
            </td>
        </tr>

    </table>
    @if ($prescription->notes)
        <div class="section">
            <div class="section-title">Notas generales</div>
            <p>{{ $prescription->notes }}</p>
        </div>
    @endif
    
    <div class="signature">
        <div class="section-title">
            FIRMA DEL MÉDICO
        </div>
        @if($signatureImage)
        <img src="{{ $signatureImage }}">
        @endif
        <div class="line"></div>
        
        <b>{{ $prescription->signed_by_name ?? $prescription->doctor?->name }}</b>
        <br>
        Cédula Profesional
        <br><br>
        
        <b>Fecha:</b>
        {{ $prescription->signed_at?->format('d/m/Y H:i') }}
        
        <div style="margin-top:15px;font-size:10px;color:#666;">
            Dr. ID:
            {{ $prescription->doctor?->id }}|
            Generado por SmartPharmacy
        </div>
    </div>
</div>

<div class="footer">
    <table width="100%">
        <tr>
            <td width="60%">
                <b>Documento generado desde SmartPharmacy</b><br>
                La validez de esta receta puede verificarse mediante el código QR o el folio.
                </td>
                
                <td align="right">
                    <b>Fecha:</b><br>
                    {{ $prescription->created_at?->format('Y-m-d H:i:s') }}
                </td>
            </td>
        </tr>
    </table>
</div>
</div>
</body>
</html>