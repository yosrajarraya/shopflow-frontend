// ─── Auth ────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
}

// ─── Category ────────────────────────────────────────────────────────────────
export interface CategoryResponse {
  id: number;
  nom: string;
  description?: string;
  parentId?: number;
  children?: CategoryResponse[];
}

export interface CategoryRequest {
  nom: string;
  description?: string;
  parentId?: number;
}

// ─── Product ─────────────────────────────────────────────────────────────────
export interface VariantResponse {
  id: number;
  attribut: string;
  valeur: string;
  stockSupplementaire: number;
  prixDelta: number;
}

export interface ReviewResponse {
  id: number;
  customerId: number;
  customerNom: string;
  note: number;
  commentaire: string;
  dateCreation: string;
  approuve: boolean;
}

export interface ProductResponse {
  id: number;
  nom: string;
  description: string;
  prix: number;
  prixPromo?: number;
  pourcentageRemise?: number;
  stock: number;
  actif: boolean;
  dateCreation: string;
  nombreVentes: number;
  sellerId: number;
  sellerNom: string;
  sellerBoutique: string;
  categories: CategoryResponse[];
  images: string[];
  variantes: VariantResponse[];
  avis: ReviewResponse[];
  noteMoyenne: number;
}

export interface ProductRequest {
  nom: string;
  description: string;
  prix: number;
  prixPromo?: number;
  stock: number;
  categoryIds: number[];
  images: string[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface HomeStats {
  totalProduits: number;
  totalVendeurs: number;
  totalClients: number;
  noteMoyenne: number;
}

// ─── Cart ────────────────────────────────────────────────────────────────────
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

// ─── Order ───────────────────────────────────────────────────────────────────
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

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface DashboardAdmin {
  chiffreAffaires: number;
  totalCommandes: number;
  totalProduits: number;
  totalClients: number;
  commandesRecentes: OrderResponse[];
  topProduits: ProductResponse[];
  ventesParMois: { mois: string; montant: number }[];
}

export interface DashboardSeller {
  commandesEnAttente: number;
  totalProduits: number;
  alertesStock: ProductResponse[];
  commandesRecentes: OrderResponse[];
  revenuMois: number;
}

// ─── User (Admin) ─────────────────────────────────────────────────────────────
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

// ─── Address ─────────────────────────────────────────────────────────────────
export interface AddressResponse {
  id: number;
  rue: string;
  ville: string;
  codePostal: string;
  pays: string;
  principal: boolean;
}

export interface AddressRequest {
  rue: string;
  ville: string;
  codePostal: string;
  pays: string;
  principal: boolean;
}
