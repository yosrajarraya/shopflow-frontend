import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddressResponse, AddressRequest } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly API = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  // ─── Address Management ─────────────────────────────────────────────
  getAddresses(): Observable<AddressResponse[]> {
    return this.http.get<AddressResponse[]>(`${this.API}/addresses`);
  }

  createAddress(request: AddressRequest): Observable<AddressResponse> {
    return this.http.post<AddressResponse>(`${this.API}/addresses`, request);
  }

  updateAddress(id: number, request: AddressRequest): Observable<AddressResponse> {
    return this.http.put<AddressResponse>(`${this.API}/addresses/${id}`, request);
  }

  deleteAddress(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/addresses/${id}`);
  }

  setMainAddress(id: number): Observable<AddressResponse> {
    return this.http.put<AddressResponse>(`${this.API}/addresses/${id}/principal`, null);
  }
}
