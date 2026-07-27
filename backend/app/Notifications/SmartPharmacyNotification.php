<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;

class SmartPharmacyNotification extends Notification
{
    /**
     * @param array<string, mixed> $metadata
     */
    public function __construct(
        public readonly string $notificationType,
        public readonly string $title,
        public readonly string $body,
        public readonly string $actionUrl = '/',
        public readonly string $severity = 'info',
        public readonly array $metadata = [],
        public readonly ?string $pushTitle = null,
        public readonly ?string $pushBody = null,
    ) {
    }

    /**
     * La persistencia se realiza siempre en base de datos. El canal Web Push
     * se invoca por separado desde NotificationDispatcher para que una falla
     * externa no bloquee la operación principal del sistema.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return $this->payload();
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return $this->payload();
    }

    public function toWebPush(object $notifiable, Notification $notification): WebPushMessage
    {
        return (new WebPushMessage())
            ->title($this->pushTitle ?? $this->title)
            ->body($this->pushBody ?? $this->body)
            ->icon('/assets/icons/smartpharmacy-192.png')
            ->badge('/assets/icons/smartpharmacy-192.png')
            ->action('Abrir SmartPharmacy', 'open_smartpharmacy')
            ->data([
                'url' => $this->actionUrl,
                'type' => $this->notificationType,
            ])
            ->options([
                'TTL' => 3600,
            ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(): array
    {
        return [
            'type' => $this->notificationType,
            'title' => $this->title,
            'body' => $this->body,
            'actionUrl' => $this->actionUrl,
            'severity' => $this->severity,
            'metadata' => $this->metadata,
        ];
    }
}
