import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  const routerMock = { navigate: vi.fn() };

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  it('allows navigation when authenticated', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: { isAuthenticated: () => true } },
      ],
    });

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('redirects to /login when not authenticated', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: { isAuthenticated: () => false } },
      ],
    });

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
