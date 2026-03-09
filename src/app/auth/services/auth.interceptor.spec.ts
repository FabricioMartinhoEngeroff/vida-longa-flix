import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor — Login & Register Scenarios', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  function setup(tokenValue: string | null) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { getToken: () => tokenValue } },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  // ─── B36. Auth Interceptor — injecao de token ────────────────

  describe('B36. Injecao de token', () => {
    it('#186 request para API com token JWT valido — adiciona Bearer header', () => {
      setup('header.payload.signature');

      http.get(`${environment.apiUrl}/favorites`).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/favorites`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer header.payload.signature');
      req.flush([]);
    });

    it('#187 request para API sem token — sem header Authorization', () => {
      setup(null);

      http.get(`${environment.apiUrl}/favorites`).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/favorites`);
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush([]);
    });

    it('#188 token invalido (sem 3 partes) — sem header', () => {
      setup('invalid-token');

      http.get(`${environment.apiUrl}/favorites`).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/favorites`);
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush([]);
    });

    it('#189 token "null" (string literal) — sem header', () => {
      setup('null');

      http.get(`${environment.apiUrl}/favorites`).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/favorites`);
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush([]);
    });

    it('#189b token "undefined" (string literal) — sem header', () => {
      setup('undefined');

      http.get(`${environment.apiUrl}/favorites`).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/favorites`);
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush([]);
    });

    it('#190 request para URL externa — token NAO vazado', () => {
      setup('header.payload.signature');

      http.get('https://example.com/anything').subscribe();

      const req = httpMock.expectOne('https://example.com/anything');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });

    it('#191 request para URL da API — token adicionado', () => {
      setup('a.b.c');

      http.get(`${environment.apiUrl}/users/me`).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer a.b.c');
      req.flush({});
    });

    it('#192 token com espacos nas pontas — trim antes de validar', () => {
      setup('  header.payload.signature  ');

      http.get(`${environment.apiUrl}/test`).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/test`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer header.payload.signature');
      req.flush({});
    });
  });
});
