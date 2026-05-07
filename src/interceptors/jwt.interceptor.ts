import { inject } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from 'src/services/auth.service';

// Intercepteur HTTP fonctionnel (pattern Angular moderne)
// Ajoute le token JWT à chaque requête et gère le refresh automatique

function withAuthHeader(req: HttpRequest<any>, token: string | null): HttpRequest<any> {
  if (!token) return req;
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function isAuthRoute(url: string): boolean {
  return url.includes('/api/auth/login') ||
    url.includes('/api/auth/register') ||
    url.includes('/api/auth/refresh');
}

// Intercepteur fonctionnel (nouvelle syntaxe Angular)
export function jwtInterceptorFn(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  const authService = inject(AuthService);
  const authReq = withAuthHeader(req, authService.token);

  if (isAuthRoute(req.url)) {
    return next(authReq);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }
      // Tenter de rafraîchir le token
      return authService.refreshToken().pipe(
        switchMap((auth) => {
          const retryReq = withAuthHeader(req, auth.accessToken);
          return next(retryReq);
        }),
        catchError((refreshError) => {
          authService.logout();
          return throwError(() => refreshError);
        })
      );
    })
  );
}