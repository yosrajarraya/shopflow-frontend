import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DashboardService } from 'src/services/dashboard.service';
import { OrderService } from 'src/services/order.service';
import { ReviewService } from 'src/services/review.service';
import { ProductService } from 'src/services/product.service';
import { ToastService } from 'src/services/toast.service';
import { DashboardSeller } from 'src/Models/dashboard.model';
import { OrderResponse } from 'src/Models/order.model';
import { ReviewResponse } from 'src/Models/review.model';
import { timeout } from 'rxjs/operators';
import type { ChartDataset, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-seller-dashboard',
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.css'],
  standalone: false
})
export class SellerDashboardComponent implements OnInit {
  stats: DashboardSeller | null = null;
  loading = true;
  processingOrderId: number | null = null;
  readonly maxCommandesDashboard = 3;
  readonly maxReviewsDashboard = 2;
  currentOrderPage = 1;
  readonly ordersPerPage = 3;
  showAllReviews = false;
  allOrders: OrderResponse[] = [];
  recentReviews: ReviewResponse[] = [];
  myProducts: any[] = [];

  sellerChartLabels: string[] = [];
  sellerChartDatasets: ChartDataset<'bar'>[] = [{ data: [], label: 'Ventes' }];
  commandeStatusLabels: string[] = [];
  commandeStatusDatasets: ChartDataset<'doughnut'>[] = [];

