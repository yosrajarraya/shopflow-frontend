import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryRequest, CategoryResponse } from 'src/Models/category.model';
import { environment } from 'src/environments/environment';

// Service catégories - gère le catalogue de catégories
@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly API = `${environment.apiUrl}/categories`;

  constructor(private httpClient: HttpClient) {}

  listerCategories(): Observable<CategoryResponse[]> {
    return this.httpClient.get<CategoryResponse[]>(this.API);
  }

  creerCategorie(request: CategoryRequest): Observable<CategoryResponse> {
    return this.httpClient.post<CategoryResponse>(this.API, request);
  }

  modifierCategorie(id: number, request: CategoryRequest): Observable<CategoryResponse> {
    return this.httpClient.put<CategoryResponse>(`${this.API}/${id}`, request);
  }

  supprimerCategorie(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`);
  }
}
