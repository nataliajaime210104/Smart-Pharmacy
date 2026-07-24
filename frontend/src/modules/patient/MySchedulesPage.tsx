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
    startOfWeek,
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

        let background = "#facc15";

        if (event.resource.status === "Tomado") {

            background = "#22c55e";

        }

        if (event.resource.status === "Omitido") {

            background = "#ef4444";

        }

        return {

            style: {

                background,

                color: "#fff",

                border: "none",

                borderRadius: "10px",

                fontWeight: 600,

                padding: "3px",

            },

        };

    };
return (
    <div className="page-card">

        <h1>💊 Mis Horarios</h1>

        <p>
            Consulta tus medicamentos programados y registra cada toma.
        </p>

        <MedicationNotification
            schedules={schedules}
            onMarkTaken={handleTaken}
        />

        <div className="calendar-container">

            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                defaultView="month"
                views={["month", "week", "day"]}
                popup
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
                    noEventsInRange:
                        "No hay medicamentos programados."
                }}
            />

        </div>

        {selectedSchedule && (

            <div className="schedule-modal-overlay">

                <div className="schedule-modal">

                    <h2>
                        💊 {selectedSchedule.medicineName}
                    </h2>

                    <div className="modal-info">

                        <p>

                            <strong>Hora:</strong>{" "}

                            {new Date(
                                selectedSchedule.scheduledAt
                            ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}

                        </p>

                        <p>

                            <strong>Dosis:</strong>{" "}

                            {selectedSchedule.dosage}

                        </p>

                        <p>

                            <strong>Frecuencia:</strong>{" "}

                            {selectedSchedule.frequency}

                        </p>

                        <p>

                            <strong>Estado:</strong>{" "}

                            {selectedSchedule.status}

                        </p>

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
                        onClick={() =>
                            setSelectedSchedule(null)
                        }
                    >
                        Cerrar
                    </button>

                </div>

            </div>

        )}

    </div>
);
}