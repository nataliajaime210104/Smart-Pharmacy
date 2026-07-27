import {
  removePushSubscription,
  savePushSubscription,
} from './services/notification.service';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

function currentContentEncoding(): string {
  const manager = PushManager as typeof PushManager & {
    supportedContentEncodings?: string[];
  };

  return manager.supportedContentEncodings?.[0] ?? 'aesgcm';
}

async function persistSubscription(subscription: PushSubscription): Promise<void> {
  const serialized = subscription.toJSON();

  if (!serialized.endpoint || !serialized.keys?.p256dh || !serialized.keys.auth) {
    throw new Error('El navegador no devolvió una suscripción válida.');
  }

  await savePushSubscription({
    endpoint: serialized.endpoint,
    keys: {
      p256dh: serialized.keys.p256dh,
      auth: serialized.keys.auth,
    },
    contentEncoding: currentContentEncoding(),
  });
}

export function pushNotificationsSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!pushNotificationsSupported()) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

/**
 * Vuelve a asociar una suscripción existente con el usuario autenticado.
 * Es útil cuando varias cuentas utilizan el mismo navegador o dispositivo.
 */
export async function syncCurrentPushSubscription(): Promise<boolean> {
  const subscription = await getCurrentPushSubscription();

  if (!subscription) {
    return false;
  }

  await persistSubscription(subscription);
  return true;
}

export async function enablePushNotifications(): Promise<void> {
  if (!pushNotificationsSupported()) {
    throw new Error('Este navegador no admite notificaciones push.');
  }

  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error('La llave pública VAPID no está configurada.');
  }

  const permission = await Notification.requestPermission();

  if (permission !== 'granted') {
    throw new Error('No se concedió permiso para mostrar notificaciones.');
  }

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  await persistSubscription(subscription);
}

export async function disablePushNotifications(): Promise<void> {
  const subscription = await getCurrentPushSubscription();

  if (!subscription) {
    return;
  }

  await removePushSubscription(subscription.endpoint);
  await subscription.unsubscribe();
}
