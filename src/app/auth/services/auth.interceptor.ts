import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const url = req.url ?? '';

  const token = (authService.getToken() ?? '').trim();

  // Sem token valido → passa direto
  if (!token || token === 'null' || token === 'undefined' || token.split('.').length !== 3) {
    return next(req);
  }

  // Nao vaza Bearer token para URLs externas (fontes, assets, 3rd-party, etc).
  const apiBase = environment.apiUrl.replace(/\/+$/, '');
  if (!req.url.startsWith(apiBase)) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
  return next(authReq);
};
