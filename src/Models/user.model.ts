export interface UserResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  actif: boolean;
  dateCreation: string;
  nombreCommandes?: number;
  totalDepense?: number;
}

export interface UserUpdateRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
}
