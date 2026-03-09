import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { PasswordRecoveryService } from './service-password-recovery';
import { ApiService } from '../../api/api.service';
import { LoggerService } from '../logger.service';

describe('PasswordRecoveryService — Login & Register Scenarios', () => {
  let service: PasswordRecoveryService;

  const loggerMock = { log: vi.fn(), warn: vi.fn(), error: vi.fn() };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

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
  });

  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  // ─── B33. Validacao de token ─────────────────────────────────

  describe('B33. validateToken', () => {
    it('#176 token valido — retorna true', async () => {
      const p = service.validateToken('valid-token-123');
      vi.advanceTimersByTime(500);
      const result = await p;

      expect(result).toBe(true);
    });

    it('#177 token vazio — retorna false', async () => {
      const result = await service.validateToken('');
      expect(result).toBe(false);
    });
  });

  // ─── changePassword ──────────────────────────────────────────

  describe('changePassword', () => {
    it('token + password validos — resolve sem erro', async () => {
      const p = service.changePassword('token-abc', 'NewStrongPass1!');
      vi.advanceTimersByTime(1000);
      await p;

      expect(loggerMock.log).toHaveBeenCalled();
    });

    it('token vazio — lanca erro', async () => {
      let error: any;
      try {
        await service.changePassword('', 'pass');
      } catch (e) {
        error = e;
      }

      expect(error).toBeTruthy();
      expect(error.message).toBe('Token and new password are required');
    });

    it('password vazio — lanca erro', async () => {
      let error: any;
      try {
        await service.changePassword('token', '');
      } catch (e) {
        error = e;
      }

      expect(error).toBeTruthy();
      expect(error.message).toBe('Token and new password are required');
    });
  });
});
