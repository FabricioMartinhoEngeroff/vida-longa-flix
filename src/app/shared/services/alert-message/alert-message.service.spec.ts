import { TestBed } from '@angular/core/testing';
import {
  ERROR_ALERT_NOTIFICATION_DURATION_MS,
  INFO_NOTIFICATION_DURATION_MS,
  SUCCESS_NOTIFICATION_DURATION_MS,
  Notification,
  NotificationService,
  getDefaultNotificationDuration,
} from './alert-message.service';
import { DEFAULT_MESSAGES } from './default-messages.constants';


describe('NotificationService', () => {
  let service: NotificationService;
  let notifications: Notification[];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
    notifications = [];
    service.notification$.subscribe((n) => notifications.push(n));
  });

  it('should return default duration by type', () => {
    expect(getDefaultNotificationDuration('success')).toBe(SUCCESS_NOTIFICATION_DURATION_MS);
    expect(getDefaultNotificationDuration('info')).toBe(INFO_NOTIFICATION_DURATION_MS);
    expect(getDefaultNotificationDuration('error')).toBe(ERROR_ALERT_NOTIFICATION_DURATION_MS);
    expect(getDefaultNotificationDuration('warning')).toBe(ERROR_ALERT_NOTIFICATION_DURATION_MS);
  });

  it('should emit success notification with default duration', () => {
    service.success('ok');

    const last = notifications.at(-1)!;
    expect(last.type).toBe('success');
    expect(last.text).toBe('ok');
    expect(last.durationMs).toBe(SUCCESS_NOTIFICATION_DURATION_MS);
  });

  it('should emit error and warning notifications', () => {
    service.error('failed');
    service.warning('attention');

    expect(notifications[0].type).toBe('error');
    expect(notifications[1].type).toBe('warning');
  });

  it('should respect durationMs from default message when provided', () => {
    service.showDefault({ ...DEFAULT_MESSAGES.LOGIN_SUCCESS, durationMs: 9999 });

    const last = notifications.at(-1)!;
    expect(last.durationMs).toBe(9999);
  });
});