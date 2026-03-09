import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { PasswordRecoveryComponent } from './password-recovery.component';
import { EmailService } from '../../services/email/email.service';
import { LoggerService } from '../../services/logger.service';

describe('PasswordRecoveryComponent — Login & Register Scenarios', () => {
  let component: PasswordRecoveryComponent;
  let fixture: ComponentFixture<PasswordRecoveryComponent>;

  const emailMock = {
    sendPasswordRecovery: vi.fn().mockResolvedValue(undefined),
  };

  const loggerMock = { log: vi.fn(), warn: vi.fn(), error: vi.fn() };

  function cd(): void {
    fixture.componentRef.changeDetectorRef.detectChanges();
  }

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [PasswordRecoveryComponent],
      providers: [
        { provide: EmailService, useValue: emailMock },
        { provide: LoggerService, useValue: loggerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordRecoveryComponent);
    component = fixture.componentInstance;
    cd();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─── B22. Renderizacao ───────────────────────────────────────

  describe('B22. Renderizacao', () => {
    it('#131 [open]="false" — modal nao renderizado', () => {
      component.open = false;
      cd();

      const container = fixture.nativeElement.querySelector('.recovery-container');
      expect(container).toBeFalsy();
    });

    it('#132 [open]="true" — modal renderizado com titulo e subtitulo', () => {
      component.open = true;
      cd();

      const title = fixture.nativeElement.querySelector('.title');
      expect(title.textContent).toContain('Recuperar Senha');

      const subtitle = fixture.nativeElement.querySelector('.subtitle');
      expect(subtitle.textContent).toContain('Digite seu e-mail para receber o link de recuperação');
    });

    it('#133 campo e-mail presente', () => {
      component.open = true;
      cd();

      const emailInput = fixture.nativeElement.querySelector('app-form-field');
      expect(emailInput).toBeTruthy();
    });

    it('#134 botao "Enviar Link de Recuperacao" presente', () => {
      component.open = true;
      cd();

      const btn = fixture.nativeElement.querySelector('app-primary-button');
      expect(btn).toBeTruthy();
    });

    it('#135 link "Voltar para o Login" presente', () => {
      component.open = true;
      cd();

      const backBtn = fixture.nativeElement.querySelector('.link-button');
      expect(backBtn).toBeTruthy();
      expect(backBtn.textContent).toContain('Voltar para o Login');
    });
  });

  // ─── B23. Validacao ──────────────────────────────────────────

  describe('B23. Validacao', () => {
    it('#136 submeter com e-mail vazio — form invalido, retorna early', async () => {
      component.open = true;
      cd();

      component.recoveryForm.setValue({ email: '' });
      await component.onSubmit();

      expect(emailMock.sendPasswordRecovery).not.toHaveBeenCalled();
      expect(component.recoveryForm.get('email')!.touched).toBe(true);
    });

    it('#137 e-mail invalido, campo tocado — form invalido', () => {
      const ctrl = component.recoveryForm.get('email')!;
      ctrl.setValue('invalido');
      ctrl.markAsTouched();

      expect(ctrl.invalid).toBe(true);
    });

    it('#138 form invalido desabilita submissao', () => {
      component.recoveryForm.setValue({ email: '' });
      expect(component.recoveryForm.invalid).toBe(true);
    });
  });

  // ─── B24. Submissao com sucesso ──────────────────────────────

  describe('B24. Submissao com sucesso', () => {
    it('#139 submeter com e-mail valido — loading=true, chama emailService', async () => {
      component.open = true;
      cd();
      component.recoveryForm.setValue({ email: 'user@example.com' });

      const p = component.onSubmit();
      expect(component.loading).toBe(true);

      await p;
      expect(emailMock.sendPasswordRecovery).toHaveBeenCalledWith('user@example.com');
    });

    it('#140 sucesso — exibe mensagem de sucesso', async () => {
      component.open = true;
      cd();
      component.recoveryForm.setValue({ email: 'user@example.com' });

      await component.onSubmit();

      expect(component.successMessage).toBe('Link de recuperação enviado. Verifique seu e-mail.');
    });

    it('#141 apos sucesso, auto-fecha apos 2 segundos', async () => {
      component.open = true;
      cd();
      component.recoveryForm.setValue({ email: 'user@example.com' });

      const closeSpy = vi.spyOn(component.close, 'emit');

      await component.onSubmit();

      vi.advanceTimersByTime(2000);

      expect(closeSpy).toHaveBeenCalled();
    });

    it('#142 loading reseta apos sucesso', async () => {
      component.open = true;
      cd();
      component.recoveryForm.setValue({ email: 'user@example.com' });

      await component.onSubmit();

      expect(component.loading).toBe(false);
    });
  });

  // ─── B25. Tratamento de erros ────────────────────────────────

  describe('B25. Tratamento de erros', () => {
    it('#143 backend falha — exibe mensagem de erro', async () => {
      emailMock.sendPasswordRecovery.mockRejectedValueOnce(new Error('Network error'));

      component.open = true;
      cd();
      component.recoveryForm.setValue({ email: 'user@example.com' });

      await component.onSubmit();

      expect(component.errorMessage).toBe('Não foi possível enviar o e-mail. Tente novamente.');
    });

    it('#144 erro logado no logger', async () => {
      emailMock.sendPasswordRecovery.mockRejectedValueOnce(new Error('Timeout'));

      component.open = true;
      cd();
      component.recoveryForm.setValue({ email: 'user@example.com' });

      await component.onSubmit();

      expect(loggerMock.error).toHaveBeenCalled();
    });

    it('#145 loading reseta apos erro', async () => {
      emailMock.sendPasswordRecovery.mockRejectedValueOnce(new Error('Error'));

      component.open = true;
      cd();
      component.recoveryForm.setValue({ email: 'user@example.com' });

      await component.onSubmit();

      expect(component.loading).toBe(false);
    });
  });

  // ─── B26. goToLogin — limpar estado ──────────────────────────

  describe('B26. goToLogin', () => {
    it('#146 goToLogin limpa form, mensagens e loading', () => {
      component.errorMessage = 'Erro antigo';
      component.successMessage = 'Sucesso antigo';
      component.loading = true;
      component.recoveryForm.setValue({ email: 'old@email.com' });

      component.goToLogin();

      expect(component.recoveryForm.get('email')!.value).toBe('');
      expect(component.errorMessage).toBeNull();
      expect(component.successMessage).toBeNull();
      expect(component.loading).toBe(false);
    });

    it('#147 goToLogin emite evento close', () => {
      const closeSpy = vi.spyOn(component.close, 'emit');

      component.goToLogin();

      expect(closeSpy).toHaveBeenCalled();
    });
  });
});
