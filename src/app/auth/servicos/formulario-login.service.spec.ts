import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { FormularioLoginService } from './formulario-login.service';

describe('FormularioLoginService', () => {
  let service: FormularioLoginService;
  const routerMock = { navigateByUrl: vi.fn() };

  beforeEach(() => {
    localStorage.clear();
    routerMock.navigateByUrl.mockReset();

    TestBed.configureTestingModule({
      providers: [
        FormularioLoginService,
        FormBuilder,
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(FormularioLoginService);
  });

  it('deve alternar visibilidade da senha', () => {
    expect(service.passwordVisible).toBe(false);
    service.togglePasswordVisibility();
    expect(service.passwordVisible).toBe(true);
  });

  it('deve aplicar máscara de CPF e telefone automaticamente', () => {
    service.form.controls.cpf.setValue('12345678900');
    service.form.controls.telefone.setValue('11987654321');

    expect(service.form.controls.cpf.value).toBe('123.456.789-00');
    expect(service.form.controls.telefone.value).toBe('(11) 98765-4321');
  });

  it('deve lançar erro quando formulário inválido em cadastrar', async () => {
    let erro: unknown;
    try {
      await service.cadastrar();
    } catch (e) {
      erro = e;
    }

    expect(erro).toBeTruthy();
    expect((erro as Error).message).toBe('Formulário inválido');
  });

  it('deve salvar token e navegar quando formulário válido', async () => {
    service.form.setValue({
      email: 'ok@email.com',
      password: '123456',
      name: 'Nome',
      cpf: '12345678900',
      telefone: '11987654321',
      endereco: {
        rua: 'Rua A',
        bairro: 'Centro',
        cidade: 'Cidade',
        estado: 'RS',
        cep: '12345678',
      },
    });

    await service.cadastrar();

    expect(localStorage.getItem('token')).toBe('token_fake_123');
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/insights');
  });
});
