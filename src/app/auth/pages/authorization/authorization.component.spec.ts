import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthorizationComponent } from './authorization.component';

describe('AuthorizationComponent — Login & Register Scenarios', () => {
  let component: AuthorizationComponent;
  let fixture: ComponentFixture<AuthorizationComponent>;

  function cd(): void {
    fixture.componentRef.changeDetectorRef.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorizationComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorizationComponent);
    component = fixture.componentInstance;
    cd();
  });

  // ─── B1. Renderizacao e layout ───────────────────────────────

  describe('B1. Renderizacao e layout', () => {
    it('#1 painel esquerdo com marca e boas-vindas', () => {
      const brand = fixture.nativeElement.querySelector('.auth-brand-title');
      expect(brand.textContent).toContain('Vida Longa Flix');

      const welcome = fixture.nativeElement.querySelector('.auth-brand-welcome');
      expect(welcome.textContent).toContain('Seja bem-vindo!');

      const policy = fixture.nativeElement.querySelector('.auth-brand-link');
      expect(policy.textContent).toContain('Política de Privacidade');
    });

    it('#2 estado inicial isRegistering=false — mostra login', () => {
      expect(component.isRegistering).toBe(false);

      const login = fixture.nativeElement.querySelector('app-login');
      expect(login).toBeTruthy();

      const register = fixture.nativeElement.querySelector('app-register');
      expect(register).toBeFalsy();
    });

    it('#3 isRegistering=true — mostra register + footer', () => {
      component.isRegistering = true;
      cd();

      const register = fixture.nativeElement.querySelector('app-register');
      expect(register).toBeTruthy();

      const footer = fixture.nativeElement.querySelector('.auth-toggle-text');
      expect(footer.textContent).toContain('Já possui uma conta? Faça login...');
    });

    it('#4 clicar footer "Ja possui uma conta?" alterna para login', () => {
      component.isRegistering = true;
      cd();

      const toggle = fixture.nativeElement.querySelector('.auth-toggle-text');
      toggle.click();
      cd();

      expect(component.isRegistering).toBe(false);
      const login = fixture.nativeElement.querySelector('app-login');
      expect(login).toBeTruthy();
    });

    it('#5 toggleMode alterna entre login e register', () => {
      expect(component.isRegistering).toBe(false);

      component.toggleMode();
      expect(component.isRegistering).toBe(true);

      component.toggleMode();
      expect(component.isRegistering).toBe(false);
    });
  });
});
