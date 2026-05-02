import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CartItemRequest, CartResponse,
  CategoryRequest, CategoryResponse,
  OrderRequest, OrderResponse, OrderStatus,
  ReviewResponse
} from '../models';
import { environment } from '../../../environments/environment';

// ─── Cart Service ─────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly API = `${environment.apiUrl}/cart`;
  constructor(private http: HttpClient) {}

  voirPanier(): Observable<CartResponse> {
    return this.http.get<CartResponse>(this.API);
  }
  ajouterArticle(request: CartItemRequest): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.API}/items`, request);
  }
  modifierQuantite(itemId: number, quantite: number): Observable<CartResponse> {
    return this.http.put<CartResponse>(`${this.API}/items/${itemId}`, null, {
      params: new HttpParams().set('quantite', quantite)
    });
  }
  retirerArticle(itemId: number): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${this.API}/items/${itemId}`);
  }
  appliquerCoupon(code: string): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.API}/coupon`, null, {
      params: new HttpParams().set('code', code)
    });
  }
  retirerCoupon(): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${this.API}/coupon`);
  }
}

// ─── Order Service ────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly API = `${environment.apiUrl}/orders`;
  constructor(private http: HttpClient) {}

  passerCommande(request: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.API, request);
  }
  mesCommandes(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.API}/my`);
  }
  mesCommandesVendeur(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.API}/seller/my`);
  }
  voirCommande(id: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.API}/${id}`);
  }
  mettreAJourStatut(id: number, statut: OrderStatus): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(`${this.API}/${id}/status`, null, {
      params: new HttpParams().set('statut', statut)
    });
  }
  decisionVendeur(id: number, action: 'ACCEPT' | 'REFUSE'): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(`${this.API}/${id}/seller-decision`, null, {
      params: new HttpParams().set('action', action)
    });
  }
  annulerCommande(id: number): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(`${this.API}/${id}/cancel`, null);
  }
  toutesLesCommandes(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(this.API);
  }
}

// ─── Category Service ─────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly API = `${environment.apiUrl}/categories`;
  constructor(private http: HttpClient) {}

  listerCategories(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(this.API);
  }
  creerCategorie(request: CategoryRequest): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(this.API, request);
  }
  modifierCategorie(id: number, request: CategoryRequest): Observable<CategoryResponse> {
    return this.http.put<CategoryResponse>(`${this.API}/${id}`, request);
  }
  supprimerCategorie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}

// ─── Dashboard Service ────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly API = `${environment.apiUrl}/dashboard`;
  constructor(private http: HttpClient) {}

  dashboardAdmin(): Observable<any> {
    return this.http.get<any>(`${this.API}/admin`);
  }
  dashboardSeller(): Observable<any> {
    return this.http.get<any>(`${this.API}/seller`);
  }
}

// ─── Review Service ───────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly API = `${environment.apiUrl}/reviews`;
  constructor(private http: HttpClient) {}

  soumettreAvis(productId: number, orderId: number, note: number, commentaire: string): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(this.API, {
      productId,
      orderId,
      note,
      commentaire
    });
  }

  voirAvisProduit(productId: number): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(`${this.API}/product/${productId}`);
  }

  listerAvis(): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(`${this.API}`);
  }

  listerAvisVendeur(): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(`${this.API}/seller`);
  }

  listerAvisEnAttente(): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(`${this.API}/pending`);
  }

  approuverAvis(id: number): Observable<ReviewResponse> {
    return this.http.put<ReviewResponse>(`${this.API}/${id}/approve`, null);
  }

  rejeterAvis(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}

// ─── User Service (Admin) ─────────────────────────────────────────────────────
import { UserResponse, UserUpdateRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = `${environment.apiUrl}/admin/users`;
  constructor(private http: HttpClient) {}

  listerUtilisateurs(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.API);
  }
  voirUtilisateur(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.API}/${id}`);
  }
  modifierUtilisateur(id: number, request: UserUpdateRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.API}/${id}`, request);
  }
  activerCompte(id: number): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.API}/${id}/activate`, null);
  }
  desactiverCompte(id: number): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.API}/${id}/deactivate`, null);
  }
  supprimerUtilisateur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
