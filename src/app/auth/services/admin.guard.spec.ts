import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from './auth.service';
import { vi } from 'vitest';

describe('adminGuard', () => {
  const routerMock = { navigateByUrl: vi.fn() };

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  it('redirects to /authorization when user is not authenticated', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: { user: null } },
      ],
    });

    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(result).toBe(false);
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/authorization');
  });

  it('redirects to /app when user is not admin', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: { user: { roles: ['ROLE_USER'] } } },
      ],
    });

    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(result).toBe(false);
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/app');
  });

  it('allows navigation when user has ROLE_ADMIN', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: { user: { roles: ['ROLE_ADMIN'] } } },
      ],
    });

    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(result).toBe(true);
    expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
  });
});
