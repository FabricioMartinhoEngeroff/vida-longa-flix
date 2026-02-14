import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { ApiService } from './api.service';
import { ServicoAutenticacao } from './servico-autenticacao';

describe('ServicoAutenticacao', () => {
  let service: ServicoAutenticacao;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        ServicoAutenticacao,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ApiService, useValue: { baseURL: 'http://api.test' } },
      ],
    });

    service = TestBed.inject(ServicoAutenticacao);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('deve fazer login via API e salvar token', async () => {
    const promise = service.login('api.user@email.com ', '@ApiUser123');

    const req = httpMock.expectOne('http://api.test/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'api.user@email.com',
      password: '@ApiUser123',
    });

    req.flush({ token: 'jwt-login-token' });

    const response = await promise;
    expect(response).toEqual({ token: 'jwt-login-token' });
    expect(localStorage.getItem('token')).toBe('jwt-login-token');
    expect(localStorage.getItem('user')).toContain('api.user@email.com');
  });

  it('deve fazer login mock de admin sem chamar API', async () => {
    const response = await service.login('fa.engeroff@gmail.com', '@Fabricio123456789');

    httpMock.expectNone('http://api.test/auth/login');
    expect(response).toEqual({ token: 'token_dev_admin_123' });
    expect(localStorage.getItem('token')).toBe('token_dev_admin_123');
    expect(localStorage.getItem('user')).toContain('fa.engeroff@gmail.com');
  });

  it('deve propagar erro da API no login', async () => {
    let erro: unknown;
    const promise = service.login('x@y.com', 'senhaErrada');

    const req = httpMock.expectOne('http://api.test/auth/login');
    req.flush('Credenciais inválidas', { status: 401, statusText: 'Unauthorized' });

    try {
      await promise;
    } catch (e) {
      erro = e;
    }

    expect(erro).toBeTruthy();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('deve remover sessão no logout', () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('user', JSON.stringify({ email: 'x@y.com' }));

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('deve chamar endpoint de registro com payload mapeado para backend', async () => {
    const payload = {
      nome: 'Novo',
      email: 'novo@email.com',
      senha: 'Senha123!',
      telefone: '11987654321',
    };

    const promise = service.register(payload);

    const req = httpMock.expectOne('http://api.test/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      name: 'Novo',
      email: 'novo@email.com',
      password: 'Senha123!',
      telefone: '(11) 98765-4321',
    });

    req.flush({ token: 'jwt-register-token' });

    const response = await promise;
    expect(response).toEqual({ token: 'jwt-register-token' });
    expect(localStorage.getItem('token')).toBe('jwt-register-token');
  });
});
