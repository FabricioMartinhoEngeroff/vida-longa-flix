import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../api/api.service';
import { EmailService } from './email.service';

describe('EmailService — Login & Register Scenarios', () => {
  let service: EmailService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ApiService,
        EmailService,
      ],
    });

    service = TestBed.inject(EmailService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  // ─── B27. EmailService — sendPasswordRecovery ────────────────

  describe('B27. sendPasswordRecovery', () => {
    it('#148 envia POST com email normalizado', async () => {
      const p = service.sendPasswordRecovery('  User@EXAMPLE.COM  ');

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/password-recovery`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'user@example.com' });
      req.flush(null);

      await p;
    });

    it('#149 email com espacos/maiusculas — normaliza trim+lowercase', async () => {
      const p = service.sendPasswordRecovery('  Maria@Gmail.COM  ');

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/password-recovery`);
      expect(req.request.body.email).toBe('maria@gmail.com');
      req.flush(null);

      await p;
    });

    it('#150 email vazio — lanca erro sem fazer request', async () => {
      let error: any;
      try {
        await service.sendPasswordRecovery('');
      } catch (e) {
        error = e;
      }

      expect(error).toBeTruthy();
      expect(error.message).toBe('Email is required for password recovery.');
      httpMock.expectNone(`${environment.apiUrl}/auth/password-recovery`);
    });
  });
});
