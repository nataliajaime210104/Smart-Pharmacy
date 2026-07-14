import { useEffect, useMemo, useState } from 'react';

import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  Download,
  FileText,
  Pill,
  Search,
  Stethoscope,
} from 'lucide-react';

import type {
  PatientPrescription,
  User,
} from '../../shared/types';

import { getMyPrescriptions } from './services/patient.service';

interface Props {
  currentUser: User;
}

function MyPrescriptionsPage({ currentUser }: Props) {
  const [prescriptions, setPrescriptions] = useState<PatientPrescription[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getMyPrescriptions(currentUser.id);

      setPrescriptions(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No fue posible cargar tus recetas.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, [currentUser.id]);

  const filteredPrescriptions = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return prescriptions;
    }

    return prescriptions.filter((prescription) => {
      const medicines = prescription.items
        .map((item) => item.medicineName)
        .join(' ')
        .toLowerCase();

      return (
        prescription.folio?.toLowerCase().includes(value) ||
        prescription.diagnosis?.toLowerCase().includes(value) ||
        prescription.doctorName?.toLowerCase().includes(value) ||
        prescription.status?.toLowerCase().includes(value) ||
        medicines.includes(value)
      );
    });
  }, [prescriptions, search]);

  const signedPrescriptions = prescriptions.filter(
    (prescription) => prescription.status === 'Firmada'
  ).length;

  const pendingPrescriptions = prescriptions.length - signedPrescriptions;

  const openPdf = (pdfUrl?: string | null) => {
    if (!pdfUrl) {
      return;
    }

    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const getStatusClass = (status: string) => {
    if (status === 'Firmada') {
      return 'patient-status signed';
    }

    if (status === 'Pendiente') {
      return 'patient-status pending';
    }

    return 'patient-status neutral';
  };

  return (
    <div className="patient-prescriptions-page">
      <div className="patient-page-header">
        <div className="patient-page-title">
          <div className="patient-page-icon">
            <FileText size={30} />
          </div>

          <div>
            <h1>Mis recetas médicas</h1>
            <p>
              Consulta tus recetas asignadas, medicamentos indicados y descarga
              el PDF cuando la receta esté firmada.
            </p>
          </div>
        </div>
      </div>

      <div className="patient-summary-grid">
        <div className="patient-summary-card">
          <div className="patient-summary-icon">
            <FileText size={24} />
          </div>

          <div>
            <span>Total de recetas</span>
            <strong>{prescriptions.length}</strong>
          </div>
        </div>

        <div className="patient-summary-card">
          <div className="patient-summary-icon signed">
            <CheckCircle2 size={24} />
          </div>

          <div>
            <span>Recetas firmadas</span>
            <strong>{signedPrescriptions}</strong>
          </div>
        </div>

        <div className="patient-summary-card">
          <div className="patient-summary-icon pending">
            <AlertCircle size={24} />
          </div>

          <div>
            <span>Pendientes</span>
            <strong>{pendingPrescriptions}</strong>
          </div>
        </div>
      </div>

      <div className="patient-toolbar">
        <div className="patient-search">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por folio, diagnóstico, médico o medicamento..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="patient-empty-state">
          <FileText size={42} />
          <h3>Cargando tus recetas...</h3>
          <p>Estamos consultando la información médica asignada a tu cuenta.</p>
        </div>
      )}

      {!loading && error && (
        <div className="patient-error-state">
          <AlertCircle size={42} />
          <h3>No fue posible cargar tus recetas</h3>
          <p>{error}</p>
          <button onClick={loadPrescriptions}>
            Intentar nuevamente
          </button>
        </div>
      )}

      {!loading && !error && filteredPrescriptions.length === 0 && (
        <div className="patient-empty-state">
          <FileText size={42} />
          <h3>No hay recetas para mostrar</h3>
          <p>
            Cuando tu médico genere y asigne una receta a tu expediente,
            aparecerá en esta sección.
          </p>
        </div>
      )}

      {!loading && !error && filteredPrescriptions.length > 0 && (
        <div className="patient-prescription-list">
          {filteredPrescriptions.map((prescription) => (
            <article
              key={prescription.id}
              className="patient-prescription-card"
            >
              <div className="patient-prescription-header">
                <div>
                  <span className="patient-card-label">
                    Receta médica
                  </span>

                  <h2>{prescription.folio}</h2>
                </div>

                <span className={getStatusClass(prescription.status)}>
                  {prescription.status}
                </span>
              </div>

              <div className="patient-prescription-info">
                <div className="patient-info-item">
                  <Stethoscope size={18} />
                  <div>
                    <span>Médico</span>
                    <strong>
                      {prescription.doctorName ?? 'No registrado'}
                    </strong>
                  </div>
                </div>

                <div className="patient-info-item">
                  <CalendarCheck size={18} />
                  <div>
                    <span>Fecha de firma</span>
                    <strong>
                      {prescription.signedAt ?? 'Pendiente de firma'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="patient-diagnosis-box">
                <span>Diagnóstico</span>
                <p>
                  {prescription.diagnosis || 'Sin diagnóstico registrado'}
                </p>
              </div>

              {prescription.notes && (
                <div className="patient-notes-box">
                  <span>Notas médicas</span>
                  <p>{prescription.notes}</p>
                </div>
              )}

              <div className="patient-medicines-section">
                <h3>
                  <Pill size={20} />
                  Medicamentos indicados
                </h3>

                <div className="patient-medicines-list">
                  {prescription.items.map((item, index) => (
                    <div
                      key={`${prescription.id}-${index}`}
                      className="patient-medicine-card"
                    >
                      <div className="patient-medicine-title">
                        <strong>
                          {item.medicineName ?? 'Medicamento no registrado'}
                        </strong>

                        <span>
                          Cantidad: {item.quantity}
                        </span>
                      </div>

                      <div className="patient-medicine-details">
                        <p>
                          <strong>Dosis:</strong>{' '}
                          {item.dosage || 'No especificada'}
                        </p>

                        <p>
                          <strong>Horario:</strong>{' '}
                          {item.frequency || 'No especificado'}
                        </p>

                        <p>
                          <strong>Duración:</strong>{' '}
                          {item.duration || 'No especificada'}
                        </p>

                        {item.instructions && (
                          <p className="patient-instructions">
                            <strong>Indicaciones:</strong>{' '}
                            {item.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {prescription.verificationCode && (
                <div className="patient-verification-code">
                  Código de verificación:{' '}
                  <strong>{prescription.verificationCode}</strong>
                </div>
              )}

              <div className="patient-card-actions">
                <button
                  type="button"
                  className="patient-pdf-button"
                  disabled={!prescription.pdfUrl}
                  onClick={() => openPdf(prescription.pdfUrl)}
                >
                  <Download size={18} />
                  {prescription.pdfUrl
                    ? 'Ver / descargar PDF'
                    : 'PDF disponible al firmarse'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyPrescriptionsPage;