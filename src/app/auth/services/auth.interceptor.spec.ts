import { vi } from 'vitest';
import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

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

  // ─── B39b. CSRF em producao — apiUrl ABSOLUTA cross-origin (regressao do 403) ──
  // O interceptor XSRF embutido do Angular NAO anexa X-XSRF-TOKEN em URLs absolutas
  // (http/https) para nao vazar o token cross-origin. Em producao apiUrl e absoluta
  // (front vidalongaflix.com -> api.vidalongaflix.com), entao o header nunca ia, e o
  // backend rejeitava toda mutacao com 403. O authInterceptor deve suprir o header
  // para a nossa API — e somente para ela.

  describe('B39b. CSRF com apiUrl absoluta (producao) — regressao 403', () => {
    const PROD_API = 'https://api.vidalongaflix.com/api';
    let originalApiUrl: string;

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

    beforeEach(() => {
      originalApiUrl = environment.apiUrl;
      environment.apiUrl = PROD_API; // simula o build de producao (URL absoluta)
    });

    afterEach(() => {
      environment.apiUrl = originalApiUrl;
      document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    });

    it('#197 POST para API absoluta com cookie CSRF — inclui header X-XSRF-TOKEN', () => {
      document.cookie = 'XSRF-TOKEN=csrf-prod-777; path=/';
      setupWithCsrf();

      http.post(`${PROD_API}/auth/login`, {}).subscribe();

      const req = httpMock.expectOne(`${PROD_API}/auth/login`);
      expect(req.request.headers.get('X-XSRF-TOKEN')).toBe('csrf-prod-777');
      req.flush({});
    });

    it('#198 GET para API absoluta — nao inclui header CSRF (apenas metodos de escrita)', () => {
      document.cookie = 'XSRF-TOKEN=csrf-prod-777; path=/';
      setupWithCsrf();

      http.get(`${PROD_API}/videos`).subscribe();

      const req = httpMock.expectOne(`${PROD_API}/videos`);
      expect(req.request.headers.has('X-XSRF-TOKEN')).toBe(false);
      req.flush([]);
    });

    it('#199 POST para URL externa (terceiro) — nunca vaza o token CSRF', () => {
      document.cookie = 'XSRF-TOKEN=csrf-prod-777; path=/';
      setupWithCsrf();

      http.post('https://malicious.example.com/steal', {}).subscribe();

      const req = httpMock.expectOne('https://malicious.example.com/steal');
      expect(req.request.headers.has('X-XSRF-TOKEN')).toBe(false);
      req.flush({});
    });
  });

  // ─── B40. Sessao expirada — 401 dispara logout global, exceto endpoints de auth ──
  // Com sessao via cookie httpOnly, isAuthenticated() olha so o user salvo. Se o cookie
  // expira mas o user persiste, o front "acha" que esta logado ate tomar 401. Aqui o
  // interceptor detecta o 401 numa chamada autenticada e delega a limpeza+redirect ao
  // AuthService. Endpoints /auth/ (login, register) tratam o proprio 401 no componente.

  describe('B40. Sessao expirada (401) — logout global exceto /auth/', () => {
    let authMock: { handleSessionExpired: ReturnType<typeof vi.fn> };

    function setupWithAuth() {
      authMock = { handleSessionExpired: vi.fn() };
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withInterceptors([authInterceptor])),
          provideHttpClientTesting(),
          { provide: AuthService, useValue: authMock },
        ],
      });
      http = TestBed.inject(HttpClient);
      httpMock = TestBed.inject(HttpTestingController);
    }

    it('#200 401 numa chamada autenticada (nao-auth) — dispara handleSessionExpired', () => {
      setupWithAuth();

      http.get(`${environment.apiUrl}/users/me`).subscribe({ error: () => {} });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
      req.flush({ message: 'expired' }, { status: 401, statusText: 'Unauthorized' });

      expect(authMock.handleSessionExpired).toHaveBeenCalledTimes(1);
    });

    it('#201 401 em /auth/login — NAO dispara logout global (erro tratado no componente)', () => {
      setupWithAuth();

      http.post(`${environment.apiUrl}/auth/login`, {}).subscribe({ error: () => {} });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: 'credenciais invalidas' }, { status: 401, statusText: 'Unauthorized' });

      expect(authMock.handleSessionExpired).not.toHaveBeenCalled();
    });

    it('#202 403 (CSRF) numa chamada autenticada — NAO dispara logout (apenas 401)', () => {
      setupWithAuth();

      http.post(`${environment.apiUrl}/comments`, {}).subscribe({ error: () => {} });

      const req = httpMock.expectOne(`${environment.apiUrl}/comments`);
      req.flush({}, { status: 403, statusText: 'Forbidden' });

      expect(authMock.handleSessionExpired).not.toHaveBeenCalled();
    });
  });
});