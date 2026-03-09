import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { SuccessMessageComponent } from './success-message.component';
import { NotificationService } from '../../services/alert-message/alert-message.service';

describe('SuccessMessageComponent', () => {
  let fixture: ComponentFixture<SuccessMessageComponent>;
  let component: SuccessMessageComponent;
  let notificationService: NotificationService;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [SuccessMessageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SuccessMessageComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('agenda atualizacao visual ao receber mensagem de sucesso', () => {
    const markForCheckSpy = vi.spyOn((component as any).cdr, 'markForCheck');

    notificationService.success('Importacao concluida com sucesso!', 'Sucesso', 1000);

    expect(component.visible).toBe(true);
    expect(component.text).toBe('Importacao concluida com sucesso!');
    expect(markForCheckSpy).toHaveBeenCalledTimes(1);
  });

  it('agenda atualizacao visual ao fechar apos o timeout', async () => {
    const markForCheckSpy = vi.spyOn((component as any).cdr, 'markForCheck');

    notificationService.success('Importacao concluida com sucesso!', 'Sucesso', 1000);

    await vi.advanceTimersByTimeAsync(1000);

    expect(component.visible).toBe(false);
    expect(markForCheckSpy).toHaveBeenCalledTimes(2);
  });
});
