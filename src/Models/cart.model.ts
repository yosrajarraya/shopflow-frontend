export interface CartItemResponse {
  id: number;
  productId: number;
  productNom: string;
  productImage: string;
  prixUnitaire: number;
  quantite: number;
  sousTotal: number;
  variantId?: number;
  variantInfo?: string;
}

export interface CartResponse {
  id: number;
  lignes: CartItemResponse[];
  codeCoupon?: string;
  sousTotal: number;
  remise: number;
  fraisLivraison: number;
  totalTTC: number;
}

export interface CartItemRequest {
  productId: number;
  quantite: number;
  variantId?: number;
}
