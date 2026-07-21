import { useEffect, useMemo, useState } from "react";

interface Props {
  schedules: any[];
  onMarkTaken: (id: number) => void;
}

export default function MedicationNotification({
  schedules,
  onMarkTaken,
}: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const nextSchedule = useMemo(() => {
    return schedules
      .filter((s) => s.status === "Pendiente")
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() -
          new Date(b.scheduledAt).getTime()
      )[0];
  }, [schedules]);

  if (!nextSchedule) {
    return (
      <div className="notification-card success">
        <h3>🎉 ¡Excelente!</h3>
        <p>No tienes medicamentos pendientes.</p>
      </div>
    );
  }

  const scheduleDate = new Date(nextSchedule.scheduledAt);

  const minutes = Math.floor(
    (scheduleDate.getTime() - now.getTime()) / 60000
  );

  let message = "";

  if (minutes > 60) {
    message = `Faltan ${Math.floor(minutes / 60)} h ${minutes % 60} min`;
  } else if (minutes > 0) {
    message = `Faltan ${minutes} minutos`;
  } else if (minutes >= -15) {
    message = "🔴 Es momento de tomar tu medicamento";
  } else {
    message = "⚠️ Toma atrasada";
  }

  return (
    <div className="notification-card">

      <h2>🔔 Próxima toma</h2>

      <h3>{nextSchedule.medicineName}</h3>

      <h1>
        {scheduleDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </h1>

      <p>{message}</p>

      {(minutes <= 0) && (
        <button
          className="schedule-button"
          onClick={() => onMarkTaken(nextSchedule.id)}
        >
          ✓ Marcar como tomado
        </button>
      )}

    </div>
  );
}