import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, request).pipe(
      tap(res => this.storeUser(res))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, request).pipe(
      tap(res => this.storeUser(res))
    );
  }

  registerSeller(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register/seller`, request).pipe(
      tap(res => this.storeUser(res))
    );
  }

  logout(): void {
    localStorage.removeItem('shopflow_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  get currentUser(): AuthResponse | null { return this.currentUserSubject.value; }
  get token(): string | null { return this.currentUser?.accessToken ?? null; }
  get role(): string | null { return this.currentUser?.role ?? null; }
  isLoggedIn(): boolean { return !!this.currentUser; }
  isAdmin(): boolean { return this.role === 'ADMIN'; }
  isSeller(): boolean { return this.role === 'SELLER'; }
  isCustomer(): boolean { return this.role === 'CUSTOMER'; }

  private storeUser(user: AuthResponse): void {
    console.log('💾 Storing user:', user);
    localStorage.setItem('shopflow_user', JSON.stringify(user));
    const stored = localStorage.getItem('shopflow_user');
    console.log('✅ Verified stored in localStorage:', stored);
    this.currentUserSubject.next(user);
  }

  private getStoredUser(): AuthResponse | null {
    const stored = localStorage.getItem('shopflow_user');
    return stored ? JSON.parse(stored) : null;
  }
}
