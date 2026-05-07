import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from 'src/services/auth.service';

// Guard fonctionnel - protection des routes (pattern du cours)
// vérifie si l'utilisateur est connecté et possède le bon rôle
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const roles: string[] = route.data['roles'] || [];
  if (roles.length && !roles.includes(authService.role!)) {
    router.navigate(['/']);
    return false;
  }

  return true;
};