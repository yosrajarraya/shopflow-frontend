import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { OrderService } from 'src/services/order.service';
import { AuthService } from 'src/services/auth.service';
import { OrderResponse, OrderStatus } from 'src/Models/order.model';
import type { ChartDataset, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css'],
  standalone: false
})
export class ClientDashboardComponent implements OnInit {
  orders: OrderResponse[] = [];
  loading = true;
  totalCommandes = 0;
  totalDepense = 0;
  commandesEnCours = 0;
  commandesLivrees = 0;
  commandesAnnulees = 0;
  commandesRecentes: OrderResponse[] = [];

  // Charts - Même principe que l'exemple
  statusChartLabels: string[] = [];
  statusChartDatasets: ChartDataset[] = [];
  depensesChartLabels: string[] = [];
  depensesChartDatasets: ChartDataset[] = [];

  pieChartOptions: ChartOptions = {
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
      }
    }
  };

  barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(226,232,240,0.8)' } },
      y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(226,232,240,0.8)' } }
    }
  };

  constructor(
    private orderService: OrderService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.orderService.mesCommandes().subscribe({
      next: (commandes) => {
        this.orders = Array.isArray(commandes) ? commandes : [];
        this.computeStats();
        this.prepareCharts();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  private computeStats(): void {
    this.totalCommandes  = this.orders.length;
    this.totalDepense    = this.orders.filter(o => o.statut !== 'CANCELLED').reduce((s, o) => s + (o.totalTTC || 0), 0);
    this.commandesEnCours  = this.orders.filter(o => ['PENDING','PAID','PROCESSING','SHIPPED'].includes(o.statut)).length;
    this.commandesLivrees  = this.orders.filter(o => o.statut === 'DELIVERED').length;
    this.commandesAnnulees = this.orders.filter(o => o.statut === 'CANCELLED').length;
    this.commandesRecentes = [...this.orders].sort((a, b) => new Date(b.dateCommande).getTime() - new Date(a.dateCommande).getTime()).slice(0, 5);
  }

  private prepareCharts(): void {
    // Chart 1: Répartition des commandes par statut (Pie Chart) - Même principe que chartDataPie
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

    // Compter les commandes par statut - même logique que le comptage teachers/students
    const statusMap = new Map<string, number>();
    this.orders.forEach((cmd: OrderResponse) => {
      const label = statusLabels[cmd.statut] || cmd.statut;
      statusMap.set(label, (statusMap.get(label) || 0) + 1);
    });

    this.statusChartLabels = Array.from(statusMap.keys());
    const counts = Array.from(statusMap.values());

    const colors = this.statusChartLabels.map(label => {
      const key = Object.keys(statusLabels).find(k => statusLabels[k] === label) || 'PENDING';
      return statusColors[key];
    });

    this.statusChartDatasets = [{
      data: counts,
      backgroundColor: colors,
      borderColor: '#ffffff',
      borderWidth: 2
    }];

    // Chart 2: Dépenses par mois (Bar Chart) - Même principe que chartData
    const depensesParMois = new Map<string, number>();
    this.orders
      .filter(o => o.statut !== 'CANCELLED')
      .forEach(cmd => {
        const date = new Date(cmd.dateCommande);
        const mois = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        depensesParMois.set(mois, (depensesParMois.get(mois) || 0) + (cmd.totalTTC || 0));
      });

    // Trier par date
    const sortedEntries = Array.from(depensesParMois.entries())
      .sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-6); // Garder les 6 derniers mois

    this.depensesChartLabels = sortedEntries.map(e => e[0]);
    const depensesData = sortedEntries.map(e => e[1]);

    this.depensesChartDatasets = [{
      data: depensesData,
      label: 'Dépenses (TND)',
      backgroundColor: 'rgba(37,99,235,0.7)',
      borderColor: '#2563eb',
      borderWidth: 1
    }];
  }

  statusLabel(s: OrderStatus): string {
    const m: Record<OrderStatus, string> = { PENDING:'En attente', PAID:'Payée', PROCESSING:'En traitement', SHIPPED:'Expédiée', DELIVERED:'Livrée', CANCELLED:'Annulée' };
    return m[s] || s;
  }

  statusClass(s: OrderStatus): string {
    const m: Record<OrderStatus, string> = { PENDING:'badge-warning', PAID:'badge-info', PROCESSING:'badge-info', SHIPPED:'badge-accent', DELIVERED:'badge-success', CANCELLED:'badge-danger' };
    return m[s] || 'badge-muted';
  }

  userName(): string {
    const u = this.authService.currentUser;
    return u ? `${u.nom}` : 'Client';
  }
}
