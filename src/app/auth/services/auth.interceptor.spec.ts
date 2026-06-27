import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor — Login & Register Scenarios', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('token');
    TestBed.resetTestingModule();
  });

  // ─── B36. Sem header Authorization — cookie cuida da sessao ──

  describe('B36. Sem header Authorization — cookie cuida da sessao', () => {
    it('#186 request para API — ignora token legado no storage, sem header Authorization', () => {
      localStorage.setItem('token', 'header.payload.signature'); // resquicio de antes da migracao
      setup();

      http.get(`${environment.apiUrl}/favorites`).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/favorites`);
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush([]);
    });

    it('#190 request para URL externa — nenhum header vazado, mesmo com token legado', () => {
      localStorage.setItem('token', 'header.payload.signature');
      setup();

      http.get('https://example.com/anything').subscribe();

      const req = httpMock.expectOne('https://example.com/anything');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });
  });

  describe('B37. withCredentials para autenticacao via cookie httpOnly', () => {
    it('#193 request para API — manda withCredentials para o cookie httpOnly', () => {
      setup();

      http.get(`${environment.apiUrl}/favorites`).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/favorites`);
      expect(req.request.withCredentials).toBe(true);
      req.flush([]);
    });

    it('#194 request para URL externa — withCredentials continua false', () => {
      setup();

      http.get('https://example.com/anything').subscribe();

      const req = httpMock.expectOne('https://example.com/anything');
      expect(req.request.withCredentials).toBe(false);
      req.flush({});
    });
  });

  // ─── B39. CSRF — proteção contra Cross-Site Request Forgery ──

  describe('B39. CSRF — withXsrfConfiguration habilitado', () => {
    function setupWithCsrf() {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(
            withInterceptors([authInterceptor]),
            withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
          ),
          provideHttpClientTesting(),
        ],
      });
      http = TestBed.inject(HttpClient);
      httpMock = TestBed.inject(HttpTestingController);
    }

    afterEach(() => {
      document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    });

    it('#195 POST para API com cookie CSRF — inclui header X-XSRF-TOKEN', () => {
      document.cookie = 'XSRF-TOKEN=csrf-abc123; path=/';
      setupWithCsrf();

      http.post(`${environment.apiUrl}/auth/login`, {}).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.headers.get('X-XSRF-TOKEN')).toBe('csrf-abc123');
      req.flush({});
    });

    it('#196 GET para API — nao inclui header CSRF (apenas metodos de escrita)', () => {
      document.cookie = 'XSRF-TOKEN=csrf-abc123; path=/';
      setupWithCsrf();

      http.get(`${environment.apiUrl}/videos`).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/videos`);
      expect(req.request.headers.has('X-XSRF-TOKEN')).toBe(false);
      req.flush([]);
    });
  });
});