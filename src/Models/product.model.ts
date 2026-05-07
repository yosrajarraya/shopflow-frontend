import { CategoryResponse } from 'src/Models/category.model';
import { ReviewResponse } from 'src/Models/review.model';
import { VariantResponse } from 'src/Models/variant.model';

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
