import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  dateFnsLocalizer,
  type EventPropGetter,
  type View,
} from 'react-big-calendar';
import {
  format,
  getDay,
  parse,
  startOfWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CalendarDays,
  Clock3,
  List,
  Pill,
  X,
} from 'lucide-react';

import type { User } from '../../shared/types';
import type { MedicationSchedule } from '../../shared/types/medicationSchedule';

import MedicationNotification from './MedicationNotification';
import {
  getMySchedules,
  markScheduleAsTaken,
} from './services/patient.service';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/my-schedules.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales: { es },
});

const calendarViews: View[] = ['month', 'week', 'day'];

type ScheduleView = 'calendar' | 'list';

type ScheduleCalendarEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: MedicationSchedule;
};

interface Props {
  user: User;
}

function getStatusClass(status: MedicationSchedule['status']) {
  if (status === 'Tomado') {
    return 'done';
  }

  if (status === 'Omitido') {
    return 'missed';
  }

  return 'pending';
}

function getStatusLabel(status: MedicationSchedule['status']) {
  if (status === 'Tomado') {
    return '🟢 Tomado';
  }

  if (status === 'Omitido') {
    return '🔴 Omitido';
  }

  return '🟡 Pendiente';
}

export default function MySchedulesPage({ user }: Props) {
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] =
    useState<MedicationSchedule | null>(null);
  const [activeView, setActiveView] = useState<ScheduleView>('calendar');
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
      setError('');
      await markScheduleAsTaken(id);
      setSelectedSchedule(null);
      await loadSchedules();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'No fue posible actualizar el horario.'
      );
    }
  }

  const events = useMemo<ScheduleCalendarEvent[]>(
    () =>
      schedules.map((schedule) => {
        const start = new Date(schedule.scheduledAt);

        return {
          id: schedule.id,
          title: schedule.medicineName ?? 'Medicamento',
          start,
          end: new Date(start.getTime() + 30 * 60_000),
          resource: schedule,
        };
      }),
    [schedules]
  );

  const eventStyleGetter: EventPropGetter<ScheduleCalendarEvent> = (event) => {
    const className = getStatusClass(event.resource.status);

    return {
      className: `schedule-calendar-event ${className}`,
    };
  };

  const groupedSchedules = useMemo(
    () =>
      schedules.reduce<Record<string, MedicationSchedule[]>>(
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
      ),
    [schedules]
  );

  return (
    <div className="page-card schedules-container patient-schedules-page">
      <header className="patient-schedules-heading">
        <div className="patient-schedules-title">
          <div className="patient-schedules-icon" aria-hidden="true">
            <Pill size={30} />
          </div>

          <div>
            <h1>Mis horarios</h1>
            <p>
              Consulta tus medicamentos programados y registra cada toma.
            </p>
          </div>
        </div>

        <div className="schedule-view-switch" aria-label="Vista de horarios">
          <button
            type="button"
            className={activeView === 'calendar' ? 'active' : ''}
            onClick={() => setActiveView('calendar')}
          >
            <CalendarDays size={17} />
            Calendario
          </button>

          <button
            type="button"
            className={activeView === 'list' ? 'active' : ''}
            onClick={() => setActiveView('list')}
          >
            <List size={17} />
            Lista
          </button>
        </div>
      </header>

      {error && <div className="patient-error-state">{error}</div>}

      {loading && <p>Cargando horarios...</p>}

      {!loading && schedules.length === 0 && (
        <div className="schedule-empty-state">
          <CalendarDays size={36} />
          <strong>No hay horarios registrados.</strong>
          <span>Los horarios aparecerán cuando exista una receta programada.</span>
        </div>
      )}

      {!loading && schedules.length > 0 && (
        <MedicationNotification
          schedules={schedules}
          onMarkTaken={handleTaken}
        />
      )}

      {!loading && schedules.length > 0 && activeView === 'calendar' && (
        <div className="patient-schedules-calendar">
          <Calendar<ScheduleCalendarEvent>
            localizer={localizer}
            culture="es"
            events={events}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            defaultView="month"
            views={calendarViews}
            popup
            className="medical-calendar"
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => setSelectedSchedule(event.resource)}
            messages={{
              today: 'Hoy',
              previous: 'Anterior',
              next: 'Siguiente',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              agenda: 'Agenda',
              date: 'Fecha',
              time: 'Hora',
              event: 'Medicamento',
              noEventsInRange: 'No hay medicamentos programados.',
              showMore: (count) => `+${count} más`,
            }}
          />
        </div>
      )}

      {!loading && schedules.length > 0 && activeView === 'list' && (
        <div className="schedule-list-view">
          {Object.entries(groupedSchedules).map(([day, items]) => (
            <section key={day}>
              <h2 className="day-title">{day}</h2>

              {items.map((schedule) => {
                const date = new Date(schedule.scheduledAt);
                const hour = date.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const cardClass = getStatusClass(schedule.status);

                return (
                  <article
                    key={schedule.id}
                    className={`schedule-card ${cardClass}`}
                  >
                    <div className="schedule-header">
                      <h2>💊 {schedule.medicineName ?? 'Medicamento'}</h2>

                      <span
                        className={`schedule-status status-${cardClass}`}
                      >
                        {getStatusLabel(schedule.status)}
                      </span>
                    </div>

                    <div className="schedule-time">
                      <Clock3 size={42} aria-hidden="true" />
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
                        type="button"
                        className="schedule-button"
                        onClick={() => void handleTaken(schedule.id)}
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
      )}

      {selectedSchedule && (
        <div
          className="schedule-modal-overlay"
          role="presentation"
          onClick={() => setSelectedSchedule(null)}
        >
          <section
            className="schedule-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="schedule-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="schedule-modal-close-icon"
              aria-label="Cerrar"
              onClick={() => setSelectedSchedule(null)}
            >
              <X size={20} />
            </button>

            <div className="schedule-modal-title">
              <div className="schedule-modal-pill" aria-hidden="true">
                <Pill size={22} />
              </div>

              <div>
                <h2 id="schedule-modal-title">
                  {selectedSchedule.medicineName ?? 'Medicamento'}
                </h2>
                <span>Información de la toma programada</span>
              </div>
            </div>

            <div className="schedule-modal-info">
              <div>
                <span>Hora</span>
                <strong>
                  {new Date(selectedSchedule.scheduledAt).toLocaleTimeString(
                    [],
                    { hour: '2-digit', minute: '2-digit' }
                  )}
                </strong>
              </div>

              <div>
                <span>Dosis</span>
                <strong>{selectedSchedule.dosage ?? 'No registrada'}</strong>
              </div>

              <div>
                <span>Frecuencia</span>
                <strong>{selectedSchedule.frequency ?? 'No registrada'}</strong>
              </div>

              <div>
                <span>Estado</span>
                <strong
                  className={`schedule-modal-status ${getStatusClass(
                    selectedSchedule.status
                  )}`}
                >
                  {selectedSchedule.status}
                </strong>
              </div>
            </div>

            {selectedSchedule.status === 'Pendiente' && (
              <button
                type="button"
                className="schedule-button"
                onClick={() => void handleTaken(selectedSchedule.id)}
              >
                ✓ Marcar como tomado
              </button>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
