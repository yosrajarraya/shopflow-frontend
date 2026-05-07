import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface CouponResponse {
  id: number;
  code: string;
  type: 'PERCENT' | 'FIXED';
  valeur: number;
  dateExpiration: string | null;
  usagesMax: number;
  usagesActuels: number;
  actif: boolean;
}

export interface CouponRequest {
  code: string;
  type: 'PERCENT' | 'FIXED';
  valeur: number;
  dateExpiration: string | null;
  usagesMax: number;
  actif: boolean;
}

// Service coupons (Admin) - gestion des codes promo
@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly API = `${environment.apiUrl}/coupons`;

  constructor(private httpClient: HttpClient) {}

  listerCoupons(): Observable<CouponResponse[]> {
    return this.httpClient.get<CouponResponse[]>(this.API);
  }

  creerCoupon(request: CouponRequest): Observable<CouponResponse> {
    return this.httpClient.post<CouponResponse>(this.API, request);
  }

  modifierCoupon(id: number, request: CouponRequest): Observable<CouponResponse> {
    return this.httpClient.put<CouponResponse>(`${this.API}/${id}`, request);
  }

  supprimerCoupon(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`);
  }
}
