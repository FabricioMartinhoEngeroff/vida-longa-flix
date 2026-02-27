import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { computed, signal } from '@angular/core';
import { vi } from 'vitest';

import { NotificationsComponent } from './notifications.component';
import { ContentNotificationsService } from '../../services/notifications/content-notifications.service';
import type { ContentNotification } from '../../services/notifications/content-notifications.service';

describe('NotificationsComponent', () => {
  let fixture: ComponentFixture<NotificationsComponent>;
  let component: NotificationsComponent;
  let notificationsMock: ContentNotificationsService;

  const routerMock = { navigateByUrl: vi.fn() };

  class ContentNotificationsMock {
    private readonly state = signal<ContentNotification[]>([]);
    readonly notifications = this.state.asReadonly();
    readonly unreadCount = computed(() => this.state().filter((n) => !n.read).length);

    add(type: 'VIDEO' | 'MENU', title: string) {
      this.state.update((current) => [
        {
          id: `${current.length + 1}`,
          type,
          title,
          createdAt: Date.now(),
          read: false,
          readAt: null,
        },
        ...current,
      ]);
    }

    markRead(id: string) {
      this.state.update((current) => current.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }

    markAllRead() {
      this.state.update((current) => current.map((n) => ({ ...n, read: true })));
    }

    clear() {
      this.state.set([]);
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ContentNotificationsService, useClass: ContentNotificationsMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    notificationsMock = TestBed.inject(ContentNotificationsService);
    notificationsMock.clear();
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens the panel and shows badge for unread notifications', async () => {
    notificationsMock.add('VIDEO', 'Novo vídeo');
    fixture.detectChanges();
    await fixture.whenStable();

    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain('1');

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-notifications');
    button.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.panel')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Minhas notificações');
  });

  it('marks all as read', async () => {
    notificationsMock.add('VIDEO', 'V1');
    notificationsMock.add('MENU', 'M1');
    fixture.detectChanges(false);
    await fixture.whenStable();

    component.openNotifications();
    fixture.detectChanges(false);
    component.markAllRead();
    fixture.detectChanges(false);
    await fixture.whenStable();

    expect(notificationsMock.unreadCount()).toBe(0);
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge).toBeFalsy();
  });
});
