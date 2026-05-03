import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HomeStats, Page, ProductRequest, ProductResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly API = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  listerProduits(page = 0, size = 12, sort = 'dateCreation'): Observable<Page<ProductResponse>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort + ',desc');
    return this.http.get<Page<ProductResponse>>(this.API, { params });
  }

  filtrerProduits(
    categoryId: number | null,
    prixMin: number | null,
    prixMax: number | null,
    promo: boolean,
    page = 0,
    sort = 'dateCreation'
  ): Observable<Page<ProductResponse>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', 12)
      .set('sort', sort + ',desc')
      .set('promo', promo);
    if (categoryId != null) params = params.set('categoryId', categoryId);
    if (prixMin != null)    params = params.set('prixMin', prixMin);
    if (prixMax != null)    params = params.set('prixMax', prixMax);
    return this.http.get<Page<ProductResponse>>(this.API, { params });
  }

  voirProduit(id: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.API}/${id}`);
  }

  rechercher(q: string, page = 0, size = 12): Observable<Page<ProductResponse>> {
    const params = new HttpParams().set('q', q).set('page', page).set('size', size);
    return this.http.get<Page<ProductResponse>>(`${this.API}/search`, { params });
  }

  topVentes(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.API}/top-selling`);
  }

  statistiquesAccueil(): Observable<HomeStats> {
    return this.http.get<HomeStats>(`${this.API}/stats`);
  }

  promos(page = 0, size = 12): Observable<Page<ProductResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<ProductResponse>>(`${this.API}/promos`, { params });
  }

  creerProduit(request: ProductRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.API, request);
  }

  modifierProduit(id: number, request: ProductRequest): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.API}/${id}`, request);
  }

  desactiverProduit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  supprimerProduit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  mesProduits(page = 0, size = 12): Observable<Page<ProductResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<ProductResponse>>(`${this.API}/my`, { params });
  }
}
