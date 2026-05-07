import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddressRequest, AddressResponse } from 'src/Models/address.model';
import { environment } from 'src/environments/environment';

// Service profil - gestion des adresses de livraison
@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly API = `${environment.apiUrl}/profile`;

  constructor(private httpClient: HttpClient) {}

  getAddresses(): Observable<AddressResponse[]> {
    return this.httpClient.get<AddressResponse[]>(`${this.API}/addresses`);
  }

  createAddress(request: AddressRequest): Observable<AddressResponse> {
    return this.httpClient.post<AddressResponse>(`${this.API}/addresses`, request);
  }

  updateAddress(id: number, request: AddressRequest): Observable<AddressResponse> {
    return this.httpClient.put<AddressResponse>(`${this.API}/addresses/${id}`, request);
  }

  deleteAddress(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/addresses/${id}`);
  }

  setMainAddress(id: number): Observable<AddressResponse> {
    return this.httpClient.put<AddressResponse>(`${this.API}/addresses/${id}/principal`, null);
  }
}
