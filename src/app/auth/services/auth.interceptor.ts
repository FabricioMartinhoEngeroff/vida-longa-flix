import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const url = req.url ?? '';

<<<<<<< HEAD
  // Endpoints públicos: não precisam (nem devem) receber Authorization.
  if (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/password-recovery') ||
    url.includes('/auth/password-change')
  ) {
    return next(req);
  }

  const token = (authService.getToken() ?? '').trim();

  // Evita enviar "Bearer null/undefined" ou token vazio, o que quebra o backend.
  if (token && token !== 'null' && token !== 'undefined' && token.split('.').length === 3) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
=======
  if (!token) return next(req);

  // Avoid leaking the Bearer token to non-API requests (fonts, assets, 3rd-party URLs, etc).
  const apiBase = environment.apiUrl.replace(/\/+$/, '');
  if (!req.url.startsWith(apiBase)) return next(req);

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
  return next(authReq);

>>>>>>> feat/refactor-frontend-backend-communication
};
