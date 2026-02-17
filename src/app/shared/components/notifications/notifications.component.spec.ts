import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { NotificationsComponent } from './notifications.component';

describe('NotificationsComponent', () => {
  let fixture: ComponentFixture<NotificationsComponent>;
  let component: NotificationsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call openNotifications on click', () => {
    const spy = vi.spyOn(component, 'openNotifications');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    button.click();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should show badge when unreadCount > 0', () => {
    component.unreadCount = 3;
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain('3');
  });

  it('should hide badge when unreadCount is 0', () => {
    component.unreadCount = 0;
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge).toBeFalsy();
  });
});
