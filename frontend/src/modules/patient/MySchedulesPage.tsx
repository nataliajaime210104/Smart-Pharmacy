import { useEffect, useState } from "react";
import type { User } from "../../shared/types";

import {
    Calendar,
    dateFnsLocalizer,
} from "react-big-calendar";

import "react-big-calendar/lib/css/react-big-calendar.css";

import {
  format,
  parse,
  startOfWeek,
  getDay,
} from "date-fns";

import { es } from "date-fns/locale";

import {
    getMySchedules,
    markScheduleAsTaken,
} from "./services/patient.service";

import MedicationNotification from "./MedicationNotification";

import "../../styles/my-schedules.css";
const locales = {
    es,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { locale: es }),
    getDay,
    locales,
});

interface Props {
    user: User;
}
export default function MySchedulesPage({ user }: Props) {

    const [schedules, setSchedules] = useState<any[]>([]);

    const [selectedSchedule, setSelectedSchedule] =
        useState<any>(null);

    async function loadSchedules() {

        const response = await getMySchedules(user.id);

        if (response.success) {
            setSchedules(response.data);
        }

    }

    useEffect(() => {

        loadSchedules();

    }, []);

    async function handleTaken(id: number) {

        await markScheduleAsTaken(id);

        loadSchedules();

        setSelectedSchedule(null);

    }
    const events = schedules.map((schedule) => ({

        id: schedule.id,

        title: `${schedule.medicineName}`,

        start: new Date(schedule.scheduledAt),

        end: new Date(
            new Date(schedule.scheduledAt).getTime() +
                30 * 60000
        ),

        resource: schedule,

    }));
    const eventStyleGetter = (event: any) => {

    let background = "#3b82f6";

    if (event.resource.status === "Tomado") {
        background = "#22c55e";
    }

    if (event.resource.status === "Pendiente") {
        background = "#f59e0b";
    }

    if (event.resource.status === "Omitido") {
        background = "#ef4444";
    }

    return {
        style: {
            background,
            color: "#fff",
            border: "none",
            borderRadius: "18px",
            padding: "6px 10px",
            fontWeight: 600,
            boxShadow: "0 4px 10px rgba(0,0,0,.15)"
        },
    };
};
return (
  <div className="page-card">

    <div className="schedule-header">

        <div className="schedule-header-left">

            <div className="schedule-icon">
                💊
            </div>

            <div>
                <h1>Mis Horarios</h1>

                <p>
                    Consulta tus medicamentos programados y registra cada toma.
                </p>
            </div>

        </div>

        <div className="schedule-header-right">

            <span className="schedule-label">
                Próxima toma
            </span>

            <MedicationNotification
                schedules={schedules}
                onMarkTaken={handleTaken}
            />

        </div>

    </div>
        <div className="calendar-container">
          <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="month"
          views={["month", "week", "day"]}
          popup
          selectable
          className="medical-calendar"
          dayLayoutAlgorithm="no-overlap"
          style={{
            height: 700,
            marginTop: 20,
           }}
           eventPropGetter={eventStyleGetter}
           onSelectEvent={(event: any) =>
            setSelectedSchedule(event.resource)
           }
           messages={{
            today: "Hoy",
            previous: "Anterior",
            next: "Siguiente",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda",
            date: "Fecha",
            time: "Hora",
            event: "Medicamento",
            noEventsInRange: "No hay medicamentos programados.",
            }}
            />
          </div>
       {selectedSchedule && (
    <div
        className="schedule-modal-overlay"
        onClick={() => setSelectedSchedule(null)}
    >
        <div
            className="schedule-modal"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="modal-title">

                <div className="pill-icon">
                    💊
                </div>

                <div>
                    <h2>{selectedSchedule.medicineName}</h2>
                    <span>Información del medicamento</span>
                </div>

            </div>

            <div className="modal-info">

                <div className="info-card">
                    <span>🕒 Hora</span>

                    <strong>
                        {new Date(
                            selectedSchedule.scheduledAt
                        ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </strong>
                </div>

                <div className="info-card">
                    <span>💊 Dosis</span>

                    <strong>
                        {selectedSchedule.dosage}
                    </strong>
                </div>

                <div className="info-card">
                    <span>⏰ Frecuencia</span>

                    <strong>
                        {selectedSchedule.frequency}
                    </strong>
                </div>

                <div className="info-card">
                    <span>Estado</span>

                    <strong
                        className={`status ${
                            selectedSchedule.status === "Tomado"
                                ? "tomado"
                                : selectedSchedule.status === "Pendiente"
                                ? "pendiente"
                                : "omitido"
                        }`}
                    >
                        {selectedSchedule.status}
                    </strong>
                </div>

            </div>

            {selectedSchedule.status === "Pendiente" && (
                <button
                    className="schedule-button"
                    onClick={() =>
                        handleTaken(selectedSchedule.id)
                    }
                >
                    ✓ Marcar como tomado
                </button>
            )}

            <button
                className="schedule-close"
                onClick={() => setSelectedSchedule(null)}
            >
                Cerrar
            </button>
        </div>
    </div>
)}
    </div>
);
}