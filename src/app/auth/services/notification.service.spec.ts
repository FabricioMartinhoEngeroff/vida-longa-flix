import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { NotificationService } from './notification.service';
import {
  NotificationService as BaseNotificationService,
} from '../../shared/services/alert-message/alert-message.service';

describe('NotificationService — Login & Register Scenarios', () => {
  let service: NotificationService;

  const baseMock = {
    showDefault: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: BaseNotificationService, useValue: baseMock },
      ],
    });

    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ─── B41. NotificationService — proxies ──────────────────────

  describe('B41. Proxies de notificacao', () => {
    it('#225 showDefault com string — chama info', () => {
      service.showDefault('Mensagem texto');
      expect(baseMock.info).toHaveBeenCalledWith('Mensagem texto');
    });

    it('#226 showDefault com objeto — chama showDefault do base', () => {
      const msg = { type: 'success' as const, title: 'Sucesso', text: 'OK!' };
      service.showDefault(msg);
      expect(baseMock.showDefault).toHaveBeenCalledWith(msg);
    });

    it('#227 warning — delega ao base', () => {
      service.warning('Aviso');
      expect(baseMock.warning).toHaveBeenCalledWith('Aviso');
    });

    it('#228 error — delega ao base', () => {
      service.error('Erro grave');
      expect(baseMock.error).toHaveBeenCalledWith('Erro grave');
    });

    it('#229 success — delega ao base', () => {
      service.success('Sucesso!');
      expect(baseMock.success).toHaveBeenCalledWith('Sucesso!');
    });

    it('#230 info — delega ao base', () => {
      service.info('Informacao');
      expect(baseMock.info).toHaveBeenCalledWith('Informacao');
    });
  });
});
