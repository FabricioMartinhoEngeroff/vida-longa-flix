import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { vi } from 'vitest';
import { PasswordChangeComponent } from './password-change.component';
import { NotificationService } from '../../services/notification.service';
import { PasswordRecoveryService } from '../../services/service-password-recovery/service-password-recovery';
import { LoggerService } from '../../services/logger.service';
import { DEFAULT_MESSAGES } from '../../../shared/services/alert-message/default-messages.constants';

describe('PasswordChangeComponent — Login & Register Scenarios', () => {
  let component: PasswordChangeComponent;
  let fixture: ComponentFixture<PasswordChangeComponent>;
  let router: Router;

  const notifMock = {
    showDefault: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  };

  const recoveryMock = {
    validateToken: vi.fn(),
    changePassword: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  const loggerMock = { log: vi.fn(), warn: vi.fn(), error: vi.fn() };

  function cd(): void {
    fixture.componentRef.changeDetectorRef.detectChanges();
  }

  // ─── B28. Renderizacao e estados ─────────────────────────────

  describe('B28. Renderizacao e estados', () => {

    afterEach(() => {
      TestBed.resetTestingModule();
      vi.restoreAllMocks();
    });

    async function setupWithToken(token: string | undefined, validateResult: boolean | 'error') {
      if (validateResult === 'error') {
        recoveryMock.validateToken.mockImplementation(() => Promise.reject(new Error('Server error')));
      } else {
        recoveryMock.validateToken.mockImplementation(() => Promise.resolve(validateResult));
      }

      await TestBed.configureTestingModule({
        imports: [PasswordChangeComponent],
        providers: [
          provideRouter([]),
          { provide: NotificationService, useValue: notifMock },
          { provide: PasswordRecoveryService, useValue: recoveryMock },
          { provide: LoggerService, useValue: loggerMock },
          { provide: ActivatedRoute, useValue: { snapshot: { queryParams: token ? { token } : {} } } },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(PasswordChangeComponent);
      component = fixture.componentInstance;
      router = TestBed.inject(Router);
      vi.spyOn(router, 'navigate').mockResolvedValue(true);
    }

    it('#151 estado inicial — validatingToken=true', async () => {
      // Use a never-resolving promise so ngOnInit stays in validating state
      recoveryMock.validateToken.mockImplementation(
        () => new Promise(() => undefined)
      );

      await TestBed.configureTestingModule({
        imports: [PasswordChangeComponent],
        providers: [
          provideRouter([]),
          { provide: NotificationService, useValue: notifMock },
          { provide: PasswordRecoveryService, useValue: recoveryMock },
          { provide: LoggerService, useValue: loggerMock },
          { provide: ActivatedRoute, useValue: { snapshot: { queryParams: { token: 'tok' } } } },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(PasswordChangeComponent);
      component = fixture.componentInstance;

      expect(component.validatingToken).toBe(true);
    });

    it('#152 token valido — tokenValid=true, formulario visivel', async () => {
      await setupWithToken('valid-token', true);

      await component.ngOnInit();
      cd();

      expect(component.tokenValid).toBe(true);
      expect(component.validatingToken).toBe(false);
    });

    it('#153 token invalido — tokenValid=false, mostra erro', async () => {
      await setupWithToken('expired-token', false);

      await component.ngOnInit();
      cd();

      expect(component.tokenValid).toBe(false);
      expect(notifMock.showDefault).toHaveBeenCalledWith(DEFAULT_MESSAGES.INVALID_TOKEN);
    });

    it('#154 token ausente — notificacao INVALID_TOKEN', async () => {
      vi.useFakeTimers();
      await setupWithToken(undefined, true);

      await component.ngOnInit();

      expect(notifMock.showDefault).toHaveBeenCalledWith(DEFAULT_MESSAGES.INVALID_TOKEN);

      vi.advanceTimersByTime(5000);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      vi.useRealTimers();
    });

    it('#155 painel esquerdo com texto correto', async () => {
      await setupWithToken('valid-token', true);
      await component.ngOnInit();
      cd();

      const brandWelcome = fixture.nativeElement.querySelector('.auth-brand-welcome');
      expect(brandWelcome.textContent).toContain('Redefina sua senha');
    });
  });

  // ─── B29–B32 share a common beforeEach with valid token ──────

  describe('Token valido — formulario e submissao', () => {
    beforeEach(async () => {
      vi.useFakeTimers();
      vi.clearAllMocks();
      recoveryMock.validateToken.mockImplementation(() => Promise.resolve(true));
      recoveryMock.changePassword.mockImplementation(() => Promise.resolve());

      await TestBed.configureTestingModule({
        imports: [PasswordChangeComponent],
        providers: [
          provideRouter([]),
          { provide: NotificationService, useValue: notifMock },
          { provide: PasswordRecoveryService, useValue: recoveryMock },
          { provide: LoggerService, useValue: loggerMock },
          { provide: ActivatedRoute, useValue: { snapshot: { queryParams: { token: 'valid-token' } } } },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(PasswordChangeComponent);
      component = fixture.componentInstance;
      router = TestBed.inject(Router);
      vi.spyOn(router, 'navigate').mockResolvedValue(true);

      await component.ngOnInit();
      cd();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    // ─── B29. Formulario ─────────────────────────────────────

    describe('B29. Formulario', () => {
      it('#156 campo "Nova Senha" presente', () => {
        const inputs = fixture.nativeElement.querySelectorAll('app-form-field');
        expect(inputs.length).toBeGreaterThanOrEqual(2);
      });

      it('#157 indicador de forca da senha presente', () => {
        const indicator = fixture.nativeElement.querySelector('app-password-strength-indicator');
        expect(indicator).toBeTruthy();
      });

      it('#158 campo "Confirmar Nova Senha" existe no form', () => {
        expect(component.form.get('confirmPassword')).toBeTruthy();
      });

      it('#159 botao "Redefinir senha" presente', () => {
        const btn = fixture.nativeElement.querySelector('app-primary-button');
        expect(btn).toBeTruthy();
      });

      it('#160 link "Voltar para o login" presente', () => {
        const link = fixture.nativeElement.querySelector('.back-link a');
        expect(link).toBeTruthy();
        expect(link.textContent).toContain('Voltar para o login');
      });
    });

    // ─── B30. Validacao ──────────────────────────────────────

    describe('B30. Validacao', () => {
      it('#161 submeter vazio — FIX_ERRORS', async () => {
        component.form.setValue({ newPassword: '', confirmPassword: '' });
        await component.change();
        expect(notifMock.showDefault).toHaveBeenCalledWith(DEFAULT_MESSAGES.FIX_ERRORS);
      });

      it('#162 nova senha vazia — "Required field"', () => {
        const ctrl = component.form.get('newPassword')!;
        ctrl.setValue('');
        ctrl.markAsTouched();
        expect(component.fieldError('newPassword')).toBe('Required field');
      });

      it('#163 nova senha < 8 chars — "Minimum 8 characters"', () => {
        const ctrl = component.form.get('newPassword')!;
        ctrl.setValue('Ab1!');
        ctrl.markAsTouched();
        expect(component.fieldError('newPassword')).toBe('Minimum 8 characters');
      });

      it('#164 nova senha fraca — mostra requisito faltando', () => {
        const ctrl = component.form.get('newPassword')!;
        ctrl.setValue('abcdefgh');
        ctrl.markAsTouched();
        const error = component.fieldError('newPassword');
        expect(error).toBeTruthy();
        expect(error).not.toBe('Required field');
      });

      it('#165 nova senha forte — sem erro', () => {
        const ctrl = component.form.get('newPassword')!;
        ctrl.setValue('StrongPass1!');
        ctrl.markAsTouched();
        expect(component.fieldError('newPassword')).toBeNull();
      });

      it('#166 confirmacao vazia — "Required field"', () => {
        const ctrl = component.form.get('confirmPassword')!;
        ctrl.setValue('');
        ctrl.markAsTouched();
        expect(component.fieldError('confirmPassword')).toBe('Required field');
      });

      it('#167 senhas diferentes — PASSWORDS_DO_NOT_MATCH', async () => {
        component.form.setValue({ newPassword: 'StrongPass1!', confirmPassword: 'DifferentPass1!' });
        await component.change();
        expect(notifMock.showDefault).toHaveBeenCalledWith(DEFAULT_MESSAGES.PASSWORDS_DO_NOT_MATCH);
        expect(recoveryMock.changePassword).not.toHaveBeenCalled();
      });

      it('#168 senhas iguais — prossegue para request', async () => {
        component.form.setValue({ newPassword: 'StrongPass1!', confirmPassword: 'StrongPass1!' });
        await component.change();
        expect(recoveryMock.changePassword).toHaveBeenCalledWith('valid-token', 'StrongPass1!');
      });
    });

    // ─── B31. Submissao com sucesso ──────────────────────────

    describe('B31. Submissao com sucesso', () => {
      it('#169 loading=true durante request', async () => {
        let resolve!: () => void;
        recoveryMock.changePassword.mockImplementationOnce(() => new Promise<void>((r) => { resolve = r; }));

        component.form.setValue({ newPassword: 'StrongPass1!', confirmPassword: 'StrongPass1!' });
        const p = component.change();

        expect(component.loading).toBe(true);

        resolve();
        await p;
      });

      it('#170 sucesso — notificacao PASSWORD_CHANGED', async () => {
        component.form.setValue({ newPassword: 'StrongPass1!', confirmPassword: 'StrongPass1!' });
        await component.change();
        expect(notifMock.showDefault).toHaveBeenCalledWith(DEFAULT_MESSAGES.PASSWORD_CHANGED);
      });

      it('#171 apos sucesso, redirect para /login', async () => {
        component.form.setValue({ newPassword: 'StrongPass1!', confirmPassword: 'StrongPass1!' });
        await component.change();

        vi.advanceTimersByTime(5000);
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
      });

      it('#172 loading reseta', async () => {
        component.form.setValue({ newPassword: 'StrongPass1!', confirmPassword: 'StrongPass1!' });
        await component.change();
        expect(component.loading).toBe(false);
      });
    });

    // ─── B32. Tratamento de erros ────────────────────────────

    describe('B32. Tratamento de erros', () => {
      it('#173 backend falha — ERROR_RESETTING_PASSWORD', async () => {
        recoveryMock.changePassword.mockImplementationOnce(() => Promise.reject(new Error('Failed')));

        component.form.setValue({ newPassword: 'StrongPass1!', confirmPassword: 'StrongPass1!' });
        await component.change();

        expect(notifMock.showDefault).toHaveBeenCalledWith(DEFAULT_MESSAGES.ERROR_RESETTING_PASSWORD);
      });

      it('#174 erro logado', async () => {
        recoveryMock.changePassword.mockImplementationOnce(() => Promise.reject(new Error('Failed')));

        component.form.setValue({ newPassword: 'StrongPass1!', confirmPassword: 'StrongPass1!' });
        await component.change();

        expect(loggerMock.error).toHaveBeenCalled();
      });

      it('#175 loading reseta apos erro', async () => {
        recoveryMock.changePassword.mockImplementationOnce(() => Promise.reject(new Error('Failed')));

        component.form.setValue({ newPassword: 'StrongPass1!', confirmPassword: 'StrongPass1!' });
        await component.change();

        expect(component.loading).toBe(false);
      });
    });
  });

  // ─── B33. Validacao de token (ngOnInit) ──────────────────────

  describe('B33. Validacao de token', () => {

    afterEach(() => {
      TestBed.resetTestingModule();
      vi.restoreAllMocks();
    });

    async function setupToken(token: string | undefined) {
      await TestBed.configureTestingModule({
        imports: [PasswordChangeComponent],
        providers: [
          provideRouter([]),
          { provide: NotificationService, useValue: notifMock },
          { provide: PasswordRecoveryService, useValue: recoveryMock },
          { provide: LoggerService, useValue: loggerMock },
          { provide: ActivatedRoute, useValue: { snapshot: { queryParams: token ? { token } : {} } } },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(PasswordChangeComponent);
      component = fixture.componentInstance;
      router = TestBed.inject(Router);
      vi.spyOn(router, 'navigate').mockResolvedValue(true);
    }

    it('#176 validateToken retorna true — tokenValid=true', async () => {
      recoveryMock.validateToken.mockImplementation(() => Promise.resolve(true));
      await setupToken('good-token');
      await component.ngOnInit();

      expect(component.tokenValid).toBe(true);
    });

    it('#177 validateToken retorna false — INVALID_TOKEN', async () => {
      vi.useFakeTimers();
      recoveryMock.validateToken.mockImplementation(() => Promise.resolve(false));
      await setupToken('bad-token');
      await component.ngOnInit();

      expect(component.tokenValid).toBe(false);
      expect(notifMock.showDefault).toHaveBeenCalledWith(DEFAULT_MESSAGES.INVALID_TOKEN);

      vi.advanceTimersByTime(5000);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      vi.useRealTimers();
    });

    it('#178 validateToken lanca excecao — ERROR_VALIDATING_TOKEN', async () => {
      recoveryMock.validateToken.mockImplementation(() => Promise.reject(new Error('err')));
      await setupToken('error-token');
      await component.ngOnInit();

      expect(notifMock.showDefault).toHaveBeenCalledWith(DEFAULT_MESSAGES.ERROR_VALIDATING_TOKEN);
      expect(component.tokenValid).toBe(false);
    });

    it('#179 validatingToken reseta apos validacao', async () => {
      recoveryMock.validateToken.mockImplementation(() => Promise.resolve(true));
      await setupToken('token');
      await component.ngOnInit();

      expect(component.validatingToken).toBe(false);
    });
  });
});
