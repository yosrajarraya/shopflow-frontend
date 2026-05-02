import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, OrderService, ReviewService } from '../../../core/services/other';
import { ProductService } from '../../../core/services/product';
import { ToastService } from '../../../core/services/toast';
import { DashboardSeller, OrderResponse, ReviewResponse } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating';
import { ChartComponent } from '../../../shared/components/chart/chart';
import { timeout } from 'rxjs/operators';
import type { ChartDataset, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, StarRatingComponent, ChartComponent],
  templateUrl: './seller-dashboard.html',
  styleUrls: ['./seller-dashboard.css']
})
export class SellerDashboardComponent implements OnInit {
  stats: DashboardSeller | null = null;
  loading = true;
  processingOrderId: number | null = null;
  readonly maxCommandesDashboard = 3;
  readonly maxReviewsDashboard = 5;
  allOrders: OrderResponse[] = [];
  recentReviews: ReviewResponse[] = [];
  // Mes produits
  myProducts: any[] = [];
  // Chart data for seller products (top sales)
  sellerChartLabels: string[] = [];
  sellerChartDatasets: ChartDataset<'bar'>[] = [{ data: [], label: 'Ventes' }];

  // Chart data for commandes par statut
  commandeStatusLabels: string[] = [];
  commandeStatusDatasets: ChartDataset<'doughnut'>[] = [];

  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 8,
        right: 8,
        bottom: 4,
        left: 8
      }
    },
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { ticks: { color: '#475569', font: { weight: 600 } }, grid: { color: 'rgba(148,163,184,0.16)' } },
      y: { ticks: { color: '#475569', font: { weight: 600 } }, grid: { color: 'rgba(148,163,184,0.16)' } }
    }
  };

  pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    layout: {
      padding: {
        top: 8,
        right: 8,
        bottom: 8,
        left: 8
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#334155',
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
          pointStyle: 'circle'
        }
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
    this.dashboardService.dashboardSeller().pipe(
      timeout(15000)
    ).subscribe({
      next: (data) => {
        this.stats = data;
        this.loadData();
      },
      error: (err) => {
        console.error('Dashboard error:', err);
        this.toastService.error('Impossible de charger le dashboard vendeur.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadData(): void {
    let completed = 0;
    const total = 2;

    // Charger toutes les commandes du vendeur
    this.orderService.mesCommandesVendeur().subscribe({
      next: (orders) => {
        this.allOrders = orders;
        this.prepareCommandeChart();
        completed++;
        if (completed === total) {
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        completed++;
        if (completed === total) {
          this.loading = false;
          this.cdr.detectChanges();
        }
      }
    });

    // Charger les produits du vendeur
    this.productService.mesProduits(0, 12).subscribe({
      next: (page) => {
        this.myProducts = page.content || [];
        // prepare chart data for seller
        this.sellerChartLabels = this.myProducts.map(p => p.nom.substring(0, 12));
        this.sellerChartDatasets = [{
          data: this.myProducts.map(p => p.nombreVentes || 0),
          label: 'Ventes',
          backgroundColor: ['#2563eb', '#14b8a6', '#f59e0b', '#8b5cf6', '#ec4899', '#22c55e'],
          hoverBackgroundColor: ['#1d4ed8', '#0f766e', '#d97706', '#7c3aed', '#db2777', '#16a34a'],
          borderColor: '#ffffff',
          borderWidth: 2,
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 28
        }];
        completed++;
        if (completed === total) {
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        completed++;
        if (completed === total) {
          this.loading = false;
          this.cdr.detectChanges();
        }
      }
    });

    // Charger les avis pour les produits du vendeur
    this.reviewService.listerAvisVendeur().subscribe({
      next: (reviews) => {
        // Filtrer les avis récents (approuvés)
        this.recentReviews = reviews
          .filter(r => r.approuve)
          .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
          .slice(0, this.maxReviewsDashboard);
        completed++;
        if (completed === total) {
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        completed++;
        if (completed === total) {
          this.loading = false;
          this.cdr.detectChanges();
        }
      }
    });
  }

  prepareCommandeChart(): void {
    const statusMap = new Map<string, number>();
    const statusColors: Record<string, string> = {
      'PENDING': '#f59e0b',
      'PAID': '#2563eb',
      'PROCESSING': '#14b8a6',
      'SHIPPED': '#8b5cf6',
      'DELIVERED': '#22c55e',
      'CANCELLED': '#ef4444'
    };
    const statusLabels: Record<string, string> = {
      'PENDING': 'En attente',
      'PAID': 'Payees',
      'PROCESSING': 'En traitement',
      'SHIPPED': 'Expediees',
      'DELIVERED': 'Livrees',
      'CANCELLED': 'Annulees'
    };

    this.allOrders.forEach((cmd: OrderResponse) => {
      const label = statusLabels[cmd.statut] || cmd.statut;
      statusMap.set(label, (statusMap.get(label) || 0) + 1);
    });

    this.commandeStatusLabels = Array.from(statusMap.keys());
    const colors = this.commandeStatusLabels.map(label => {
      const key = Object.keys(statusLabels).find(k => statusLabels[k] === label) || 'PENDING';
      return statusColors[key];
    });

    this.commandeStatusDatasets = [{
      data: Array.from(statusMap.values()),
      backgroundColor: colors,
      borderColor: '#ffffff',
      borderWidth: 2,
      hoverOffset: 8
    }];
  }

  get commandesAffichees(): OrderResponse[] {
    return this.allOrders.slice(0, this.maxCommandesDashboard);
  }

  get hasMoreOrders(): boolean {
    return this.allOrders.length > this.maxCommandesDashboard;
  }

  get hasReviews(): boolean {
    return this.recentReviews.length > 0;
  }

  supprimerProduit(id: number): void {
    if (!confirm('Cette action supprimera définitivement ce produit. Continuer ?')) return;
    this.productService.supprimerProduit(id).subscribe({
      next: () => {
        if (!this.stats) return;
        this.stats.alertesStock = this.stats.alertesStock.filter(p => p.id !== id);
        // Also remove from the local myProducts snapshot if present
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
        // Mettre à jour la commande dans les commandes récentes si présente
        if (this.stats?.commandesRecentes) {
          const idx = this.stats.commandesRecentes.findIndex(o => o.id === updated.id);
          if (idx !== -1) this.stats.commandesRecentes[idx] = updated;
        }
        this.toastService.success(`Commande ${action === 'ACCEPT' ? 'acceptée' : 'refusée'}.`);
        this.processingOrderId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || 'Erreur lors du traitement de la commande.');
        this.processingOrderId = null;
        this.cdr.detectChanges();
      }
    });
  }
}
