import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApiService } from '../api/api.service';
import { LoggerService } from './logger.service';
import { AuthService } from './auth.service';
import { vi } from 'vitest';

describe('AuthService (session persistence)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const routerMock = { navigateByUrl: vi.fn(), navigate: vi.fn() };
  const loggerMock = { log: vi.fn(), warn: vi.fn(), error: vi.fn() };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerMock },
        { provide: LoggerService, useValue: loggerMock },
        ApiService,
        AuthService,
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  it('stores token in sessionStorage when keepLoggedIn=false', async () => {
    const p = service.login('test@email.com', '123456', false);

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({
      token: 't-session',
      user: { id: 'u1', name: 'User', email: 'test@email.com', profileComplete: true, roles: ['ROLE_USER'] },
    });

    await p;

    expect(sessionStorage.getItem('token')).toBe('t-session');
    expect(localStorage.getItem('token')).toBeNull();
    expect(service.getToken()).toBe('t-session');
  });

  it('stores token in localStorage when keepLoggedIn=true', async () => {
    const p = service.login('test@email.com', '123456', true);

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({
      token: 't-local',
      user: { id: 'u1', name: 'User', email: 'test@email.com', profileComplete: true, roles: ['ROLE_USER'] },
    });

    await p;

    expect(localStorage.getItem('token')).toBe('t-local');
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(service.getToken()).toBe('t-local');
  });

  it('keeps the same storage type when refreshing /users/me', async () => {
    // Seed a session-only login state
    sessionStorage.setItem('token', 't-session');
    sessionStorage.setItem('user', JSON.stringify({ id: 'u1', name: 'User', email: 'x', profileComplete: true }));

    const p = service.fetchAuthenticatedUser();
    const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'u1', name: 'User Atualizado', email: 'x', profileComplete: true, roles: ['ROLE_USER'] });

    await p;

    expect(sessionStorage.getItem('token')).toBe('t-session');
    expect(localStorage.getItem('token')).toBeNull();
    expect(JSON.parse(sessionStorage.getItem('user') || '{}').name).toBe('User Atualizado');
  });

  it('register posts canonical payload (lowercase email + formatted phone)', async () => {
    const p = service.register({
      name: '  Fabricio  ',
      email: '  FABRICIO@EMAIL.COM  ',
      password: 'StrongPass1!',
      phone: '(11) 98765-4321',
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      name: 'Fabricio',
      email: 'fabricio@email.com',
      password: 'StrongPass1!',
      phone: '(11) 98765-4321',
    });

    req.flush({
      token: 't-local',
      user: {
        id: 'u1',
        name: 'Fabricio',
        email: 'fabricio@email.com',
        phone: '11987654321',
        profileComplete: false,
        roles: ['ROLE_USER'],
      },
    });

    await p;

    expect(localStorage.getItem('token')).toBe('t-local');
    expect(sessionStorage.getItem('token')).toBeNull();
  });
});
