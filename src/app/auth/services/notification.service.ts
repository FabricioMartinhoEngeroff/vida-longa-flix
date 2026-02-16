import { Injectable } from '@angular/core';
import {
  NotificationPayload,
  NotificationService as BaseNotificationService,
  getDefaultNotificationDuration as getBaseDuration,
} from '../../shared/services/alert-message/alert-message.service';

type NotificationDefault =
  | NotificationPayload
  | { type?: NotificationPayload['type']; title?: string; text?: string }
  | string;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private readonly notifications: BaseNotificationService) {}

  // Aceita mensagem string ou objeto NotificationPayload
  showDefault(message: NotificationDefault): void {
    if (typeof message === 'string') {
      this.notifications.info(message);
      return;
    }

    const typedMessage = message as NotificationPayload;
    this.notifications.showDefault(typedMessage);
  }

  warning(text: string): void {
    this.notifications.warning(text);
  }

  error(text: string): void {
    this.notifications.error(text);
  }

  success(text: string): void {
    this.notifications.success(text);
  }

  info(text: string): void {
    this.notifications.info(text);
  }
}

export function getDefaultNotificationDuration(
  type: 'success' | 'error' | 'warning' | 'info'
): number {
  return getBaseDuration(type);
}