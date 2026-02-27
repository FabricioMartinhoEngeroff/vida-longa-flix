import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

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

};
