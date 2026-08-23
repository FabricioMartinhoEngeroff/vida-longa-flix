import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { EnvironmentInjector, inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

const XSRF_COOKIE = 'XSRF-TOKEN';
const XSRF_HEADER = 'X-XSRF-TOKEN';
const MUTATING_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

function readXsrfToken(): string | null {
  const prefix = `${XSRF_COOKIE}=`;
  const cookie = document.cookie.split('; ').find((c) => c.startsWith(prefix));
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBase = environment.apiUrl.replace(/\/+$/, '');
  if (!req.url.startsWith(apiBase)) {
    return next(req);
  }

  // Resolvido de forma lazy: o AuthService so e obtido se um 401 de fato acontecer,
  // evitando construi-lo (e suas dependencias) em toda requisicao.
  const injector = inject(EnvironmentInjector);

  let apiReq = req.clone({ withCredentials: true });

  // O interceptor XSRF embutido do Angular NAO anexa X-XSRF-TOKEN em URLs absolutas
  // (http/https) para evitar vazar o token cross-origin. Em producao a apiUrl e absoluta
  // (front vidalongaflix.com -> api.vidalongaflix.com), entao o header nunca ia e o backend
  // rejeitava toda mutacao com 403. Suprimos aqui — apenas para a NOSSA API (garantido pelo
  // early return acima) e apenas em metodos que alteram estado. Nao sobrescreve um header ja
  // presente (caso a apiUrl seja relativa e o interceptor embutido ja o tenha adicionado).
  if (MUTATING_METHODS.has(req.method) && !apiReq.headers.has(XSRF_HEADER)) {
    const token = readXsrfToken();
    if (token) {
      apiReq = apiReq.clone({ headers: apiReq.headers.set(XSRF_HEADER, token) });
    }
  }

  return next(apiReq).pipe(
    catchError((error: unknown) => {
      // 401 numa chamada autenticada => cookie de sessao expirou/invalido. Endpoints de
      // /auth/ (login, register) tratam o proprio 401 no componente, entao sao ignorados.
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !req.url.includes('/auth/')
      ) {
        injector.get(AuthService).handleSessionExpired();
      }
      return throwError(() => error);
    }),
  );
};
