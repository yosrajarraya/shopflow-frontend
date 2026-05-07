import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponse, UserUpdateRequest } from 'src/Models/user.model';
import { environment } from 'src/environments/environment';

// Service utilisateurs (Admin) - gestion des comptes utilisateurs
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = `${environment.apiUrl}/admin/users`;

  constructor(private httpClient: HttpClient) {}

  listerUtilisateurs(): Observable<UserResponse[]> {
    return this.httpClient.get<UserResponse[]>(this.API);
  }

  voirUtilisateur(id: number): Observable<UserResponse> {
    return this.httpClient.get<UserResponse>(`${this.API}/${id}`);
  }

  modifierUtilisateur(id: number, request: UserUpdateRequest): Observable<UserResponse> {
    return this.httpClient.put<UserResponse>(`${this.API}/${id}`, request);
  }

  activerCompte(id: number): Observable<UserResponse> {
    return this.httpClient.put<UserResponse>(`${this.API}/${id}/activate`, null);
  }

  desactiverCompte(id: number): Observable<UserResponse> {
    return this.httpClient.put<UserResponse>(`${this.API}/${id}/deactivate`, null);
  }

  supprimerUtilisateur(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`);
  }
}
