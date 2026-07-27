import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from '../../../shared/services/api';
import type {
  NotificationListResponse,
  SmartNotification,
} from '../../../shared/types/notification';

export function getNotifications(limit = 30) {
  return apiGet<NotificationListResponse>(`/notifications?limit=${limit}`);
}

export function markNotificationAsRead(notificationId: string) {
  return apiPatch<{
    success: boolean;
    data: SmartNotification;
  }>(`/notifications/${notificationId}/read`, {});
}

export function markAllNotificationsAsRead() {
  return apiPatch<{ success: boolean; message: string }>(
    '/notifications/read-all',
    {},
  );
}

export function savePushSubscription(data: {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  contentEncoding: string;
}) {
  return apiPost<{ success: boolean; message: string }>(
    '/notifications/push-subscription',
    data,
  );
}

export function removePushSubscription(endpoint: string) {
  return apiDelete<{ success: boolean; message: string }>(
    '/notifications/push-subscription',
    { endpoint },
  );
}
