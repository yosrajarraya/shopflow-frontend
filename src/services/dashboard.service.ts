import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// Service dashboard - statistiques pour admin et vendeur
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly API = `${environment.apiUrl}/dashboard`;

  constructor(private httpClient: HttpClient) {}

  dashboardAdmin(): Observable<any> {
    return this.httpClient.get<any>(`${this.API}/admin`);
  }

  dashboardSeller(): Observable<any> {
    return this.httpClient.get<any>(`${this.API}/seller`);
  }

  getProductSalesVsStock(limit: number = 10): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.API}/product-sales-vs-stock?limit=${limit}`);
  }
}
