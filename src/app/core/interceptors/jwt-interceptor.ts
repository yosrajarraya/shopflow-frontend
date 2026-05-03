import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHandlerFn, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

function withAuthHeader(req: HttpRequest<any>, token: string | null): HttpRequest<any> {
  if (!token) {
    return req;
  }
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function isAuthRoute(url: string): boolean {
  return url.includes('/api/auth/login') || url.includes('/api/auth/register') || url.includes('/api/auth/refresh');
}

// Fonction interceptor (nouvelle syntaxe Angular)
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

// Classe interceptor (ancienne syntaxe, pour compatibilité)
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authReq = withAuthHeader(req, this.authService.token);
    return next.handle(authReq);
  }
}
