import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

import { API_URL } from './api';
import { getAuthToken } from './auth-storage';

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;

type ReverbEcho = Echo<'reverb'>;

let echoInstance: ReverbEcho | null = null;

export function getRealtimeClient(): ReverbEcho | null {
  const key = import.meta.env.VITE_REVERB_APP_KEY;
  const host = import.meta.env.VITE_REVERB_HOST;
  const token = getAuthToken();

  if (!key || !host || !token) {
    return null;
  }

  if (!echoInstance) {
    const scheme = import.meta.env.VITE_REVERB_SCHEME ?? 'https';
    const port = Number(
      import.meta.env.VITE_REVERB_PORT ?? (scheme === 'https' ? 443 : 80),
    );

    echoInstance = new Echo<'reverb'>({
      broadcaster: 'reverb',
      key,
      wsHost: host,
      wsPort: port,
      wssPort: port,
      forceTLS: scheme === 'https',
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${API_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });
  }

  return echoInstance;
}

export function disconnectRealtime(): void {
  echoInstance?.disconnect();
  echoInstance = null;
}
