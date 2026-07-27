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
  AlarmClock,
  CalendarDays,
  Check,
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
    return 'Tomado';
  }

  if (status === 'Omitido') {
    return 'Omitido';
  }

  return 'Pendiente';
}

function formatScheduleTime(value: string) {
  return new Date(value).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
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

  const eventStyleGetter: EventPropGetter<ScheduleCalendarEvent> = (
    event: ScheduleCalendarEvent
  ) => ({
    className: `schedule-calendar-event ${getStatusClass(
      event.resource.status
    )}`,
  });

  const groupedSchedules = useMemo(() => {
    const orderedSchedules = [...schedules].sort(
      (first, second) =>
        new Date(first.scheduledAt).getTime() -
        new Date(second.scheduledAt).getTime()
    );

    return orderedSchedules.reduce<Record<string, MedicationSchedule[]>>(
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
          key = 'Hoy';
        } else if (scheduleDate === tomorrow.toDateString()) {
          key = 'Mañana';
        }

        groups[key] ??= [];
        groups[key].push(schedule);

        return groups;
      },
      {}
    );
  }, [schedules]);

  const scheduleStats = useMemo(
    () => ({
      pending: schedules.filter((schedule) => schedule.status === 'Pendiente')
        .length,
      done: schedules.filter((schedule) => schedule.status === 'Tomado').length,
      missed: schedules.filter((schedule) => schedule.status === 'Omitido')
        .length,
    }),
    [schedules]
  );

  return (
    <div className="patient-schedules-page">
      <section className="patient-schedules-hero">
        <div className="patient-schedules-title">
          <div className="patient-schedules-icon" aria-hidden="true">
            <Pill size={31} />
          </div>

          <div>
            <span className="patient-schedules-kicker">Tratamiento personal</span>
            <h1>Mis horarios</h1>
            <p>
              Consulta tus medicamentos programados y registra cada toma.
            </p>
          </div>
        </div>

        {!loading && schedules.length > 0 && (
          <div className="patient-schedules-next-dose">
            <MedicationNotification
              schedules={schedules}
              onMarkTaken={handleTaken}
            />
          </div>
        )}
      </section>

      <section className="patient-schedules-content">
        <div className="patient-schedules-toolbar">
          <div>
            <span className="patient-schedules-section-label">
              Agenda de medicamentos
            </span>
            <h2>Programa de tomas</h2>
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
        </div>

        {error && <div className="patient-error-state">{error}</div>}

        {loading && (
          <div className="schedule-loading-state">
            <span className="schedule-loading-spinner" aria-hidden="true" />
            Cargando horarios...
          </div>
        )}

        {!loading && schedules.length === 0 && (
          <div className="schedule-empty-state">
            <CalendarDays size={40} />
            <strong>No hay horarios registrados.</strong>
            <span>
              Los horarios aparecerán cuando exista una receta programada.
            </span>
          </div>
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
              onSelectEvent={(event: ScheduleCalendarEvent) =>
                setSelectedSchedule(event.resource)
              }
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
                showMore: (count: number) => `+${count} más`,
              }}
            />
          </div>
        )}

        {!loading && schedules.length > 0 && activeView === 'list' && (
          <div className="schedule-list-view">
            <div className="schedule-list-summary" aria-label="Resumen de tomas">
              <div className="pending">
                <span>Pendientes</span>
                <strong>{scheduleStats.pending}</strong>
              </div>
              <div className="done">
                <span>Tomados</span>
                <strong>{scheduleStats.done}</strong>
              </div>
              <div className="missed">
                <span>Omitidos</span>
                <strong>{scheduleStats.missed}</strong>
              </div>
            </div>

            {Object.entries(groupedSchedules).map(([day, items]) => (
              <section className="schedule-day-group" key={day}>
                <div className="day-title-row">
                  <div className="day-title-icon" aria-hidden="true">
                    <CalendarDays size={18} />
                  </div>
                  <h2 className="day-title">{day}</h2>
                  <span>{items.length} toma{items.length === 1 ? '' : 's'}</span>
                </div>

                <div className="schedule-day-grid">
                  {items.map((schedule) => {
                    const cardClass = getStatusClass(schedule.status);

                    return (
                      <article
                        key={schedule.id}
                        className={`schedule-card ${cardClass}`}
                      >
                        <div className="schedule-card-topline" aria-hidden="true" />

                        <div className="schedule-header">
                          <div className="schedule-medicine-title">
                            <div className="schedule-medicine-icon">
                              <Pill size={22} />
                            </div>

                            <div>
                              <span>Medicamento</span>
                              <h3
                                title={schedule.medicineName ?? 'Medicamento'}
                              >
                                {schedule.medicineName ?? 'Medicamento'}
                              </h3>
                            </div>
                          </div>

                          <span
                            className={`schedule-status status-${cardClass}`}
                          >
                            {getStatusLabel(schedule.status)}
                          </span>
                        </div>

                        <div className="schedule-time-block">
                          <div className="schedule-time-icon" aria-hidden="true">
                            <Clock3 size={20} />
                          </div>
                          <div>
                            <span>Hora programada</span>
                            <strong>
                              {formatScheduleTime(schedule.scheduledAt)}
                            </strong>
                          </div>
                        </div>

                        <div className="schedule-info">
                          <div className="info-box">
                            <div className="info-box-icon" aria-hidden="true">
                              <Pill size={17} />
                            </div>
                            <div>
                              <span>Dosis</span>
                              <strong
                                title={schedule.dosage ?? 'No registrada'}
                              >
                                {schedule.dosage ?? 'No registrada'}
                              </strong>
                            </div>
                          </div>

                          <div className="info-box">
                            <div className="info-box-icon" aria-hidden="true">
                              <AlarmClock size={17} />
                            </div>
                            <div>
                              <span>Frecuencia</span>
                              <strong
                                title={schedule.frequency ?? 'No registrada'}
                              >
                                {schedule.frequency ?? 'No registrada'}
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div className="schedule-card-actions">
                          <button
                            type="button"
                            className="schedule-details-button"
                            onClick={() => setSelectedSchedule(schedule)}
                          >
                            Ver detalles
                          </button>

                          {schedule.status === 'Pendiente' && (
                            <button
                              type="button"
                              className="schedule-button"
                              onClick={() => void handleTaken(schedule.id)}
                            >
                              <Check size={17} />
                              Marcar como tomado
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

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
                <Pill size={23} />
              </div>

              <div>
                <h2 id="schedule-modal-title">
                  {selectedSchedule.medicineName ?? 'Medicamento'}
                </h2>
                <span>Información del medicamento</span>
              </div>
            </div>

            <div className="schedule-modal-info">
              <div>
                <span>
                  <Clock3 size={17} />
                  Hora
                </span>
                <strong>
                  {formatScheduleTime(selectedSchedule.scheduledAt)}
                </strong>
              </div>

              <div>
                <span>
                  <Pill size={17} />
                  Dosis
                </span>
                <strong>{selectedSchedule.dosage ?? 'No registrada'}</strong>
              </div>

              <div>
                <span>
                  <AlarmClock size={17} />
                  Frecuencia
                </span>
                <strong>
                  {selectedSchedule.frequency ?? 'No registrada'}
                </strong>
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
                className="schedule-button schedule-modal-primary"
                onClick={() => void handleTaken(selectedSchedule.id)}
              >
                <Check size={17} />
                Marcar como tomado
              </button>
            )}

            <button
              type="button"
              className="schedule-modal-secondary"
              onClick={() => setSelectedSchedule(null)}
            >
              Cerrar
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
