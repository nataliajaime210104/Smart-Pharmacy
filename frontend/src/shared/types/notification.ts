export type NotificationSeverity =
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

export interface SmartNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  actionUrl: string;
  severity: NotificationSeverity;
  metadata: Record<string, unknown>;
  readAt: string | null;
  createdAt: string | null;
}

export interface NotificationListResponse {
  success: boolean;
  data: SmartNotification[];
  unreadCount: number;
}

export interface NotificationEventPayload {
  notification: SmartNotification;
}
