import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { getToken: () => 'test-token' } },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('adds Authorization header only for API requests', () => {
    http.get(`${environment.apiUrl}/favorites`).subscribe();

    const apiReq = httpMock.expectOne(`${environment.apiUrl}/favorites`);
    expect(apiReq.request.headers.get('Authorization')).toBe('Bearer test-token');
    apiReq.flush([]);

    http.get('https://example.com/anything').subscribe();

    const externalReq = httpMock.expectOne('https://example.com/anything');
    expect(externalReq.request.headers.has('Authorization')).toBe(false);
    externalReq.flush({});
  });
});

