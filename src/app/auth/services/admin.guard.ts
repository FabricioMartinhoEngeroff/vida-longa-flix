import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

// Guard funcional — padrão Angular 16+
// Verifica se o usuário autenticado tem ROLE_ADMIN
// Se não tiver, redireciona para /app sem expor a rota
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.user;

  if (!user) {
    router.navigateByUrl('/authorization');
    return false;
  }

  // Verifica se o usuário tem ROLE_ADMIN nas roles
  const isAdmin = user.roles?.some(
    (role: string) => role === 'ROLE_ADMIN'
  );

  if (!isAdmin) {
    // Usuário autenticado mas sem permissão — volta para home
    router.navigateByUrl('/app');
    return false;
  }

  return true;
};