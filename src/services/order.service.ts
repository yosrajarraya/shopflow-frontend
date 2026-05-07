import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderRequest, OrderResponse, OrderStatus } from 'src/Models/order.model';
import { environment } from 'src/environments/environment';

// Service commandes - gère les commandes clients et vendeurs
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly API = `${environment.apiUrl}/orders`;

  constructor(private httpClient: HttpClient) {}

  passerCommande(request: OrderRequest): Observable<OrderResponse> {
    return this.httpClient.post<OrderResponse>(this.API, request);
  }

  mesCommandes(): Observable<OrderResponse[]> {
    return this.httpClient.get<OrderResponse[]>(`${this.API}/my`);
  }

  mesCommandesVendeur(): Observable<OrderResponse[]> {
    return this.httpClient.get<OrderResponse[]>(`${this.API}/seller/my`);
  }

  voirCommande(id: number): Observable<OrderResponse> {
    return this.httpClient.get<OrderResponse>(`${this.API}/${id}`);
  }

  mettreAJourStatut(id: number, statut: OrderStatus): Observable<OrderResponse> {
    return this.httpClient.put<OrderResponse>(`${this.API}/${id}/status`, null, {
      params: new HttpParams().set('statut', statut)
    });
  }

  decisionVendeur(id: number, action: 'ACCEPT' | 'REFUSE'): Observable<OrderResponse> {
    return this.httpClient.put<OrderResponse>(`${this.API}/${id}/seller-decision`, null, {
      params: new HttpParams().set('action', action)
    });
  }

  annulerCommande(id: number): Observable<OrderResponse> {
    return this.httpClient.put<OrderResponse>(`${this.API}/${id}/cancel`, null);
  }

  toutesLesCommandes(): Observable<OrderResponse[]> {
    return this.httpClient.get<OrderResponse[]>(this.API);
  }
}
