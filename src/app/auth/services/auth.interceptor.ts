import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBase = environment.apiUrl.replace(/\/+$/, '');
  if (!req.url.startsWith(apiBase)) {
    return next(req);
  }

  return next(req.clone({ withCredentials: true }));
};