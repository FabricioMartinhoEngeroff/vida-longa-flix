import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { LoginFormService } from './login-form.service';

describe('LoginFormService', () => {
  let service: LoginFormService;
  const routerMock = { navigateByUrl: vi.fn() };

  beforeEach(() => {
    localStorage.clear();
    routerMock.navigateByUrl.mockReset();

    TestBed.configureTestingModule({
      providers: [
        LoginFormService,
        FormBuilder,
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(LoginFormService);
  });

  it('should toggle password visibility', () => {
    expect(service.passwordVisible).toBe(false);
    service.togglePasswordVisibility();
    expect(service.passwordVisible).toBe(true);
  });

  it('should apply CPF and phone masks automatically', () => {
    // Acessa controles usando get() ao invés de notação de ponto
    const taxIdControl = service.form.get('taxId');
    const phoneControl = service.form.get('phone');

    taxIdControl?.setValue('12345678900');
    phoneControl?.setValue('11987654321');

    expect(taxIdControl?.value).toBe('123.456.789-00');
    expect(phoneControl?.value).toBe('(11) 98765-4321');
  });

  it('should throw error when form is invalid on register', async () => {
    let error: unknown;
    try {
      await service.register();
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
    expect((error as Error).message).toBe('Invalid form');
  });

  it('should save token and navigate when form is valid', async () => {
    service.form.setValue({
      email: 'ok@email.com',
      password: '123456',
      name: 'Name',
      taxId: '12345678900',
      phone: '11987654321',
      address: {
        street: 'Street A',
        neighborhood: 'Downtown',
        city: 'City',
        state: 'RS',
        zipCode: '12345678',
      },
    });

    await service.register();

    expect(localStorage.getItem('token')).toBe('fake_token_123');
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/insights');
  });
});