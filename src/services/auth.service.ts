import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest, RegisterRequest } from 'src/Models/auth.model';
import { environment } from 'src/environments/environment';

// Service d'authentification - gère la connexion, inscription et tokens JWT
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private httpClient: HttpClient, private router: Router) {}

  // Connexion avec email et mot de passe
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.API}/login`, request).pipe(
      tap(res => this.storeUser(res))
    );
  }

  // Inscription client
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.API}/register`, request).pipe(
      tap(res => this.storeUser(res))
    );
  }

  // Inscription vendeur
  registerSeller(request: RegisterRequest): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.API}/register/seller`, request).pipe(
      tap(res => this.storeUser(res))
    );
  }

  // Rafraîchir le token JWT
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.currentUser?.refreshToken;
    if (!refreshToken) {
      return throwError(() => new Error('Refresh token absent'));
    }
    return this.httpClient.post<AuthResponse>(`${this.API}/refresh`, null, {
      params: { refreshToken }
    }).pipe(
      tap(res => this.storeUser({ ...this.currentUser, ...res } as AuthResponse))
    );
  }

  // Déconnexion
  logout(): void {
    localStorage.removeItem('shopflow_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  // Mot de passe oublié
  forgotPassword(email: string): Observable<string> {
    return this.httpClient.post<string>(`${this.API}/forgot-password`, { email });
  }

  // Réinitialisation du mot de passe
  resetPassword(token: string, newPassword: string): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.API}/reset-password`, { token, newPassword }).pipe(
      tap(res => this.storeUser(res))
    );
  }

  // Getters utilitaires
  get currentUser(): AuthResponse | null { return this.currentUserSubject.value; }
  get token(): string | null { return this.currentUser?.accessToken ?? null; }
  get role(): string | null { return this.currentUser?.role ?? null; }
  isLoggedIn(): boolean { return !!this.currentUser; }
  isAdmin(): boolean { return this.role === 'ADMIN'; }
  isSeller(): boolean { return this.role === 'SELLER'; }
  isCustomer(): boolean { return this.role === 'CUSTOMER'; }

  // Persister l'utilisateur dans le localStorage
  private storeUser(user: AuthResponse): void {
    localStorage.setItem('shopflow_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // Récupérer l'utilisateur stocké
  private getStoredUser(): AuthResponse | null {
    const stored = localStorage.getItem('shopflow_user');
    return stored ? JSON.parse(stored) : null;
  }
}
