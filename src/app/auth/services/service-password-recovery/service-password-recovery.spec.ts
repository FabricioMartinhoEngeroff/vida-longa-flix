import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { PasswordRecoveryService } from './service-password-recovery';
import { ApiService } from '../../api/api.service';
import { LoggerService } from '../logger.service';
import { environment } from '../../../../environments/environment';

const BASE_URL = environment.apiUrl;

describe('PasswordRecoveryService — HTTP Integration', () => {
  let service: PasswordRecoveryService;
  let httpMock: HttpTestingController;

  const loggerMock = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ApiService,
        PasswordRecoveryService,
        { provide: LoggerService, useValue: loggerMock },
      ],
    });

    service = TestBed.inject(PasswordRecoveryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {

    httpMock.verify();
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  describe('B33. validateToken — chamadas HTTP reais', () => {

    it('#180 token vazio — retorna false sem fazer request HTTP', async () => {

      const result = await service.validateToken('');

      expect(result).toBe(false);
      httpMock.expectNone(`${BASE_URL}/auth/validate-token`);
    });

    it('#181 token valido — GET retorna 204 → service retorna true', async () => {

      const promise = service.validateToken('token-valido-abc123');
      const req = httpMock.expectOne(`${BASE_URL}/auth/validate-token?token=token-valido-abc123`);
      expect(req.request.method).toBe('GET');
      req.flush(null, { status: 204, statusText: 'No Content' });

      const result = await promise;
      expect(result).toBe(true);
    });

    it('#182 token expirado ou usado — GET retorna 410 → service retorna false', async () => {

      const promise = service.validateToken('token-expirado-xyz');

      const req = httpMock.expectOne(
        `${BASE_URL}/auth/validate-token?token=token-expirado-xyz`
      );

      req.flush(
        { message: 'Token expirado. Solicite um novo link.' },
        { status: 410, statusText: 'Gone' }
      );

      const result = await promise;
      expect(result).toBe(false);
    });

    it('#183 token nao encontrado — GET retorna 404 → service retorna false', async () => {
      const promise = service.validateToken('token-inexistente-999');

      const req = httpMock.expectOne(
        `${BASE_URL}/auth/validate-token?token=token-inexistente-999`
      );

      req.flush(
        { message: 'Token não encontrado.' },
        { status: 404, statusText: 'Not Found' }
      );

      const result = await promise;
      expect(result).toBe(false);
    });

    it('#184 erro de servidor 500 — service propaga a excecao', async () => {
      const promise = service.validateToken('token-qualquer');

      const req = httpMock.expectOne(
        `${BASE_URL}/auth/validate-token?token=token-qualquer`
      );

      req.flush(
        { message: 'Internal Server Error' },
        { status: 500, statusText: 'Internal Server Error' }
      );

      await expect(promise).rejects.toThrow();
    });
  });


  describe('changePassword — chamadas HTTP reais', () => {
    it('#185 token e password validos — POST 204 → resolve sem erro', async () => {
      const promise = service.changePassword('token-valido', 'NovaSenha@123');

      const req = httpMock.expectOne(`${BASE_URL}/auth/reset-password`);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        token: 'token-valido',
        newPassword: 'NovaSenha@123',
      });

      req.flush(null, { status: 204, statusText: 'No Content' });

      await expect(promise).resolves.toBeUndefined();
    });

    it('#186 token vazio — lanca erro sem fazer request', async () => {
      let error: any;
      try {
        await service.changePassword('', 'NovaSenha@123');
      } catch (e) {
        error = e;
      }

      expect(error).toBeTruthy();
      expect(error.message).toBe('Token and new password are required');
      httpMock.expectNone(`${BASE_URL}/auth/reset-password`);
    });

    it('#187 password vazio — lanca erro sem fazer request', async () => {
      let error: any;
      try {
        await service.changePassword('token-abc', '');
      } catch (e) {
        error = e;
      }

      expect(error).toBeTruthy();
      expect(error.message).toBe('Token and new password are required');
      httpMock.expectNone(`${BASE_URL}/auth/reset-password`);
    });

    it('#188 backend retorna 410 — service propaga o erro', async () => {
      const promise = service.changePassword('token-expirado', 'NovaSenha@123');

      const req = httpMock.expectOne(`${BASE_URL}/auth/reset-password`);
      req.flush(
        { message: 'Token expirado. Solicite um novo link.' },
        { status: 410, statusText: 'Gone' }
      );

      await expect(promise).rejects.toThrow();
    });
  });
});
