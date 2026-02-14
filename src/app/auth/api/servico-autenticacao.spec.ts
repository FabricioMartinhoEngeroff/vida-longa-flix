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

  it('deve fazer login com credenciais válidas e salvar token', async () => {
    const response = await service.login('fa.engeroff@gmail.com', '@Fabricio123456789');

    expect(response.token).toBeTruthy();
    expect(localStorage.getItem('token')).toBeTruthy();
    expect(localStorage.getItem('user')).toContain('fa.engeroff@gmail.com');
  });

  it('deve falhar login com credenciais inválidas', async () => {
    let erro: unknown;
    try {
      await service.login('x@y.com', 'senhaErrada');
    } catch (e) {
      erro = e;
    }

    expect(erro).toBeTruthy();
    expect((erro as Error).message).toContain('Credenciais inválidas');
  });

  it('deve remover sessão no logout', async () => {
    await service.login('demo@vidalonga.com', '@Demo123456');

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('deve chamar endpoint de registro', async () => {
    const payload = { nome: 'Novo', email: 'novo@email.com', senha: 'Senha123!' };
    const promise = service.register(payload as any);

    const req = httpMock.expectOne('http://api.test/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush({ ok: true });

    const response = await promise;
    expect(response).toEqual({ ok: true });
  });
});
