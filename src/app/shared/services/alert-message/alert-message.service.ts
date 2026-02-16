import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface NotificationPayload {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  text: string;
  durationMs?: number;
}

export interface Notification extends Omit<NotificationPayload, 'durationMs'> {
  durationMs: number;
}

export const SUCCESS_NOTIFICATION_DURATION_MS = 2000;
export const ERROR_ALERT_NOTIFICATION_DURATION_MS = 4000;
export const INFO_NOTIFICATION_DURATION_MS = 4000;

export function getDefaultNotificationDuration(type: NotificationPayload['type']): number {
  if (type === 'success') return SUCCESS_NOTIFICATION_DURATION_MS;
  if (type === 'info') return INFO_NOTIFICATION_DURATION_MS;
  return ERROR_ALERT_NOTIFICATION_DURATION_MS;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notificationSubject = new Subject<Notification>();
  notification$ = this.notificationSubject.asObservable();

  success(
    text: string,
    title: string = 'Sucesso',
    durationMs: number = SUCCESS_NOTIFICATION_DURATION_MS
  ) {
    this.notificationSubject.next({ type: 'success', title, text, durationMs });
  }

  error(
    text: string,
    title: string = 'Erro',
    durationMs: number = ERROR_ALERT_NOTIFICATION_DURATION_MS
  ) {
    this.notificationSubject.next({ type: 'error', title, text, durationMs });
  }

  warning(
    text: string,
    title: string = 'Atenção',
    durationMs: number = ERROR_ALERT_NOTIFICATION_DURATION_MS
  ) {
    this.notificationSubject.next({ type: 'warning', title, text, durationMs });
  }

  info(
    text: string,
    title: string = 'Informação',
    durationMs: number = INFO_NOTIFICATION_DURATION_MS
  ) {
    this.notificationSubject.next({ type: 'info', title, text, durationMs });
  }

  showDefault(
    message: NotificationPayload,
    durationMs: number = getDefaultNotificationDuration(message.type)
  ) {
    this.notificationSubject.next({
      ...message,
      durationMs: message.durationMs ?? durationMs
    });
  }
}