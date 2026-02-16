import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { InfoMessageComponent } from './info-message.component';
import { NotificationService } from '../../services/alert-message/alert-message.service';

describe('InfoMessageComponent', () => {
  let component: InfoMessageComponent;
  let fixture: ComponentFixture<InfoMessageComponent>;
  let notificationService: NotificationService;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [InfoMessageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoMessageComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should display info message received from service', () => {
    notificationService.info('Info text', 'Information', 1000);

    expect(component.visible).toBe(true);
    expect(component.text).toBe('Info text');
    expect(component.title).toBe('Information');
  });

  it('should hide automatically after duration', () => {
    notificationService.info('Text', 'Information', 1000);
    expect(component.visible).toBe(true);

    vi.advanceTimersByTime(1000);

    expect(component.visible).toBe(false);
  });

  it('should close manually when calling close()', () => {
    notificationService.info('Text', 'Information', 1000);
    component.close();

    expect(component.visible).toBe(false);
  });
});