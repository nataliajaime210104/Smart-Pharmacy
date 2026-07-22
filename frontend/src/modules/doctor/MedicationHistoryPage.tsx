import type { ChangeEvent } from 'react';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Pill,
  Search,
  TriangleAlert,
  UserRound,
} from 'lucide-react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { User } from '../../shared/types';
import type {
  MedicationHistoryData,
  MedicationHistoryPatient,
  MedicationHistoryStatus,
} from '../../shared/types/medicationHistory';

import {
  getMedicationHistory,
  getMedicationHistoryPatients,
} from './services/medication-history.service';

import '../../styles/medication-history.css';

interface Props {
  currentUser: User;
}

const STATUS_LABELS: Record<MedicationHistoryStatus, string> = {
  Pendiente: 'Pendiente',
  Tomado: 'Tomado',
  Omitido: 'Omitido',
};

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function createInitialPeriod() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 29);

  return {
    startDate: toInputDate(startDate),
    endDate: toInputDate(endDate),
  };
}

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Sin registro';
  }

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function MedicationHistoryPage({ currentUser }: Props) {
  const initialPeriod = useMemo(createInitialPeriod, []);

  const [patients, setPatients] = useState<MedicationHistoryPatient[]>([]);
  const [patientId, setPatientId] = useState('');
  const [startDate, setStartDate] = useState(initialPeriod.startDate);
  const [endDate, setEndDate] = useState(initialPeriod.endDate);
  const [history, setHistory] = useState<MedicationHistoryData | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState('');

  const loadPatients = useCallback(async () => {
    try {
      setLoadingPatients(true);
      setError('');

      const data = await getMedicationHistoryPatients(currentUser.id);
      setPatients(data);

      setPatientId((current) => {
        if (current && data.some((patient) => String(patient.id) === current)) {
          return current;
        }

        return data[0] ? String(data[0].id) : '';
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'No fue posible cargar los pacientes.'
      );
    } finally {
      setLoadingPatients(false);
    }
  }, [currentUser.id]);

  const loadHistory = useCallback(async () => {
    if (!patientId) {
      setHistory(null);
      return;
    }

    if (startDate > endDate) {
      setError('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }

    try {
      setLoadingHistory(true);
      setError('');

      const data = await getMedicationHistory({
        doctorId: currentUser.id,
        patientId: Number(patientId),
        startDate,
        endDate,
      });

      setHistory(data);
    } catch (loadError) {
      setHistory(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'No fue posible consultar el historial de medicamentos.'
      );
    } finally {
      setLoadingHistory(false);
    }
  }, [currentUser.id, endDate, patientId, startDate]);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    if (patientId) {
      void loadHistory();
    }
  }, [patientId, loadHistory]);

  const pieData = useMemo(() => {
    if (!history) {
      return [];
    }

    return [
      {
        name: 'Tomadas',
        value: history.summary.takenDoses,
        color: '#16a34a',
      },
      {
        name: 'Omitidas',
        value: history.summary.missedDoses,
        color: '#dc2626',
      },
      {
        name: 'Pendientes',
        value: history.summary.pendingDoses,
        color: '#f59e0b',
      },
    ].filter((item) => item.value > 0);
  }, [history]);

  return (
    <div className="medication-history-page">
      <header className="medication-history-header">
        <div>
          <span className="medication-history-eyebrow">
            Seguimiento terapéutico
          </span>

          <h1>Historial de medicamentos</h1>

          <p>
            Consulta las dosis programadas, tomadas y omitidas para evaluar el
            cumplimiento de cada tratamiento.
          </p>
        </div>

        <div className="medication-history-header-icon">
          <BarChart3 size={30} />
        </div>
      </header>

      <section className="medication-history-filters">
        <div className="medication-history-filter-field patient-field">
          <label htmlFor="history-patient">
            <UserRound size={17} />
            Paciente
          </label>

          <select
            id="history-patient"
            value={patientId}
            disabled={loadingPatients || patients.length === 0}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              setPatientId(event.target.value)
            }
          >
            {patients.length === 0 && (
              <option value="">Sin pacientes con tratamientos</option>
            )}

            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name} · {patient.recordNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="medication-history-filter-field">
          <label htmlFor="history-start-date">
            <CalendarDays size={17} />
            Desde
          </label>

          <input
            id="history-start-date"
            type="date"
            value={startDate}
            max={endDate}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setStartDate(event.target.value)
            }
          />
        </div>

        <div className="medication-history-filter-field">
          <label htmlFor="history-end-date">
            <CalendarDays size={17} />
            Hasta
          </label>

          <input
            id="history-end-date"
            type="date"
            value={endDate}
            min={startDate}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setEndDate(event.target.value)
            }
          />
        </div>

        <button
          type="button"
          className="medication-history-search-button"
          disabled={!patientId || loadingHistory}
          onClick={() => void loadHistory()}
        >
          {loadingHistory ? <Loader2 className="spin" size={18} /> : <Search size={18} />}
          Consultar
        </button>
      </section>

      {error && <div className="form-alert error">{error}</div>}

      {loadingPatients && (
        <div className="medication-history-state">
          <Loader2 className="spin" size={24} />
          Cargando pacientes...
        </div>
      )}

      {!loadingPatients && patients.length === 0 && (
        <div className="medication-history-state">
          <Pill size={30} />
          <strong>No hay tratamientos para consultar.</strong>
          <span>
            Los pacientes aparecerán cuando tengan una receta con horarios de
            medicamento registrada por este médico.
          </span>
        </div>
      )}

      {loadingHistory && (
        <div className="medication-history-state">
          <Loader2 className="spin" size={24} />
          Calculando estadísticas de cumplimiento...
        </div>
      )}

      {!loadingHistory && history && (
        <>
          <section className="medication-history-patient-card">
            <div className="medication-history-patient-avatar">
              {history.patient.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <span>Paciente seleccionado</span>
              <h2>{history.patient.name}</h2>
              <p>
                {history.patient.recordNumber}
                {history.patient.email ? ` · ${history.patient.email}` : ''}
              </p>
            </div>

            <div className="medication-history-period-badge">
              <CalendarDays size={17} />
              {history.period.startDate} al {history.period.endDate}
            </div>
          </section>

          <section className="medication-history-summary-grid">
            <article className="medication-history-summary-card primary">
              <div className="medication-history-summary-icon">
                <BarChart3 size={23} />
              </div>

              <div>
                <span>Adherencia terapéutica</span>
                <strong>{history.summary.adherencePercentage}%</strong>
                <p>
                  {history.summary.takenDoses} de{' '}
                  {history.summary.evaluatedDoses} dosis evaluadas.
                </p>
              </div>
            </article>

            <article className="medication-history-summary-card success">
              <div className="medication-history-summary-icon">
                <CheckCircle2 size={23} />
              </div>

              <div>
                <span>Dosis tomadas</span>
                <strong>{history.summary.takenDoses}</strong>
                <p>Registradas por el paciente como tomadas.</p>
              </div>
            </article>

            <article className="medication-history-summary-card danger">
              <div className="medication-history-summary-icon">
                <TriangleAlert size={23} />
              </div>

              <div>
                <span>Dosis omitidas</span>
                <strong>{history.summary.missedDoses}</strong>
                <p>Dosis vencidas o registradas como omitidas.</p>
              </div>
            </article>

            <article className="medication-history-summary-card warning">
              <div className="medication-history-summary-icon">
                <Clock3 size={23} />
              </div>

              <div>
                <span>Dosis pendientes</span>
                <strong>{history.summary.pendingDoses}</strong>
                <p>Programadas para una fecha u hora futura.</p>
              </div>
            </article>
          </section>

          {history.summary.totalScheduled === 0 ? (
            <div className="medication-history-state">
              <Pill size={30} />
              <strong>No hay dosis en el período seleccionado.</strong>
              <span>Modifica las fechas para consultar otro intervalo.</span>
            </div>
          ) : (
            <>
              <section className="medication-history-charts-grid">
                <article className="medication-history-panel">
                  <div className="medication-history-panel-heading">
                    <div>
                      <h2>Cumplimiento diario</h2>
                      <p>Dosis tomadas y omitidas por fecha.</p>
                    </div>
                  </div>

                  <div className="medication-history-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={history.daily}>
                        <CartesianGrid
                          strokeDasharray="4 4"
                          vertical={false}
                          stroke="#e2e8f0"
                        />

                        <XAxis
                          dataKey="label"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 12 }}
                        />

                        <YAxis
                          allowDecimals={false}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 12 }}
                        />

                        <Tooltip
                          contentStyle={{
                            borderRadius: 14,
                            border: '1px solid #dbe5f0',
                          }}
                        />

                        <Legend />

                        <Bar
                          dataKey="taken"
                          name="Tomadas"
                          stackId="doses"
                          fill="#16a34a"
                          radius={[6, 6, 0, 0]}
                        />

                        <Bar
                          dataKey="missed"
                          name="Omitidas"
                          stackId="doses"
                          fill="#dc2626"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </article>

                <article className="medication-history-panel">
                  <div className="medication-history-panel-heading">
                    <div>
                      <h2>Distribución de dosis</h2>
                      <p>Estado general del período consultado.</p>
                    </div>
                  </div>

                  <div className="medication-history-donut-wrap">
                    <div className="medication-history-donut">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={68}
                            outerRadius={94}
                            paddingAngle={4}
                            stroke="none"
                          >
                            {pieData.map((item) => (
                              <Cell key={item.name} fill={item.color} />
                            ))}
                          </Pie>

                          <Tooltip
                            contentStyle={{
                              borderRadius: 14,
                              border: '1px solid #dbe5f0',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="medication-history-donut-center">
                        <strong>{history.summary.totalScheduled}</strong>
                        <span>Programadas</span>
                      </div>
                    </div>

                    <div className="medication-history-legend">
                      {pieData.map((item) => (
                        <div key={item.name}>
                          <span style={{ backgroundColor: item.color }} />
                          <p>{item.name}</p>
                          <strong>{item.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              </section>

              <section className="medication-history-panel">
                <div className="medication-history-panel-heading">
                  <div>
                    <h2>Cumplimiento por medicamento</h2>
                    <p>
                      Comparativo del porcentaje de adherencia de cada
                      tratamiento.
                    </p>
                  </div>
                </div>

                <div className="medication-history-table-wrap">
                  <table className="medication-history-table">
                    <thead>
                      <tr>
                        <th>Medicamento</th>
                        <th>Programadas</th>
                        <th>Tomadas</th>
                        <th>Omitidas</th>
                        <th>Pendientes</th>
                        <th>Adherencia</th>
                      </tr>
                    </thead>

                    <tbody>
                      {history.byMedicine.map((medicine) => (
                        <tr key={`${medicine.medicineId}-${medicine.medicineName}`}>
                          <td>
                            <div className="medication-history-medicine-cell">
                              <Pill size={18} />

                              <div>
                                <strong>{medicine.medicineName}</strong>
                                <span>
                                  {medicine.medicineCode ?? 'Sin código'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>{medicine.scheduled}</td>
                          <td>{medicine.taken}</td>
                          <td>{medicine.missed}</td>
                          <td>{medicine.pending}</td>
                          <td>
                            <div className="medication-history-progress-cell">
                              <div>
                                <span
                                  style={{
                                    width: `${medicine.adherencePercentage}%`,
                                  }}
                                />
                              </div>
                              <strong>{medicine.adherencePercentage}%</strong>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="medication-history-panel">
                <div className="medication-history-panel-heading">
                  <div>
                    <h2>Detalle de dosis</h2>
                    <p>
                      Historial de horarios y confirmaciones registradas por el
                      paciente.
                    </p>
                  </div>
                </div>

                <div className="medication-history-table-wrap">
                  <table className="medication-history-table dose-table">
                    <thead>
                      <tr>
                        <th>Fecha programada</th>
                        <th>Medicamento</th>
                        <th>Dosis / frecuencia</th>
                        <th>Estado</th>
                        <th>Registro de toma</th>
                        <th>Receta</th>
                      </tr>
                    </thead>

                    <tbody>
                      {history.doses.map((dose) => (
                        <tr key={dose.id}>
                          <td>{formatDateTime(dose.scheduledAt)}</td>
                          <td>
                            <strong>{dose.medicineName}</strong>
                          </td>
                          <td>
                            {dose.dosage ?? 'Sin dosis'}
                            <span className="medication-history-table-secondary">
                              {dose.frequency ?? 'Sin frecuencia'}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`medication-history-status ${dose.status.toLowerCase()}`}
                            >
                              {STATUS_LABELS[dose.status]}
                            </span>
                          </td>
                          <td>{formatDateTime(dose.takenAt)}</td>
                          <td>{dose.prescriptionFolio ?? `#${dose.prescriptionId}`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default MedicationHistoryPage;
