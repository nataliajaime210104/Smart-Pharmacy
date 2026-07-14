import { useEffect, useMemo, useState } from 'react';

import {
  Bot,
  CalendarCheck,
  ClipboardList,
  FileText,
  HeartPulse,
  Loader2,
  PlusCircle,
  Stethoscope,
  TriangleAlert,
  Users,
} from 'lucide-react';

import type {
  Patient,
  User,
} from '../../shared/types';

import UserAvatar from '../../shared/components/UserAvatar';
import { getPatients } from './services/patients.service';

type DoctorDashboardTarget =
  | 'registerPatient'
  | 'record'
  | 'prescriptions'
  | 'assistant';

interface Props {
  currentUser: User;
  onNavigate?: (page: DoctorDashboardTarget) => void;
}

interface DashboardPrescription {
  id: number;
  folio?: string;
  status?: string;
  diagnosis?: string;
  createdAt?: string;
  signedAt?: string | null;
}

type DashboardPatient = Patient & {
  id: number;
  name?: string;
  fullName?: string;
  email?: string;
  age?: number | null;
  allergies?: string | null;
  medicalConditions?: string | null;
  clinicalDiagnosis?: string | null;
  prescriptions?: DashboardPrescription[];
};

function isPendingText(value?: string | null) {
  if (!value) {
    return true;
  }

  const normalized = value.toLowerCase();

  return (
    normalized.includes('pendiente') ||
    normalized.includes('sin registrar') ||
    normalized.includes('sin receta')
  );
}

function DoctorDashboardPage({ currentUser, onNavigate }: Props) {
  const [patients, setPatients] = useState<DashboardPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getPatients();

      setPatients(data as DashboardPatient[]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No fue posible cargar el dashboard médico.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const dashboardData = useMemo(() => {
    const prescriptions = patients.flatMap((patient) =>
      patient.prescriptions ?? []
    );

    const signedPrescriptions = prescriptions.filter(
      (prescription) => prescription.status === 'Firmada'
    );

    const pendingPrescriptions = prescriptions.filter(
      (prescription) => prescription.status !== 'Firmada'
    );

    const clinicalAlerts = patients.filter((patient) => {
      const hasAllergies = !isPendingText(patient.allergies);
      const hasMedicalConditions = !isPendingText(patient.medicalConditions);

      return hasAllergies || hasMedicalConditions;
    });

    const recentPatients = [...patients]
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);

    const recentPrescriptions = [...prescriptions]
      .sort((a, b) => b.id - a.id)
      .slice(0, 4);

    return {
      totalPatients: patients.length,
      totalPrescriptions: prescriptions.length,
      signedPrescriptions: signedPrescriptions.length,
      pendingPrescriptions: pendingPrescriptions.length,
      clinicalAlerts: clinicalAlerts.length,
      recentPatients,
      recentPrescriptions,
    };
  }, [patients]);

  return (
    <div className="doctor-dashboard-page">
      <div className="doctor-welcome-card">
        <div className="doctor-welcome-profile">
          <UserAvatar
            user={currentUser}
            size="xl"
          />

          <div>
            <span className="dashboard-eyebrow">
              Panel médico
            </span>

            <h1>
              Bienvenido, {currentUser.name}
            </h1>

            <p>
              Consulta pacientes, revisa expedientes clínicos, genera recetas y
              da seguimiento a la actividad médica desde un solo panel.
            </p>

            <div className="welcome-profile-meta">
              <span className="welcome-profile-badge">
                {currentUser.role}
              </span>

              <span className="welcome-profile-badge success">
                {currentUser.status}
              </span>
            </div>
          </div>
        </div>

        <div className="doctor-welcome-actions">
          <button
            type="button"
            onClick={() => onNavigate?.('registerPatient')}
          >
            <PlusCircle size={18} />
            Registrar paciente
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={() => onNavigate?.('prescriptions')}
          >
            <ClipboardList size={18} />
            Crear receta
          </button>
        </div>
      </div>

      {error && (
        <div className="form-alert error">
          {error}
        </div>
      )}

      {loading && (
        <div className="doctor-dashboard-loading">
          <Loader2 size={24} />
          Cargando información médica...
        </div>
      )}

      {!loading && (
        <>
          <div className="dashboard-stats-grid">
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon blue">
                <Users size={26} />
              </div>

              <div>
                <span>Pacientes registrados</span>
                <strong>{dashboardData.totalPatients}</strong>
                <p>Pacientes activos disponibles para consulta.</p>
              </div>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon green">
                <ClipboardList size={26} />
              </div>

              <div>
                <span>Total de recetas</span>
                <strong>{dashboardData.totalPrescriptions}</strong>
                <p>Recetas registradas en expedientes clínicos.</p>
              </div>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon purple">
                <CalendarCheck size={26} />
              </div>

              <div>
                <span>Recetas firmadas</span>
                <strong>{dashboardData.signedPrescriptions}</strong>
                <p>Recetas listas para consulta del paciente.</p>
              </div>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon orange">
                <TriangleAlert size={26} />
              </div>

              <div>
                <span>Pendientes / alertas</span>
                <strong>
                  {dashboardData.pendingPrescriptions + dashboardData.clinicalAlerts}
                </strong>
                <p>Recetas pendientes o pacientes con datos sensibles.</p>
              </div>
            </div>
          </div>

          <div className="doctor-dashboard-grid">
            <div className="doctor-dashboard-panel">
              <div className="section-heading">
                <HeartPulse size={24} />
                <h3>Últimos pacientes registrados</h3>
              </div>

              {dashboardData.recentPatients.length === 0 ? (
                <div className="dashboard-empty">
                  No hay pacientes registrados todavía.
                </div>
              ) : (
                <div className="recent-patient-list">
                  {dashboardData.recentPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="recent-patient-item"
                    >
                      <div className="recent-patient-icon">
                        <Stethoscope size={18} />
                      </div>

                      <div>
                        <strong>
                          {patient.name ?? patient.fullName ?? 'Paciente sin nombre'}
                        </strong>

                        <span>
                          {patient.email ?? 'Sin correo registrado'}
                        </span>
                      </div>

                      <small>
                        {patient.age
                          ? `${patient.age} años`
                          : 'Edad pendiente'}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="doctor-dashboard-panel">
              <div className="section-heading">
                <FileText size={24} />
                <h3>Actividad reciente de recetas</h3>
              </div>

              {dashboardData.recentPrescriptions.length === 0 ? (
                <div className="dashboard-empty">
                  No hay recetas registradas todavía.
                </div>
              ) : (
                <div className="recent-prescription-list">
                  {dashboardData.recentPrescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="recent-prescription-item"
                    >
                      <div>
                        <strong>
                          {prescription.folio ?? `Receta #${prescription.id}`}
                        </strong>

                        <span>
                          {prescription.diagnosis ?? 'Sin diagnóstico registrado'}
                        </span>
                      </div>

                      <small
                        className={
                          prescription.status === 'Firmada'
                            ? 'status-badge'
                            : 'status-badge inactive'
                        }
                      >
                        {prescription.status ?? 'Pendiente'}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="doctor-quick-actions">
            <button
              type="button"
              onClick={() => onNavigate?.('registerPatient')}
            >
              <PlusCircle size={20} />
              Registrar paciente
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.('record')}
            >
              <FileText size={20} />
              Ver expediente clínico
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.('prescriptions')}
            >
              <ClipboardList size={20} />
              Recetas médicas
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.('assistant')}
            >
              <Bot size={20} />
              Asistente IA
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default DoctorDashboardPage;