import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpRequest, HttpHandlerFn, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth';

// Fonction interceptor (nouvelle syntaxe Angular)
export function jwtInterceptorFn(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  const authService = inject(AuthService);
  const token = authService.token;
  console.log('🔐 JwtInterceptor - Token:', token);
  console.log('🔐 JwtInterceptor - URL:', req.url);
  if (token) {
    console.log('✅ Adding Authorization header');
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  } else {
    console.log('❌ NO TOKEN FOUND');
  }
  return next(req);
}

// Classe interceptor (ancienne syntaxe, pour compatibilité)
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.token;
    console.log('🔐 JwtInterceptor - Token:', token);
    console.log('🔐 JwtInterceptor - URL:', req.url);
    if (token) {
      console.log('✅ Adding Authorization header');
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    } else {
      console.log('❌ NO TOKEN FOUND');
    }
    return next.handle(req);
  }
}
