export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItemResponse {
  id: number;
  productId: number;
  productNom: string;
  productImage?: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
  variantInfo?: string;
}

export interface OrderResponse {
  id: number;
  numeroCommande: string;
  statut: OrderStatus;
  adresseLivraison: string;
  sousTotal: number;
  fraisLivraison: number;
  totalTTC: number;
  dateCommande: string;
  isNew: boolean;
  customerId: number;
  customerNom: string;
  lignes: OrderItemResponse[];
}

export interface OrderRequest {
  adresseLivraison?: string;
  addressId?: number;
  notes?: string;
}
