import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReviewResponse } from 'src/Models/review.model';
import { environment } from 'src/environments/environment';

// Service avis - gestion des avis produits
@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly API = `${environment.apiUrl}/reviews`;

  constructor(private httpClient: HttpClient) {}

  soumettreAvis(productId: number, orderId: number, note: number, commentaire: string): Observable<ReviewResponse> {
    return this.httpClient.post<ReviewResponse>(this.API, { productId, orderId, note, commentaire });
  }

  voirAvisProduit(productId: number): Observable<ReviewResponse[]> {
    return this.httpClient.get<ReviewResponse[]>(`${this.API}/product/${productId}`);
  }

  listerAvis(): Observable<ReviewResponse[]> {
    return this.httpClient.get<ReviewResponse[]>(this.API);
  }

  listerAvisVendeur(): Observable<ReviewResponse[]> {
    return this.httpClient.get<ReviewResponse[]>(`${this.API}/seller`);
  }

  listerAvisEnAttente(): Observable<ReviewResponse[]> {
    return this.httpClient.get<ReviewResponse[]>(`${this.API}/pending`);
  }

  approuverAvis(id: number): Observable<ReviewResponse> {
    return this.httpClient.put<ReviewResponse>(`${this.API}/${id}/approve`, null);
  }

  desapprouverAvis(id: number): Observable<ReviewResponse> {
    return this.httpClient.put<ReviewResponse>(`${this.API}/${id}/disapprove`, null);
  }

  rejeterAvis(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`);
  }
}
