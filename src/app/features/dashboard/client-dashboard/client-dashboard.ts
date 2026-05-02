import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../core/services/other';
import { AuthService } from '../../../core/services/auth';
import { OrderResponse, OrderStatus } from '../../../core/models';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-dashboard.html',
  styleUrls: ['./client-dashboard.css']
})
export class ClientDashboardComponent implements OnInit {

  orders: OrderResponse[] = [];
  loading = true;

  // KPIs calculés
  totalCommandes = 0;
  totalDepense = 0;
  commandesEnCours = 0;
  commandesLivrees = 0;
  commandesAnnulees = 0;

  // Commandes récentes (5 dernières)
  commandesRecentes: OrderResponse[] = [];

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
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  private computeStats(): void {
    this.totalCommandes  = this.orders.length;
    this.totalDepense    = this.orders
      .filter(o => o.statut !== 'CANCELLED')
      .reduce((s, o) => s + (o.totalTTC || 0), 0);
    this.commandesEnCours  = this.orders.filter(o => ['PENDING','PAID','PROCESSING','SHIPPED'].includes(o.statut)).length;
    this.commandesLivrees  = this.orders.filter(o => o.statut === 'DELIVERED').length;
    this.commandesAnnulees = this.orders.filter(o => o.statut === 'CANCELLED').length;
    this.commandesRecentes = [...this.orders]
      .sort((a, b) => new Date(b.dateCommande).getTime() - new Date(a.dateCommande).getTime())
      .slice(0, 5);
  }

  statusLabel(s: OrderStatus): string {
    const m: Record<OrderStatus, string> = {
      PENDING: 'En attente', PAID: 'Payée', PROCESSING: 'En traitement',
      SHIPPED: 'Expédiée', DELIVERED: 'Livrée', CANCELLED: 'Annulée'
    };
    return m[s] || s;
  }

  statusClass(s: OrderStatus): string {
    const m: Record<OrderStatus, string> = {
      PENDING: 'badge-warning', PAID: 'badge-info', PROCESSING: 'badge-info',
      SHIPPED: 'badge-accent', DELIVERED: 'badge-success', CANCELLED: 'badge-danger'
    };
    return m[s] || 'badge-muted';
  }

  get userName(): string {
    const u = this.authService.currentUser;
    return u ? `${u.nom}` : 'Client';
  }
}