  chartOptions: ChartOptions<'bar'> = {
    responsive: true, maintainAspectRatio: false,
    layout: { padding: { top: 8, right: 8, bottom: 4, left: 8 } },
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#475569', font: { weight: 'bold' } }, grid: { color: 'rgba(148,163,184,0.16)' } },
      y: { ticks: { color: '#475569', font: { weight: 'bold' } }, grid: { color: 'rgba(148,163,184,0.16)' } }
    }
  };

  pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true, maintainAspectRatio: false, cutout: '68%',
    layout: { padding: { top: 8, right: 8, bottom: 8, left: 8 } },
    plugins: {
      legend: {
        display: true, position: 'bottom',
        labels: { color: '#334155', boxWidth: 12, boxHeight: 12, usePointStyle: true, pointStyle: 'circle' }
      }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private productService: ProductService,
    private toastService: ToastService,
    private orderService: OrderService,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dashboardService.dashboardSeller().pipe(timeout(15000)).subscribe({
      next: (data) => { this.stats = data; this.loadData(); },
      error: () => { this.toastService.error('Impossible de charger le dashboard vendeur.'); this.loading = false; this.cdr.detectChanges(); }
    });
  }

  loadData(): void {
    let completed = 0;
    const total = 2;
    const done = () => {
      completed++;
      if (completed >= total) {
        this.loading = false;
        this.cdr.detectChanges();
      }
    };

    // Charger les commandes et préparer le chart - Même principe que l'exemple
    this.orderService.mesCommandesVendeur().subscribe({
      next: (orders) => {
        this.allOrders = orders;
        this.prepareCommandeChart();
        done();
      },
      error: () => done()
    });

    // Charger les produits et préparer le chart - Même principe que members.map()
    this.productService.mesProduits(0, 12).subscribe({
      next: (page) => {
        this.myProducts = page.content || [];

        // Extraire les noms de produits - même logique que members.map(e => e.name)
        this.sellerChartLabels = this.myProducts.map(p => p.nom.substring(0, 12));

        // Extraire le nombre de ventes - même logique que members.map(e => e.tab_Events.length)
        const ventesData = this.myProducts.map(p => p.nombreVentes || 0);

        this.sellerChartDatasets = [{
          data: ventesData,
          label: 'Ventes',
          backgroundColor: ['#2563eb','#14b8a6','#f59e0b','#8b5cf6','#ec4899','#22c55e'],
          hoverBackgroundColor: ['#1d4ed8','#0f766e','#d97706','#7c3aed','#db2777','#16a34a'],
          borderColor: '#ffffff',
          borderWidth: 2,
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 28
        }];
        done();
      },
      error: () => done()
    });

    // Charger les avis
    this.reviewService.listerAvisVendeur().subscribe({
      next: (reviews) => {
        this.recentReviews = reviews
          .filter(r => r.approuve)
          .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
          .slice();
      }
    });
  }

  prepareCommandeChart(): void {
    // Définir les couleurs et labels des statuts
    const statusColors: Record<string, string> = {
      PENDING:'#f59e0b',
      PAID:'#2563eb',
      PROCESSING:'#14b8a6',
      SHIPPED:'#8b5cf6',
      DELIVERED:'#22c55e',
      CANCELLED:'#ef4444'
    };
    const statusLabels: Record<string, string> = {
      PENDING:'En attente',
      PAID:'Payées',
      PROCESSING:'En traitement',
      SHIPPED:'Expédiées',
      DELIVERED:'Livrées',
      CANCELLED:'Annulées'
    };

    // Compter les commandes par statut - Même principe que le comptage dans l'exemple
    const statusMap = new Map<string, number>();
    this.allOrders.forEach((cmd: OrderResponse) => {
      const label = statusLabels[cmd.statut] || cmd.statut;
      statusMap.set(label, (statusMap.get(label) || 0) + 1);
    });

    // Préparer les labels
    this.commandeStatusLabels = Array.from(statusMap.keys());

    // Préparer les données
    const counts = Array.from(statusMap.values());

    // Mapper les couleurs - même logique que l'exemple avec locationCounts
    const colors = this.commandeStatusLabels.map(label => {
      const key = Object.keys(statusLabels).find(k => statusLabels[k] === label) || 'PENDING';
      return statusColors[key];
    });

    this.commandeStatusDatasets = [{
      data: counts,
      backgroundColor: colors,
      borderColor: '#ffffff',
      borderWidth: 2,
      hoverOffset: 8
    }];
  }

  commandesAffichees(): OrderResponse[] {
    const startIdx = (this.currentOrderPage - 1) * this.ordersPerPage;
    const endIdx = startIdx + this.ordersPerPage;
    return this.allOrders.slice(startIdx, endIdx);
  }

  totalOrderPages(): number {
    return Math.ceil(this.allOrders.length / this.ordersPerPage);
  }

  hasOrderPagination(): boolean {
    return this.totalOrderPages() > 1;
  }

  reviewsAffichees(): ReviewResponse[] {
    return this.showAllReviews ? this.recentReviews : this.recentReviews.slice(0, this.maxReviewsDashboard);
  }

  hasMoreReviews(): boolean { return this.recentReviews.length > this.maxReviewsDashboard; }
  hasReviews(): boolean { return this.recentReviews.length > 0; }

  goToOrderPage(page: number): void {
    if (page >= 1 && page <= this.totalOrderPages()) {
      this.currentOrderPage = page;
    }
  }

  nextOrderPage(): void {
    if (this.currentOrderPage < this.totalOrderPages()) {
      this.currentOrderPage++;
    }
  }

  prevOrderPage(): void {
    if (this.currentOrderPage > 1) {
      this.currentOrderPage--;
    }
  }

  toggleReviewsView(): void {
    this.showAllReviews = !this.showAllReviews;
  }

  supprimerProduit(id: number): void {
    if (!confirm('Cette action supprimera définitivement ce produit. Continuer ?')) return;
    this.productService.supprimerProduit(id).subscribe({
      next: () => {
        this.myProducts = this.myProducts.filter(p => p.id !== id);
        this.toastService.success('Produit supprimé définitivement.');
      },
      error: () => this.toastService.error('Erreur lors de la suppression du produit.')
    });
  }

  decisionVendeur(orderId: number, action: 'ACCEPT' | 'REFUSE'): void {
    if (!confirm(`Confirmer ${action === 'ACCEPT' ? 'l\'acceptation' : 'le refus'} de la commande ?`)) return;
    this.processingOrderId = orderId;
    this.orderService.decisionVendeur(orderId, action).subscribe({
      next: (updated) => {
        if (this.stats?.commandesRecentes) {
          const idx = this.stats.commandesRecentes.findIndex(o => o.id === updated.id);
          if (idx !== -1) this.stats.commandesRecentes[idx] = updated;
        }
        this.toastService.success(`Commande ${action === 'ACCEPT' ? 'acceptée' : 'refusée'}.`);
        this.processingOrderId = null; this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || 'Erreur.');
        this.processingOrderId = null; this.cdr.detectChanges();
      }
    });
  }
}
