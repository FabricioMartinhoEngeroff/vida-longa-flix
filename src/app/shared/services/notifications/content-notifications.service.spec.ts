import { TestBed } from '@angular/core/testing';
import { ContentNotificationsService } from './content-notifications.service';

describe('ContentNotificationsService', () => {
  let service: ContentNotificationsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContentNotificationsService);
    service.clear();
  });

  afterEach(() => {
    service.clear();
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('adds a notification and increments unread count', () => {
    expect(service.unreadCount()).toBe(0);
    service.add('VIDEO', 'Novo vídeo');
    expect(service.notifications().length).toBe(1);
    expect(service.unreadCount()).toBe(1);
    expect(service.notifications()[0].read).toBe(false);
  });

  it('marks all as read', () => {
    service.add('VIDEO', 'V1');
    service.add('MENU', 'M1');
    expect(service.unreadCount()).toBe(2);
    service.markAllRead();
    expect(service.unreadCount()).toBe(0);
    expect(service.notifications().every((n) => n.read)).toBe(true);
  });
});

