<?php

namespace App\Services;

use App\Events\UserNotificationCreated;
use App\Models\User;
use App\Notifications\SmartPharmacyNotification;
use Illuminate\Notifications\DatabaseNotification;
use NotificationChannels\WebPush\WebPushChannel;

class NotificationDispatcher
{
    public function send(User $user, SmartPharmacyNotification $notification): void
    {
        $user->notifyNow($notification, ['database']);

        /** @var DatabaseNotification|null $storedNotification */
        $storedNotification = $user->notifications()
            ->latest('created_at')
            ->first();

        if (!$storedNotification) {
            return;
        }

        if ($this->webPushIsConfigured() && $user->pushSubscriptions()->exists()) {
            try {
                $user->notifyNow($notification, [WebPushChannel::class]);
            } catch (\Throwable $exception) {
                report($exception);
            }
        }

        try {
            UserNotificationCreated::dispatch(
                $user->id,
                self::format($storedNotification),
            );
        } catch (\Throwable $exception) {
            // La notificación ya quedó almacenada. Una caída temporal de Reverb
            // no debe deshacer recetas, tomas ni movimientos de inventario.
            report($exception);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public static function format(DatabaseNotification $notification): array
    {
        $data = is_array($notification->data)
            ? $notification->data
            : [];

        return [
            'id' => $notification->id,
            'type' => (string) ($data['type'] ?? 'general'),
            'title' => (string) ($data['title'] ?? 'SmartPharmacy'),
            'body' => (string) ($data['body'] ?? ''),
            'actionUrl' => (string) ($data['actionUrl'] ?? '/'),
            'severity' => (string) ($data['severity'] ?? 'info'),
            'metadata' => is_array($data['metadata'] ?? null)
                ? $data['metadata']
                : [],
            'readAt' => $notification->read_at?->toIso8601String(),
            'createdAt' => $notification->created_at?->toIso8601String(),
        ];
    }

    private function webPushIsConfigured(): bool
    {
        return filled(config('webpush.vapid.public_key'))
            && filled(config('webpush.vapid.private_key'))
            && filled(config('webpush.vapid.subject'));
    }
}
