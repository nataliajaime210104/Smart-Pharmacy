import { useEffect, useState } from "react";
import type { User } from "../../shared/types";
import {
  getMySchedules,
  markScheduleAsTaken,
} from "./services/patient.service";


import "../../styles/my-schedules.css";

interface Props {
  user: User;
}
import MedicationNotification from "./MedicationNotification";
export default function MySchedulesPage({ user }: Props) {
  const [schedules, setSchedules] = useState<any[]>([]);

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
  }

  const groupedSchedules = schedules.reduce(
  (groups: Record<string, any[]>, schedule) => {
    const date = new Date(schedule.scheduledAt);

    const today = new Date();

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const scheduleDate = date.toDateString();

    let key = date.toLocaleDateString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    if (scheduleDate === today.toDateString()) {
      key = "📅 Hoy";
    } else if (scheduleDate === tomorrow.toDateString()) {
      key = "📅 Mañana";
    }

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(schedule);

    return groups;
  },
  {}
);

 return (
  <div className="page-card">

    <h1>💊 Mis Horarios</h1>

    <p>
      Consulta tus medicamentos programados y registra cada toma.
    </p>

    {schedules.length === 0 && (
      <p>No hay horarios registrados.</p>
    )}

    <MedicationNotification
        schedules={schedules}
        onMarkTaken={handleTaken}
    />

    {Object.entries(groupedSchedules).map(([day, items]) => (

  <div key={day}>

    <h2 className="day-title">
      {day}
    </h2>

    {items.map((schedule: any) => {

      const date = new Date(schedule.scheduledAt);

      const hour = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      let statusClass = "status-pending";

      if (schedule.status === "Tomado") {
        statusClass = "status-done";
      }

      if (schedule.status === "Omitido") {
        statusClass = "status-missed";
      }

      return (

     <div
    key={schedule.id}
    className={`schedule-card ${
        schedule.status === "Pendiente"
            ? "pending"
            : schedule.status === "Tomado"
            ? "done"
            : "missed"
    }`}
>       
            

          <div className="schedule-header">

            <h2>
              💊 {schedule.medicineName}
            </h2>

            <span
              className={`schedule-status ${statusClass}`}
            >
              {
                    schedule.status === "Pendiente"
                    ? "🟡 Pendiente"
                    : schedule.status === "Tomado"
                    ? "🟢 Tomado"
                    : "🔴 Omitido"
                    }
                                </span>

          </div>

                            <>
                    <div
                        style={{
                            fontSize:"42px",
                            marginBottom:"10px"
                        }}
                    >
                    🕗
                    </div>

                    <h1>{hour}</h1>
                    </>

          <div className="schedule-info">

            <div className="info-box">

              <span>Dosis</span>

              <strong>
                {schedule.dosage}
              </strong>

            </div>

            <div className="info-box">

              <span>Frecuencia</span>

              <strong>
                {schedule.frequency}
              </strong>

            </div>

          </div>

          {schedule.status === "Pendiente" && (

            <button
              className="schedule-button"
              onClick={() =>
                handleTaken(schedule.id)
              }
            >
              ✓ Marcar como tomado
            </button>

          )}

        </div>

      );

    })}

  </div>

))}

  </div>
);
}