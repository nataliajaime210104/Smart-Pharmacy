import { useCallback, useEffect, useState } from 'react';

import type { User } from '../../shared/types';
import type { MedicationSchedule } from '../../shared/types/medicationSchedule';

import MedicationNotification from './MedicationNotification';
import {
  getMySchedules,
  markScheduleAsTaken,
} from './services/patient.service';

import '../../styles/my-schedules.css';

interface Props {
  user: User;
}

export default function MySchedulesPage({ user }: Props) {
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getMySchedules(user.id);
      setSchedules(response.data ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'No fue posible cargar los horarios.'
      );
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    // Data fetching is intentionally triggered when the active patient changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSchedules();
  }, [loadSchedules]);

  async function handleTaken(id: number) {
    try {
      await markScheduleAsTaken(id);
      await loadSchedules();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'No fue posible actualizar el horario.'
      );
    }
  }

  const groupedSchedules = schedules.reduce<Record<string, MedicationSchedule[]>>(
    (groups, schedule) => {
      const date = new Date(schedule.scheduledAt);
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      const scheduleDate = date.toDateString();
      let key = date.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });

      if (scheduleDate === today.toDateString()) {
        key = '📅 Hoy';
      } else if (scheduleDate === tomorrow.toDateString()) {
        key = '📅 Mañana';
      }

      groups[key] ??= [];
      groups[key].push(schedule);

      return groups;
    },
    {}
  );

  return (
    <div className="page-card schedules-container">
      <div>
        <h1>💊 Mis horarios</h1>
        <p>Consulta tus medicamentos programados y registra cada toma.</p>
      </div>

      {error && <div className="patient-error-state">{error}</div>}

      {loading && <p>Cargando horarios...</p>}

      {!loading && schedules.length === 0 && (
        <p>No hay horarios registrados.</p>
      )}

      {!loading && schedules.length > 0 && (
        <MedicationNotification
          schedules={schedules}
          onMarkTaken={handleTaken}
        />
      )}

      {Object.entries(groupedSchedules).map(([day, items]) => (
        <section key={day}>
          <h2 className="day-title">{day}</h2>

          {items.map((schedule) => {
            const date = new Date(schedule.scheduledAt);
            const hour = date.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            const statusClass =
              schedule.status === 'Tomado'
                ? 'status-done'
                : schedule.status === 'Omitido'
                  ? 'status-missed'
                  : 'status-pending';

            const cardClass =
              schedule.status === 'Tomado'
                ? 'done'
                : schedule.status === 'Omitido'
                  ? 'missed'
                  : 'pending';

            return (
              <article
                key={schedule.id}
                className={`schedule-card ${cardClass}`}
              >
                <div className="schedule-header">
                  <h2>💊 {schedule.medicineName ?? 'Medicamento'}</h2>

                  <span className={`schedule-status ${statusClass}`}>
                    {schedule.status === 'Pendiente'
                      ? '🟡 Pendiente'
                      : schedule.status === 'Tomado'
                        ? '🟢 Tomado'
                        : '🔴 Omitido'}
                  </span>
                </div>

                <div className="schedule-time">
                  <div aria-hidden="true" style={{ fontSize: '42px' }}>🕗</div>
                  <h1>{hour}</h1>
                </div>

                <div className="schedule-info">
                  <div className="info-box">
                    <span>Dosis</span>
                    <strong>{schedule.dosage ?? 'No registrada'}</strong>
                  </div>

                  <div className="info-box">
                    <span>Frecuencia</span>
                    <strong>{schedule.frequency ?? 'No registrada'}</strong>
                  </div>
                </div>

                {schedule.status === 'Pendiente' && (
                  <button
                    className="schedule-button"
                    onClick={() => handleTaken(schedule.id)}
                  >
                    ✓ Marcar como tomado
                  </button>
                )}
              </article>
            );
          })}
        </section>
      ))}
    </div>
  );
}
