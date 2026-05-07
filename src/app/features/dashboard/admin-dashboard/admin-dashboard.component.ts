import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DashboardService } from 'src/services/dashboard.service';
import { OrderService } from 'src/services/order.service';
import { ToastService } from 'src/services/toast.service';
import { OrderStatus } from 'src/Models/order.model';
import { timeout } from 'rxjs/operators';
import type { ChartDataset, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: false
})
export class AdminDashboardComponent implements OnInit {
  stats: any = null;
  loading = true;
  adminStatuses: OrderStatus[] = ['PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];

  ventesLabels: string[] = [];
  ventesDatasets: ChartDataset[] = [{ data: [] as number[], label: 'Ventes' }];
  commStatusLabels: string[] = [];
  commStatusDatasets: ChartDataset[] = [];
  topProduitsLabels: string[] = [];
  topProduitsDatasets: ChartDataset[] = [];
  salesVsStockLabels: string[] = [];
  salesVsStockDatasets: ChartDataset[] = [];

  chartOptions: ChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: '#475569', usePointStyle: true, pointStyle: 'circle' } },
      tooltip: { backgroundColor: '#0f172a', titleColor: '#fff', bodyColor: '#e2e8f0', borderColor: '#2563eb', borderWidth: 1 }
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(226,232,240,0.8)' } },
      y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(226,232,240,0.8)' } }
    }
  };

  pieChartOptions: ChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' as const, labels: { color: '#475569', usePointStyle: true, pointStyle: 'circle' } },
      tooltip: { backgroundColor: '#0f172a', titleColor: '#fff', bodyColor: '#e2e8f0' }
    }
  };

  comboChartOptions: ChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: '#475569', usePointStyle: true, pointStyle: 'circle' } },
      tooltip: { backgroundColor: '#0f172a', titleColor: '#fff', bodyColor: '#e2e8f0', borderColor: '#2563eb', borderWidth: 1 }
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(226,232,240,0.8)' } },
      y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(226,232,240,0.8)' }, title: { display: true, text: 'Ventes' } as any },
      y1: { position: 'right' as const, ticks: { color: '#64748b' }, grid: { display: false }, title: { display: true, text: 'Stock' } as any }
    }
  } as any;

  constructor(
    private dashboardService: DashboardService,
    private orderService: OrderService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dashboardService.dashboardAdmin().pipe(timeout(15000)).subscribe({
      next: s => { this.stats = s; this.prepareCharts(); this.loadSalesVsStock(); this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  loadSalesVsStock(): void {
    this.dashboardService.getProductSalesVsStock(10).subscribe({
      next: data => {
        if (data?.length) {
          this.salesVsStockLabels = data.map((p: any) => p.nom);
          const salesData = data.map((p: any) => p.nombreVentes);
          const stockData = data.map((p: any) => p.stock);
          this.salesVsStockDatasets = [
            { data: salesData, label: 'Ventes', type: 'bar', backgroundColor: 'rgba(37,99,235,0.7)', borderColor: '#2563eb', borderWidth: 1, yAxisID: 'y' },
            { data: stockData, label: 'Stock', type: 'line', borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 2, pointBackgroundColor: '#f59e0b', pointBorderColor: '#ffffff', pointBorderWidth: 2, pointRadius: 4, tension: 0.3, fill: true, yAxisID: 'y1' }
          ] as any;
          this.cdr.detectChanges();
        }
      }
    });
  }

  prepareCharts(): void {
    // Chart 1: Ventes par mois (Line Chart) - Même principe que chartData dans l'exemple
    if (this.stats?.ventesParMois?.length) {
      // Extraire les labels (mois)
      this.ventesLabels = this.stats.ventesParMois.map((it: any) => it.mois);

      // Extraire les données (montants) - même logique que members.map(e => e.tab_Events.length)
      const montants = this.stats.ventesParMois.map((it: any) => it.montant);

      this.ventesDatasets = [{
        data: montants,
        label: 'Ventes (TND)',
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.12)',
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.35,
        fill: true
      }];
    }

    // Chart 2: Commandes par statut (Pie Chart) - Même principe que chartDataPie dans l'exemple
    const statusColors: Record<string, string> = {
      PAID:'#10b981',
      PROCESSING:'#f59e0b',
      SHIPPED:'#3b82f6',
      DELIVERED:'#8b5cf6',
      CANCELLED:'#ef4444',
      PENDING:'#6b7280'
    };
    const statusLabels: Record<string, string> = {
      PAID:'Payées',
      PROCESSING:'En traitement',
      SHIPPED:'Expédiées',
      DELIVERED:'Livrées',
      CANCELLED:'Annulées',
      PENDING:'En attente'
    };

    if (this.stats?.commandesRecentes?.length) {
      // Compter les commandes par statut - même logique que le comptage des teachers/students
      const statusMap = new Map<string, number>();
      this.stats.commandesRecentes.forEach((cmd: any) => {
        const label = statusLabels[cmd.statut] || cmd.statut;
        statusMap.set(label, (statusMap.get(label) || 0) + 1);
      });

      // Préparer les labels et données
      this.commStatusLabels = Array.from(statusMap.keys());
      const counts = Array.from(statusMap.values());

      // Mapper les couleurs
      const colors = this.commStatusLabels.map(label => {
        const key = Object.keys(statusLabels).find(k => statusLabels[k] === label) || 'PENDING';
        return statusColors[key];
      });

      this.commStatusDatasets = [{
        data: counts,
        backgroundColor: colors,
        borderColor: '#1f2937',
        borderWidth: 2
      }];
    }

    // Chart 3: Top produits (Bar Chart) - Même principe que chartDataPie2 dans l'exemple
    if (this.stats?.topProduits?.length) {
      // Extraire les noms de produits (limité à 5)
      this.topProduitsLabels = this.stats.topProduits
        .slice(0, 5)
        .map((p: any) => p.nom.substring(0, 15));

      // Extraire le nombre de ventes - même logique que titre.map(t => Events.filter(e => e.Title == t).length)
      const ventesData = this.stats.topProduits
        .slice(0, 5)
        .map((p: any) => p.nombreVentes);

      this.topProduitsDatasets = [{
        data: ventesData,
        label: 'Ventes',
        backgroundColor: ['#2563eb','#60a5fa','#0284c7','#475569','#94a3b8'],
        borderColor: '#1d4ed8',
        borderWidth: 1
      }];
    }
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
