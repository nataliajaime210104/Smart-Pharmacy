import { useEffect, useMemo, useState } from 'react';

import type { MedicationSchedule } from '../../shared/types/medicationSchedule';

interface Props {
  schedules: MedicationSchedule[];
  onMarkTaken: (id: number) => void;
}

export default function MedicationNotification({
  schedules,
  onMarkTaken,
}: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  const nextSchedule = useMemo(() => {
    return [...schedules]
      .filter((schedule) => schedule.status === 'Pendiente')
      .sort(
        (first, second) =>
          new Date(first.scheduledAt).getTime() -
          new Date(second.scheduledAt).getTime()
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
    (scheduleDate.getTime() - now.getTime()) / 60_000
  );

  const message = (() => {
    if (minutes > 60) {
      return `Faltan ${Math.floor(minutes / 60)} h ${minutes % 60} min`;
    }

    if (minutes > 0) {
      return `Faltan ${minutes} minutos`;
    }

    if (minutes >= -15) {
      return '🔴 Es momento de tomar tu medicamento';
    }

    return '⚠️ Toma atrasada';
  })();

  return (
    <div className="notification-card">
      <h2>🔔 Próxima toma</h2>
      <h3>{nextSchedule.medicineName ?? 'Medicamento'}</h3>

      <h1>
        {scheduleDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </h1>

      <p>{message}</p>

      {minutes <= 0 && (
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
