import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CartItemRequest, CartResponse } from 'src/Models/cart.model';
import { environment } from 'src/environments/environment';

// Service panier - gère les articles du panier et les coupons
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly API = `${environment.apiUrl}/cart`;
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private httpClient: HttpClient) {}

  voirPanier(): Observable<CartResponse> {
    return this.httpClient.get<CartResponse>(this.API).pipe(
      tap(cart => this.updateCartCount(cart))
    );
  }

  ajouterArticle(request: CartItemRequest): Observable<CartResponse> {
    return this.httpClient.post<CartResponse>(`${this.API}/items`, request).pipe(
      tap(cart => this.updateCartCount(cart))
    );
  }

  modifierQuantite(itemId: number, quantite: number): Observable<CartResponse> {
    return this.httpClient.put<CartResponse>(`${this.API}/items/${itemId}`, null, {
      params: new HttpParams().set('quantite', quantite)
    }).pipe(
      tap(cart => this.updateCartCount(cart))
    );
  }

  retirerArticle(itemId: number): Observable<CartResponse> {
    return this.httpClient.delete<CartResponse>(`${this.API}/items/${itemId}`).pipe(
      tap(cart => this.updateCartCount(cart))
    );
  }

  appliquerCoupon(code: string): Observable<CartResponse> {
    return this.httpClient.post<CartResponse>(`${this.API}/coupon`, null, {
      params: new HttpParams().set('code', code)
    }).pipe(
      tap(cart => this.updateCartCount(cart))
    );
  }

  retirerCoupon(): Observable<CartResponse> {
    return this.httpClient.delete<CartResponse>(`${this.API}/coupon`).pipe(
      tap(cart => this.updateCartCount(cart))
    );
  }

  refreshCartCount(): void {
    this.voirPanier().subscribe({
      next: () => {},
      error: () => this.cartCountSubject.next(0)
    });
  }

  private updateCartCount(cart: CartResponse | null | undefined): void {
    this.cartCountSubject.next(cart?.lignes?.length || 0);
  }
}
