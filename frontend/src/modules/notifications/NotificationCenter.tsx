import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  BellRing,
  CheckCheck,
  CheckCircle2,
  ClipboardList,
  Pill,
  Smartphone,
  TriangleAlert,
  X,
} from 'lucide-react';

import type { User } from '../../shared/types';
import type {
  NotificationEventPayload,
  SmartNotification,
} from '../../shared/types/notification';
import { getRealtimeClient } from '../../shared/services/realtime';
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from './services/notification.service';
import {
  disablePushNotifications,
  enablePushNotifications,
  pushNotificationsSupported,
  syncCurrentPushSubscription,
} from './push-notifications';

interface Props {
  user: User;
}

function notificationIcon(notification: SmartNotification) {
  if (notification.type === 'medication_due') {
    return <Pill size={19} />;
  }

  if (notification.type === 'prescription_ready') {
    return <ClipboardList size={19} />;
  }

  if (notification.type.startsWith('inventory_') || notification.type === 'medicine_inactive') {
    return <TriangleAlert size={19} />;
  }

  if (notification.type === 'medication_taken') {
    return <CheckCircle2 size={19} />;
  }

  return <BellRing size={19} />;
}

function formatNotificationDate(value: string | null): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const elapsedSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat('es-MX', { numeric: 'auto' });

  if (Math.abs(elapsedSeconds) < 60) {
    return formatter.format(elapsedSeconds, 'second');
  }

  const elapsedMinutes = Math.round(elapsedSeconds / 60);

  if (Math.abs(elapsedMinutes) < 60) {
    return formatter.format(elapsedMinutes, 'minute');
  }

  const elapsedHours = Math.round(elapsedMinutes / 60);

  if (Math.abs(elapsedHours) < 24) {
    return formatter.format(elapsedHours, 'hour');
  }

  const elapsedDays = Math.round(elapsedHours / 24);
  return formatter.format(elapsedDays, 'day');
}

function NotificationCenter({ user }: Props) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushMessage, setPushMessage] = useState('');
  const [toast, setToast] = useState<SmartNotification | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const pushSupported = useMemo(() => pushNotificationsSupported(), []);

  const loadNotifications = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const response = await getNotifications();
      setNotifications(response.data ?? []);
      setUnreadCount(response.unreadCount ?? 0);
    } catch (error) {
      if (!silent) {
        setPushMessage(
          error instanceof Error
            ? error.message
            : 'No fue posible cargar las notificaciones.',
        );
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadNotifications();

    if (pushSupported) {
      void syncCurrentPushSubscription()
        .then(setPushEnabled)
        .catch(() => setPushEnabled(false));
    }

    const pollingId = window.setInterval(() => {
      void loadNotifications(true);
    }, 60_000);

    return () => window.clearInterval(pollingId);
  }, [pushSupported, user.id]);

  useEffect(() => {
    const realtime = getRealtimeClient();

    if (!realtime) {
      return undefined;
    }

    const channelName = `users.${user.id}`;
    const channel = realtime.private(channelName);

    channel.listen(
      '.notification.created',
      (payload: NotificationEventPayload) => {
        const incoming = payload.notification;

        setNotifications((current) => [
          incoming,
          ...current.filter((item) => item.id !== incoming.id),
        ].slice(0, 50));
        setUnreadCount((current) => current + 1);
        setToast(incoming);
      },
    );

    return () => {
      realtime.leave(channelName);
    };
  }, [user.id]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 6500);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleOpenNotification = async (notification: SmartNotification) => {
    if (!notification.readAt) {
      try {
        const response = await markNotificationAsRead(notification.id);

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id ? response.data : item,
          ),
        );
        setUnreadCount((current) => Math.max(current - 1, 0));
      } catch {
        // La navegación sigue disponible aunque el marcado falle temporalmente.
      }
    }

    window.location.assign(notification.actionUrl || '/');
  };

  const handleMarkAll = async () => {
    await markAllNotificationsAsRead();
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        readAt: notification.readAt ?? new Date().toISOString(),
      })),
    );
    setUnreadCount(0);
  };

  const handleTogglePush = async () => {
    try {
      setPushLoading(true);
      setPushMessage('');

      if (pushEnabled) {
        await disablePushNotifications();
        setPushEnabled(false);
        setPushMessage('Avisos del dispositivo desactivados.');
      } else {
        await enablePushNotifications();
        setPushEnabled(true);
        setPushMessage('Avisos del dispositivo activados.');
      }
    } catch (error) {
      setPushMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible cambiar la configuración de avisos.',
      );
    } finally {
      setPushLoading(false);
    }
  };

  return (
    <div className="notification-center" ref={rootRef}>
      <button
        type="button"
        className="notification-bell-button"
        aria-label="Abrir notificaciones"
        onClick={() => setOpen((current) => !current)}
      >
        <Bell size={21} />
        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section className="notification-panel" aria-label="Centro de notificaciones">
          <header className="notification-panel-header">
            <div>
              <span>Centro de avisos</span>
              <h4>Notificaciones</h4>
            </div>

            <div className="notification-header-actions">
              {unreadCount > 0 && (
                <button type="button" onClick={() => void handleMarkAll()}>
                  <CheckCheck size={17} />
                  Leer todas
                </button>
              )}

              <button
                type="button"
                className="notification-close-button"
                aria-label="Cerrar notificaciones"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
          </header>

          <div className="notification-device-box">
            <Smartphone size={20} />
            <div>
              <strong>
                {pushEnabled
                  ? 'Avisos del dispositivo activos'
                  : 'Recibir avisos en este dispositivo'}
              </strong>
              <span>
                Funciona en computadora y Android. En iPhone debe agregarse la app a la pantalla de inicio.
              </span>
            </div>

            <button
              type="button"
              disabled={!pushSupported || pushLoading}
              onClick={() => void handleTogglePush()}
            >
              {pushLoading
                ? 'Procesando...'
                : pushEnabled
                  ? 'Desactivar'
                  : 'Activar'}
            </button>
          </div>

          {pushMessage && (
            <div className="notification-inline-message">
              {pushMessage}
            </div>
          )}

          <div className="notification-list">
            {loading ? (
              <div className="notification-empty">Cargando notificaciones...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <Bell size={28} />
                <strong>No tienes notificaciones</strong>
                <span>Los recordatorios y avisos aparecerán aquí.</span>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  className={`notification-item ${notification.readAt ? '' : 'unread'} severity-${notification.severity}`}
                  onClick={() => void handleOpenNotification(notification)}
                >
                  <span className="notification-item-icon">
                    {notificationIcon(notification)}
                  </span>

                  <span className="notification-item-content">
                    <strong>{notification.title}</strong>
                    <span>{notification.body}</span>
                    <small>{formatNotificationDate(notification.createdAt)}</small>
                  </span>

                  {!notification.readAt && <i className="notification-unread-dot" />}
                </button>
              ))
            )}
          </div>
        </section>
      )}

      {toast && (
        <div className={`notification-toast severity-${toast.severity}`}>
          <span className="notification-toast-icon">
            {toast.severity === 'danger' || toast.severity === 'warning'
              ? <TriangleAlert size={20} />
              : notificationIcon(toast)}
          </span>
          <div>
            <strong>{toast.title}</strong>
            <span>{toast.body}</span>
          </div>
          <button type="button" aria-label="Cerrar aviso" onClick={() => setToast(null)}>
            <X size={17} />
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
