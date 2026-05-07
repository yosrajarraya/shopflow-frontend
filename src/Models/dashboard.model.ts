import { OrderResponse } from 'src/Models/order.model';
import { ProductResponse } from 'src/Models/product.model';

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
  commandesRecentes: OrderResponse[];
  revenuMois: number;
}
