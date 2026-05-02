import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, OrderService } from '../../../core/services/other';
import { ToastService } from '../../../core/services/toast';
import { OrderStatus } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { ChartComponent } from '../../../shared/components/chart/chart';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, ChartComponent],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  stats: any = null;
  loading = true;
  adminStatuses: OrderStatus[] = ['PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];

  // Charts data
  ventesLabels: string[] = [];
  ventesDatasets: import('chart.js').ChartDataset[] = [{ data: [] as number[], label: 'Ventes' }];

  commStatusLabels: string[] = [];
  commStatusDatasets: import('chart.js').ChartDataset[] = [];

  topProduitsLabels: string[] = [];
  topProduitsDatasets: import('chart.js').ChartDataset[] = [];

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#475569',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        borderColor: '#2563eb',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: { color: '#64748b' },
        grid: { color: 'rgba(226,232,240,0.8)' }
      },
      y: {
        ticks: { color: '#64748b' },
        grid: { color: 'rgba(226,232,240,0.8)' }
      }
    }
  };

  pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          color: '#475569',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#fff',
        bodyColor: '#e2e8f0'
      }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private orderService: OrderService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dashboardService.dashboardAdmin().pipe(
      timeout(15000)
    ).subscribe({
      next: s => {
        this.stats = s;
        this.prepareCharts();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Admin dashboard error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  prepareCharts(): void {
    // Chart 1: Ventes par mois (line chart)
    if (this.stats?.ventesParMois?.length) {
      this.ventesLabels = this.stats.ventesParMois.map((it: any) => it.mois);
      this.ventesDatasets = [{
        data: this.stats.ventesParMois.map((it: any) => it.montant),
        label: 'Ventes (TND)',
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.35,
        fill: true
      }];
    }

    // Chart 2: Commandes par statut (pie chart)
    const statusMap = new Map<string, number>();
    const statusColors: Record<string, string> = {
      'PAID': '#10b981',
      'PROCESSING': '#f59e0b',
      'SHIPPED': '#3b82f6',
      'DELIVERED': '#8b5cf6',
      'CANCELLED': '#ef4444',
      'PENDING': '#6b7280'
    };
    const statusLabels: Record<string, string> = {
      'PAID': 'Payees',
      'PROCESSING': 'En traitement',
      'SHIPPED': 'Expediees',
      'DELIVERED': 'Livrees',
      'CANCELLED': 'Annulees',
      'PENDING': 'En attente'
    };

    if (this.stats?.commandesRecentes?.length) {
      this.stats.commandesRecentes.forEach((cmd: any) => {
        const label = statusLabels[cmd.statut] || cmd.statut;
        statusMap.set(label, (statusMap.get(label) || 0) + 1);
      });

      this.commStatusLabels = Array.from(statusMap.keys());
      const colors = this.commStatusLabels.map(label => {
        const key = Object.keys(statusLabels).find(k => statusLabels[k] === label) || 'PENDING';
        return statusColors[key];
      });

      this.commStatusDatasets = [{
        data: Array.from(statusMap.values()),
        backgroundColor: colors,
        borderColor: '#1f2937',
        borderWidth: 2
      }];
    }

    // Chart 3: Top produits (bar chart)
    if (this.stats?.topProduits?.length) {
      this.topProduitsLabels = this.stats.topProduits.slice(0, 5).map((p: any) => p.nom.substring(0, 15));
      this.topProduitsDatasets = [{
        data: this.stats.topProduits.slice(0, 5).map((p: any) => p.nombreVentes),
        label: 'Ventes',
        backgroundColor: ['#2563eb', '#60a5fa', '#0284c7', '#475569', '#94a3b8'],
        borderColor: '#1d4ed8',
        borderWidth: 1
      }];
    }
  }

  updateStatus(orderId: number, status: OrderStatus): void {
    this.orderService.mettreAJourStatut(orderId, status).subscribe({
      next: updated => {
        const idx = this.stats.commandesRecentes.findIndex((o: any) => o.id === orderId);
        if (idx !== -1) this.stats.commandesRecentes[idx] = updated;
        this.toastService.success('Statut mis à jour.');
      },
      error: () => this.toastService.error('Erreur.')
    });
  }

  statusLabel(s: OrderStatus): string {
    const map: Record<OrderStatus, string> = { PENDING:'En attente', PAID:'Payée', PROCESSING:'En traitement', SHIPPED:'Expédiée', DELIVERED:'Livrée', CANCELLED:'Annulée' };
    return map[s] || s;
  }

  statusClass(s: OrderStatus): string {
    const map: Record<OrderStatus, string> = { PENDING:'badge-warning', PAID:'badge-info', PROCESSING:'badge-info', SHIPPED:'badge-accent', DELIVERED:'badge-success', CANCELLED:'badge-danger' };
    return map[s] || 'badge-muted';
  }
}
