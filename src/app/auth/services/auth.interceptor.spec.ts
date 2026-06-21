import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
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
});