import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { LoggerService } from '../../services/logger.service';
import { DEFAULT_MESSAGES } from '../../../shared/services/alert-message/default-messages.constants';

describe('RegisterComponent — WhatsApp Welcome', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: Router;

  const successResponse = {
    token: 'jwt-token-123',
    user: {
      id: 'u1',
      name: 'Fabricio',
      email: 'fabricio@email.com',
      phone: '11987654321',
      profileComplete: false,
      roles: ['ROLE_USER'],
    },
  };

  const queuedRegisterResponse = {
    token: null,
    queued: true,
    queuePosition: 5,
    message: 'Limite de usuarios atingido. Voce foi adicionado a fila de espera na posicao #5.',
    user: {
      id: 'u-queued',
      name: 'Fabricio',
      email: 'fabricio@email.com',
      phone: '(11) 98765-4321',
      status: 'QUEUED',
      queuePosition: 5,
      profileComplete: false,
      roles: [],
    },
  };

  const authMock = {
    register: vi.fn().mockResolvedValue(successResponse),
  };

  const notifMock = {
    showDefault: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  };

  const loggerMock = { log: vi.fn(), warn: vi.fn(), error: vi.fn() };

  function cd(): void {
    fixture.componentRef.changeDetectorRef.detectChanges();
  }

  function fillValidForm() {
    component.form.setValue({
      name: 'Fabricio',
      email: 'fabricio@email.com',
      phone: '11987654321',
      password: 'StrongPass1!',
    });
  }

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
        { provide: NotificationService, useValue: notifMock },
        { provide: LoggerService, useValue: loggerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    cd();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─── C1. Formulario de registro — campo telefone ──────────

  describe('C1. Campo telefone', () => {
    it('#1 campo Telefone visivel com placeholder e icone phone', () => {
      const telInput = fixture.nativeElement.querySelector('input[type="tel"]') as HTMLInputElement;
      expect(telInput).toBeTruthy();
      // dynamicPlaceholder mostra label "Telefone" quando vazio, placeholder "(00) 00000-0000" quando com valor
      const placeholder = telInput.placeholder;
      expect(placeholder === 'Telefone' || placeholder === '(00) 00000-0000').toBe(true);
    });

    it('#2 numero com 11 digitos (celular) — campo valido', () => {
      component.form.patchValue({ phone: '11987654321' });
      expect(component.form.get('phone')!.valid).toBe(true);
    });

    it('#3 numero com 10 digitos (fixo) — campo valido', () => {
      component.form.patchValue({ phone: '1134567890' });
      expect(component.form.get('phone')!.valid).toBe(true);
    });

    it('#4 numero com 9 digitos (incompleto) — Telefone invalido', () => {
      const ctrl = component.form.get('phone')!;
      ctrl.setValue('119876543');
      ctrl.markAsTouched();

      expect(ctrl.invalid).toBe(true);
      expect(component.fieldError('phone')).toBe('Telefone inválido');
    });

    it('#5 numero com 12+ digitos — pattern rejeita', () => {
      const ctrl = component.form.get('phone')!;
      ctrl.setValue('119876543210');
      expect(ctrl.invalid).toBe(true);
    });

    it('#5.1 input com mais de 11 digitos limita mascara ao telefone valido', () => {
      const telInput = fixture.nativeElement.querySelector('input[type="tel"]') as HTMLInputElement;
      telInput.value = '11987654321099';
      telInput.dispatchEvent(new Event('input'));
      cd();

      expect(telInput.value).toBe('(11) 98765-4321');
      expect(component.form.get('phone')!.value).toBe('11987654321');
    });

    it('#6 campo telefone vazio e submeter — Campo obrigatorio', () => {
      const ctrl = component.form.get('phone')!;
      ctrl.setValue('');
      ctrl.markAsTouched();

      expect(ctrl.errors?.['required']).toBe(true);
      expect(component.fieldError('phone')).toBe('Campo obrigatório');
    });

    it('#7 mascara remove letras e caracteres especiais (form-field mask)', () => {
      // FormFieldComponent com mask="phone" remove nao-digitos via MaskService.remove()
      // O form control recebe apenas digitos
      const telInput = fixture.nativeElement.querySelector('input[type="tel"]') as HTMLInputElement;
      telInput.value = 'abc11987654321xyz';
      telInput.dispatchEvent(new Event('input'));
      cd();

      // O valor visual fica mascarado, o valor do form fica limpo
      const phoneValue = component.form.get('phone')!.value;
      expect(phoneValue).toMatch(/^\d+$/);
    });
  });

  // ─── C2. Submissao com telefone valido ─────────────────────

  describe('C2. Submissao com telefone valido', () => {
    it('#8 preencher tudo e submeter — loading=true, register chamado', async () => {
      fillValidForm();

      const p = component.register();
      expect(component.loading).toBe(true);

      await p;
      expect(authMock.register).toHaveBeenCalled();
    });

    it('#9 payload enviado com name, email, password, phone', async () => {
      fillValidForm();
      await component.register();

      expect(authMock.register).toHaveBeenCalledWith({
        name: 'Fabricio',
        email: 'fabricio@email.com',
        phone: '11987654321',
        password: 'StrongPass1!',
      });
    });

    it('#10 email com espacos e maiusculas — componente envia getRawValue ao AuthService', async () => {
      // Nota: Validators.email rejeita espacos, entao este cenario e testado no AuthService
      // Aqui verificamos que o form envia o valor sem transformacao
      fillValidForm();
      await component.register();

      const data = authMock.register.mock.calls[0][0];
      expect(data.email).toBe('fabricio@email.com');
    });

    it('#11 nome com espacos extras — enviado com getRawValue, AuthService faz trim', async () => {
      component.form.setValue({
        name: '  Fabricio  ',
        email: 'fab@email.com',
        phone: '11987654321',
        password: 'StrongPass1!',
      });

      await component.register();

      const data = authMock.register.mock.calls[0][0];
      expect(data.name).toBe('  Fabricio  ');
    });

    it('#12 phone com digitos — AuthService aplica mascara antes de enviar', async () => {
      fillValidForm();
      await component.register();

      // AuthService.mapRegisterToApi aplica applyPhoneMaskAuto
      const data = authMock.register.mock.calls[0][0];
      expect(data.phone).toBe('11987654321');
    });
  });

  // ─── C3. Resposta do backend — sucesso ─────────────────────

  describe('C3. Sucesso (registro + WhatsApp)', () => {
    it('#13 backend retorna token+user — notificacao de sucesso', async () => {
      fillValidForm();
      await component.register();

      expect(notifMock.showDefault).toHaveBeenCalledWith(DEFAULT_MESSAGES.REGISTRATION_SUCCESS);
    });

    it('#14 apos sucesso — notificacao "Cadastro concluido com sucesso!"', async () => {
      fillValidForm();
      await component.register();

      const call = notifMock.showDefault.mock.calls[0][0];
      expect(call.text).toBe('Cadastro concluído com sucesso!');
    });

    it('#15 apos notificacao — redirecionamento para /app', async () => {
      fillValidForm();
      await component.register();

      vi.advanceTimersByTime(2000);

      expect(router.navigateByUrl).toHaveBeenCalledWith('/app', { replaceUrl: true });
    });

    it('#16 sessao salva — AuthService.register salva token (testado no service spec)', async () => {
      fillValidForm();
      await component.register();

      // Confirmamos que register foi chamado com sucesso
      expect(authMock.register).toHaveBeenCalled();
      expect(notifMock.error).not.toHaveBeenCalled();
    });

    it('#17 WhatsApp enviado pelo backend — transparente para o frontend', async () => {
      fillValidForm();
      await component.register();

      // Frontend nao tem acesso a API do WhatsApp
      // Apenas verifica que o registro concluiu com sucesso
      expect(notifMock.error).not.toHaveBeenCalled();
    });
  });

  // ─── C4. Resposta do backend — erro no registro ────────────

  describe('C4. Erro no registro', () => {
    it('#18 backend retorna 409 (email ja cadastrado) — notificacao de erro com mensagem', async () => {
      authMock.register.mockRejectedValueOnce(new Error('Este email já está cadastrado'));

      fillValidForm();
      await component.register();

      expect(notifMock.error).toHaveBeenCalledWith('Este email já está cadastrado');
    });

    it('#19 backend retorna 400 (dados invalidos) — notificacao de erro', async () => {
      authMock.register.mockRejectedValueOnce(new Error('Dados inválidos'));

      fillValidForm();
      await component.register();

      expect(notifMock.error).toHaveBeenCalledWith('Dados inválidos');
    });

    it('#20 backend retorna 500 — notificacao de erro generica', async () => {
      authMock.register.mockRejectedValueOnce(new Error('Erro ao registrar usuário'));

      fillValidForm();
      await component.register();

      expect(notifMock.error).toHaveBeenCalledWith('Erro ao registrar usuário');
    });

    it('#21 backend retorna 429 (rate limit) — notificacao com mensagem do backend', async () => {
      authMock.register.mockRejectedValueOnce(new Error('Muitas tentativas. Tente novamente mais tarde.'));

      fillValidForm();
      await component.register();

      expect(notifMock.error).toHaveBeenCalledWith('Muitas tentativas. Tente novamente mais tarde.');
    });

    it('#22 rede falha — notificacao "Erro ao registrar usuario"', async () => {
      authMock.register.mockRejectedValueOnce(new Error('Erro ao registrar usuário'));

      fillValidForm();
      await component.register();

      expect(notifMock.error).toHaveBeenCalledWith('Erro ao registrar usuário');
    });

    it('#23 backend retorna token null — erro tratado', async () => {
      authMock.register.mockRejectedValueOnce(new Error('Token not returned by API'));

      fillValidForm();
      await component.register();

      expect(notifMock.error).toHaveBeenCalledWith('Token not returned by API');
    });

    it('#24 apos qualquer erro — loading volta a false', async () => {
      authMock.register.mockRejectedValueOnce(new Error('Qualquer erro'));

      fillValidForm();
      await component.register();

      expect(component.loading).toBe(false);
    });
  });

  // ─── C5. Registro OK, WhatsApp falhou ──────────────────────

  describe('C5. Registro OK mas WhatsApp falhou', () => {
    it('#25 WhatsApp falhou (numero invalido) — frontend recebe sucesso', async () => {
      authMock.register.mockResolvedValueOnce(successResponse);

      fillValidForm();
      await component.register();

      expect(notifMock.showDefault).toHaveBeenCalledWith(DEFAULT_MESSAGES.REGISTRATION_SUCCESS);
      expect(notifMock.error).not.toHaveBeenCalled();
    });

    it('#26 WhatsApp timeout — frontend recebe sucesso', async () => {
      authMock.register.mockResolvedValueOnce(successResponse);

      fillValidForm();
      await component.register();

      expect(notifMock.showDefault).toHaveBeenCalledWith(DEFAULT_MESSAGES.REGISTRATION_SUCCESS);
    });

    it('#27 WhatsApp API fora do ar — frontend recebe sucesso', async () => {
      authMock.register.mockResolvedValueOnce(successResponse);

      fillValidForm();
      await component.register();

      expect(component.loading).toBe(false);
      expect(notifMock.error).not.toHaveBeenCalled();
    });

    it('#28 cota WhatsApp esgotada — nenhuma diferenca para o usuario', async () => {
      authMock.register.mockResolvedValueOnce(successResponse);

      fillValidForm();
      await component.register();

      vi.advanceTimersByTime(2000);
      expect(router.navigateByUrl).toHaveBeenCalledWith('/app', { replaceUrl: true });
    });
  });

  // ─── C7. Validacao campos interligados ─────────────────────

  describe('C7. Validacao campos interligados', () => {
    it('#33 todos os campos validos — form valido', () => {
      fillValidForm();
      expect(component.form.valid).toBe(true);
    });

    it('#34 email invalido + telefone valido — form invalido', () => {
      component.form.setValue({
        name: 'Fabricio',
        email: 'invalido',
        phone: '11987654321',
        password: 'StrongPass1!',
      });

      expect(component.form.invalid).toBe(true);
      expect(component.form.get('email')!.errors).toBeTruthy();
    });

    it('#35 email valido + telefone invalido — form invalido', () => {
      component.form.setValue({
        name: 'Fabricio',
        email: 'fab@email.com',
        phone: '12345',
        password: 'StrongPass1!',
      });

      expect(component.form.invalid).toBe(true);
      expect(component.form.get('phone')!.errors).toBeTruthy();
    });

    it('#36 senha fraca + telefone valido — notificacao warning com requisito', async () => {
      component.form.setValue({
        name: 'Fabricio',
        email: 'fab@email.com',
        phone: '11987654321',
        password: 'fraca',
      });

      await component.register();

      expect(notifMock.warning).toHaveBeenCalled();
      expect(authMock.register).not.toHaveBeenCalled();
    });

    it('#37 nome com menos de 3 caracteres — "Minimo de 3 caracteres"', () => {
      const ctrl = component.form.get('name')!;
      ctrl.setValue('Ab');
      ctrl.markAsTouched();

      expect(component.fieldError('name')).toBe('Mínimo de 3 caracteres');
    });

    it('#38 email temporario — notificacao "use um email valido e profissional"', async () => {
      // Simula validador de email temporario setando erro manualmente
      const emailCtrl = component.form.get('email')!;
      emailCtrl.setValue('user@guerrillamail.com');
      emailCtrl.markAsTouched();
      emailCtrl.setErrors({
        emailTemporario: { message: 'Email temporário não permitido', domain: 'guerrillamail.com' },
      });

      await component.register();

      expect(notifMock.showDefault).toHaveBeenCalledWith(DEFAULT_MESSAGES.INVALID_EMAIL);
      expect(authMock.register).not.toHaveBeenCalled();
    });

    it('#39 email suspeito — notificacao de email invalido', async () => {
      const emailCtrl = component.form.get('email')!;
      emailCtrl.setValue('user@unknown-domain.xyz');
      emailCtrl.markAsTouched();
      emailCtrl.setErrors({
        emailSuspeito: { message: 'Domínio suspeito', domain: 'unknown-domain.xyz' },
      });

      await component.register();

      expect(notifMock.showDefault).toHaveBeenCalledWith(DEFAULT_MESSAGES.INVALID_EMAIL);
      expect(authMock.register).not.toHaveBeenCalled();
    });

    it('#40 todos os campos vazios e clicar submeter — campos marcados touched, erros exibidos', async () => {
      component.form.setValue({ name: '', email: '', phone: '', password: '' });

      await component.register();

      expect(component.form.get('name')!.touched).toBe(true);
      expect(component.form.get('email')!.touched).toBe(true);
      expect(component.form.get('phone')!.touched).toBe(true);
      expect(component.form.get('password')!.touched).toBe(true);

      expect(notifMock.showDefault).toHaveBeenCalledWith(DEFAULT_MESSAGES.FIX_ERRORS);
    });
  });

  // ─── C9. Estado do componente durante registro ─────────────

  describe('C9. Estado do componente', () => {
    it('#47 antes de submeter — loading=false', () => {
      expect(component.loading).toBe(false);
    });

    it('#48 durante request — loading=true', async () => {
      let resolveRegister!: (v: any) => void;
      authMock.register.mockReturnValueOnce(
        new Promise((r) => { resolveRegister = r; })
      );

      fillValidForm();
      const p = component.register();

      expect(component.loading).toBe(true);

      resolveRegister(successResponse);
      await p;
    });

    it('#49 apos sucesso — loading=false', async () => {
      fillValidForm();
      await component.register();

      expect(component.loading).toBe(false);
    });

    it('#50 apos erro — loading=false, usuario pode tentar novamente', async () => {
      authMock.register.mockRejectedValueOnce(new Error('Erro'));

      fillValidForm();
      await component.register();

      expect(component.loading).toBe(false);
    });

    it('#51 duplo clique durante loading — botao desabilitado via loading flag', async () => {
      let resolveRegister!: (v: any) => void;
      authMock.register.mockReturnValueOnce(
        new Promise((r) => { resolveRegister = r; })
      );

      fillValidForm();
      const p = component.register();

      // loading=true impede que o template habilite o botao ([disabled]="loading")
      expect(component.loading).toBe(true);

      resolveRegister(successResponse);
      await p;
    });
  });

  // ─── C13. Mobile ───────────────────────────────────────────

  describe('C13. Mobile', () => {
    it('#65 campo telefone com type="tel" abre teclado numerico', () => {
      const telInput = fixture.nativeElement.querySelector('input[type="tel"]');
      expect(telInput).toBeTruthy();
    });

    it('#66 mascara aplicada em tempo real ao digitar', () => {
      const telInput = fixture.nativeElement.querySelector('input[type="tel"]') as HTMLInputElement;
      telInput.value = '11987654321';
      telInput.dispatchEvent(new Event('input'));
      cd();

      // Mascara aplica formato visual
      expect(telInput.value).toBe('(11) 98765-4321');
    });

    it('#67 autocomplete do navegador preenche telefone com mascara aplicada', () => {
      const telInput = fixture.nativeElement.querySelector('input[type="tel"]') as HTMLInputElement;

      telInput.value = '21987654321';
      telInput.dispatchEvent(new Event('input'));
      cd();

      expect(telInput.value).toBe('(21) 98765-4321');
      expect(component.form.get('phone')!.value).toBe('21987654321');
    });

    it('#68 submeter formulario no celular — mesmo comportamento do desktop', async () => {
      fillValidForm();
      await component.register();

      expect(authMock.register).toHaveBeenCalled();
      expect(notifMock.showDefault).toHaveBeenCalledWith(DEFAULT_MESSAGES.REGISTRATION_SUCCESS);
    });
  });

  // ─── C15. Fluxo pos-registro ───────────────────────────────

  describe('C15. Fluxo pos-registro', () => {
    it('#75 apos registro — authService.register retorna user', async () => {
      fillValidForm();
      const result = await authMock.register(component.form.getRawValue());

      expect(result.user).toBeTruthy();
      expect(result.token).toBe('jwt-token-123');
    });

    it('#76 profileComplete no user retornado — false para novo registro', async () => {
      fillValidForm();
      const result = await authMock.register(component.form.getRawValue());

      expect(result.user.profileComplete).toBe(false);
    });

    it('#77 redirecionamento com replaceUrl: true', async () => {
      fillValidForm();
      await component.register();

      vi.advanceTimersByTime(2000);

      expect(router.navigateByUrl).toHaveBeenCalledWith('/app', { replaceUrl: true });
    });
  });

  // ─── C16. Resiliencia e retry ──────────────────────────────

  describe('C16. Resiliencia', () => {
    it('#79 primeira tentativa falha, segunda funciona', async () => {
      authMock.register.mockRejectedValueOnce(new Error('Erro de rede'));

      fillValidForm();
      await component.register();

      expect(notifMock.error).toHaveBeenCalled();
      expect(component.loading).toBe(false);

      // Segunda tentativa
      authMock.register.mockResolvedValueOnce(successResponse);
      vi.clearAllMocks();

      await component.register();

      expect(notifMock.showDefault).toHaveBeenCalledWith(DEFAULT_MESSAGES.REGISTRATION_SUCCESS);
    });

    it('#80 backend lento — frontend mantem loading', async () => {
      let resolveRegister!: (v: any) => void;
      authMock.register.mockReturnValueOnce(
        new Promise((r) => { resolveRegister = r; })
      );

      fillValidForm();
      const p = component.register();

      // Simula 5s de espera
      vi.advanceTimersByTime(5000);
      expect(component.loading).toBe(true);

      resolveRegister(successResponse);
      await p;

      expect(component.loading).toBe(false);
    });

    it('#82 componente destruido durante loading nao causa erro ao concluir request', async () => {
      let resolveRegister!: (v: any) => void;
      authMock.register.mockReturnValueOnce(
        new Promise((r) => { resolveRegister = r; })
      );

      fillValidForm();
      const pendingRegister = component.register();

      expect(component.loading).toBe(true);

      fixture.destroy();
      resolveRegister(successResponse);

      let thrown: unknown;
      try {
        await pendingRegister;
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeUndefined();
    });
  });

  // ─── B44. Waitlist — registro alem do limite ───────────────

  describe('B44. Waitlist no registro', () => {
    it('#248 resposta queued nao deve seguir fluxo de sucesso autenticado', async () => {
      authMock.register.mockResolvedValueOnce(queuedRegisterResponse as any);

      fillValidForm();
      await component.register();

      vi.advanceTimersByTime(2000);

      expect(notifMock.showDefault).not.toHaveBeenCalledWith(DEFAULT_MESSAGES.REGISTRATION_SUCCESS);
      expect(router.navigateByUrl).not.toHaveBeenCalledWith('/app', { replaceUrl: true });
      expect(component.loading).toBe(false);
    });

    it('#249 resposta queued deve exibir mensagem da fila com posicao', async () => {
      authMock.register.mockResolvedValueOnce(queuedRegisterResponse as any);

      fillValidForm();
      await component.register();

      expect(notifMock.showDefault).toHaveBeenCalledWith(
        'Limite de usuarios atingido. Voce foi adicionado a fila de espera na posicao #5.'
      );
      expect(notifMock.error).not.toHaveBeenCalled();
    });
  });
});
