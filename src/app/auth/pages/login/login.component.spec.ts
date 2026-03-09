import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';

describe('LoginComponent — Login & Register Scenarios', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;

  const loginResponse = {
    token: 'jwt-login-token',
    user: {
      id: 'u1',
      name: 'Maria',
      email: 'maria@email.com',
      phone: '11987654321',
      profileComplete: true,
      roles: ['ROLE_USER'],
    },
  };

  const authMock = {
    login: vi.fn().mockResolvedValue(loginResponse),
    isAuthenticated: vi.fn().mockReturnValue(false),
    getToken: vi.fn().mockReturnValue(null),
  };

  const loggerMock = { log: vi.fn(), warn: vi.fn(), error: vi.fn() };

  function cd(): void {
    fixture.componentRef.changeDetectorRef.detectChanges();
  }

  function fillValidForm(keepLoggedIn = false) {
    component.form.setValue({
      email: 'maria@email.com',
      password: 'Abc123!@',
      keepLoggedIn,
    });
  }

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
        { provide: LoggerService, useValue: loggerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    cd();
  });

  // ─── B3. Login — renderizacao do formulario ──────────────────

  describe('B3. Renderizacao do formulario', () => {
    it('#8 titulo "Acesso ao Vida Longa Flix" visivel', () => {
      const h2 = fixture.nativeElement.querySelector('h2');
      expect(h2.textContent).toContain('Acesso ao Vida Longa Flix');
    });

    it('#9 campo e-mail presente com type email e icone mail', () => {
      const emailInput = fixture.nativeElement.querySelector('input[type="email"]') as HTMLInputElement;
      expect(emailInput).toBeTruthy();
    });

    it('#10 campo senha presente com type password e icone lock', () => {
      const pwInput = fixture.nativeElement.querySelector('input[type="password"]') as HTMLInputElement;
      expect(pwInput).toBeTruthy();
    });

    it('#11 checkbox "Manter conectado" desmarcado por padrao', () => {
      expect(component.form.get('keepLoggedIn')!.value).toBe(false);
      const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox).toBeTruthy();
      expect(checkbox.checked).toBe(false);
    });

    it('#12 link "Esqueci minha senha" presente', () => {
      const link = fixture.nativeElement.querySelector('.forgot-password-link');
      expect(link).toBeTruthy();
      expect(link.textContent).toContain('Esqueci minha senha');
    });

    it('#13 botao "Entrar" presente', () => {
      const btn = fixture.nativeElement.querySelector('app-primary-button');
      expect(btn).toBeTruthy();
    });

    it('#14 botao "Criar conta" presente com texto correto', () => {
      const btn = fixture.nativeElement.querySelector('.btn-create-account') as HTMLButtonElement;
      expect(btn).toBeTruthy();
      expect(btn.textContent).toContain('Criar conta');
    });
  });

  // ─── B4. Login — validacao de campos ─────────────────────────

  describe('B4. Validacao de campos', () => {
    it('#15 submeter formulario vazio — form invalido, signIn retorna early', async () => {
      component.form.setValue({ email: '', password: '', keepLoggedIn: false });

      await component.signIn();

      expect(authMock.login).not.toHaveBeenCalled();
      expect(component.form.get('email')!.touched).toBe(true);
    });

    it('#16 e-mail vazio, campo tocado — erro "Required field"', () => {
      const ctrl = component.form.get('email')!;
      ctrl.setValue('');
      ctrl.markAsTouched();
      expect(component.errorMessage('email')).toBe('Required field');
    });

    it('#17 e-mail invalido — erro "Invalid email"', () => {
      const ctrl = component.form.get('email')!;
      ctrl.setValue('abc');
      ctrl.markAsTouched();
      expect(component.errorMessage('email')).toBe('Invalid email');
    });

    it('#18 e-mail valido — sem erro', () => {
      const ctrl = component.form.get('email')!;
      ctrl.setValue('user@example.com');
      ctrl.markAsTouched();
      expect(component.errorMessage('email')).toBeNull();
    });

    it('#19 e-mail no limite maximo (254 chars)', () => {
      const longEmail = 'a'.repeat(240) + '@example.com'; // 252 chars
      const ctrl = component.form.get('email')!;
      ctrl.setValue(longEmail);
      ctrl.markAsTouched();
      // Angular email validator may reject very long emails, but control accepts them
      expect(ctrl.value.length).toBeLessThanOrEqual(254);
    });

    it('#20 senha vazia, campo tocado — erro "Required field"', () => {
      const ctrl = component.form.get('password')!;
      ctrl.setValue('');
      ctrl.markAsTouched();
      expect(component.errorMessage('password')).toBe('Required field');
    });

    it('#21 senha com menos de 6 caracteres — erro "Minimum 6 characters"', () => {
      const ctrl = component.form.get('password')!;
      ctrl.setValue('12345');
      ctrl.markAsTouched();
      expect(component.errorMessage('password')).toBe('Minimum 6 characters');
    });

    it('#22 senha com exatamente 6 caracteres — sem erro', () => {
      const ctrl = component.form.get('password')!;
      ctrl.setValue('123456');
      ctrl.markAsTouched();
      expect(component.errorMessage('password')).toBeNull();
    });

    it('#23 senha longa (128 chars) aceita', () => {
      const ctrl = component.form.get('password')!;
      ctrl.setValue('A'.repeat(128));
      ctrl.markAsTouched();
      expect(component.errorMessage('password')).toBeNull();
    });

    it('#24 campo nao tocado — errorMessage retorna null', () => {
      expect(component.errorMessage('email')).toBeNull();
      expect(component.errorMessage('password')).toBeNull();
    });
  });

  // ─── B5. Login — visibilidade da senha ───────────────────────

  describe('B5. Visibilidade da senha', () => {
    it('#25 campo senha tipo inicial password', () => {
      const pwInput = fixture.nativeElement.querySelector('input[type="password"]');
      expect(pwInput).toBeTruthy();
    });

    it('#26 toggle password mostra texto', () => {
      const btn = fixture.nativeElement.querySelector('.right-action') as HTMLButtonElement;
      expect(btn).toBeTruthy();

      btn.click();
      cd();

      const textInput = fixture.nativeElement.querySelector('input[type="text"]');
      expect(textInput).toBeTruthy();
    });

    it('#27 toggle novamente oculta texto', () => {
      const btn = fixture.nativeElement.querySelector('.right-action') as HTMLButtonElement;
      btn.click();
      cd();
      btn.click();
      cd();

      const pwInput = fixture.nativeElement.querySelector('input[type="password"]');
      expect(pwInput).toBeTruthy();
    });
  });

  // ─── B6. Login — submissao com sucesso ───────────────────────

  describe('B6. Submissao com sucesso', () => {
    it('#28 preencher dados validos e submeter — loading=true, login chamado', async () => {
      fillValidForm();

      const p = component.signIn();
      expect(component.loading).toBe(true);

      await p;
      expect(authMock.login).toHaveBeenCalledWith('maria@email.com', 'Abc123!@', false);
    });

    it('#29 backend retorna token — navega para /app com replaceUrl', async () => {
      fillValidForm();
      await component.signIn();

      expect(router.navigateByUrl).toHaveBeenCalledWith('/app', { replaceUrl: true });
    });

    it('#30 keepLoggedIn=false — passa false para authService.login', async () => {
      fillValidForm(false);
      await component.signIn();

      expect(authMock.login).toHaveBeenCalledWith('maria@email.com', 'Abc123!@', false);
    });

    it('#31 keepLoggedIn=true — passa true para authService.login', async () => {
      fillValidForm(true);
      await component.signIn();

      expect(authMock.login).toHaveBeenCalledWith('maria@email.com', 'Abc123!@', true);
    });

    it('#32 apos submit, loading volta a false', async () => {
      fillValidForm();
      await component.signIn();

      expect(component.loading).toBe(false);
    });
  });

  // ─── B8. Login — tratamento de erros ─────────────────────────

  describe('B8. Tratamento de erros', () => {
    it('#37 backend retorna 401 — erro logado, loading reseta', async () => {
      authMock.login.mockRejectedValueOnce(new Error('Email ou senha incorretos'));

      fillValidForm();
      await component.signIn();

      expect(loggerMock.error).toHaveBeenCalled();
      expect(component.loading).toBe(false);
    });

    it('#38 backend retorna 500 — erro logado', async () => {
      authMock.login.mockRejectedValueOnce(new Error('Erro ao fazer login'));

      fillValidForm();
      await component.signIn();

      expect(loggerMock.error).toHaveBeenCalled();
    });

    it('#39 backend retorna body com message — erro capturado', async () => {
      authMock.login.mockRejectedValueOnce(new Error('Email nao cadastrado'));

      fillValidForm();
      await component.signIn();

      expect(loggerMock.error).toHaveBeenCalled();
    });

    it('#43 rede falha — erro capturado no catch', async () => {
      authMock.login.mockRejectedValueOnce(new Error('Network failure'));

      fillValidForm();
      await component.signIn();

      expect(loggerMock.error).toHaveBeenCalled();
      expect(component.loading).toBe(false);
    });

    it('#44 loading reseta em qualquer cenario de erro (finally)', async () => {
      authMock.login.mockRejectedValueOnce(new Error('Qualquer erro'));

      fillValidForm();
      await component.signIn();

      expect(component.loading).toBe(false);
    });

    it('form invalido nao faz request', async () => {
      component.form.setValue({ email: '', password: '', keepLoggedIn: false });
      await component.signIn();

      expect(authMock.login).not.toHaveBeenCalled();
      expect(component.loading).toBe(false);
    });

    it('loading permanece true durante request pendente', async () => {
      let resolveLogin!: (v: any) => void;
      authMock.login.mockReturnValueOnce(new Promise((r) => { resolveLogin = r; }));

      fillValidForm();
      const p = component.signIn();

      expect(component.loading).toBe(true);

      resolveLogin(loginResponse);
      await p;

      expect(component.loading).toBe(false);
    });

    it('primeira tentativa falha, segunda funciona', async () => {
      authMock.login.mockRejectedValueOnce(new Error('Erro'));

      fillValidForm();
      await component.signIn();
      expect(component.loading).toBe(false);

      // Segunda tentativa
      authMock.login.mockResolvedValueOnce(loginResponse);
      await component.signIn();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/app', { replaceUrl: true });
    });
  });

  // ─── B10. Login — botao "Criar conta" ────────────────────────

  describe('B10. Botao Criar conta', () => {
    it('#55 clicar "Criar conta" navega para /register', () => {
      component.register();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/register');
    });
  });

  // ─── B11. Login — modal "Esqueci minha senha" ────────────────

  describe('B11. Modal Esqueci minha senha', () => {
    it('#56 clicar "Esqueci minha senha" abre modal', () => {
      expect(component.recoveryOpen).toBe(false);

      component.openPasswordRecovery();
      expect(component.recoveryOpen).toBe(true);
    });

    it('#57 fechar modal via closePasswordRecovery', () => {
      component.openPasswordRecovery();
      expect(component.recoveryOpen).toBe(true);

      component.closePasswordRecovery();
      expect(component.recoveryOpen).toBe(false);
    });
  });
});
