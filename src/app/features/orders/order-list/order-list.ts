import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../core/services/other';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';
import { OrderResponse, OrderStatus } from '../../../core/models';
import { OrdersByStatusPipe } from '../../../shared/pipes/orders-by-status-pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, OrdersByStatusPipe, LoadingSpinnerComponent],
  templateUrl: './order-list.html',
  styleUrls: ['./order-list.css']
})
export class OrderListComponent implements OnInit {
  orders: OrderResponse[] = [];
  loading = true;
  filterStatus: OrderStatus | 'ALL' = 'ALL';
  allStatuses: (OrderStatus | 'ALL')[] = ['ALL','PENDING','PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];
  adminStatuses: OrderStatus[] = ['PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];

  currentPage = 1;
  pageSize = 5;

  constructor(
    private orderService: OrderService,
    public authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const obs = this.authService.isAdmin()
      ? this.orderService.toutesLesCommandes()
      : this.orderService.mesCommandes();
    obs.subscribe({ next: o => { this.orders = o; this.loading = false; }, error: () => this.loading = false });
  }

  updateStatus(orderId: number, status: OrderStatus): void {
    this.orderService.mettreAJourStatut(orderId, status).subscribe({
      next: updated => { const idx = this.orders.findIndex(o => o.id === orderId); if (idx !== -1) this.orders[idx] = updated; this.toastService.success('Statut mis à jour.'); },
      error: () => this.toastService.error('Erreur.')
    });
  }

  cancelOrder(orderId: number): void {
    this.orderService.annulerCommande(orderId).subscribe({
      next: updated => { const idx = this.orders.findIndex(o => o.id === orderId); if (idx !== -1) this.orders[idx] = updated; this.toastService.success('Commande annulée.'); },
      error: () => this.toastService.error('Impossible d\'annuler.')
    });
  }

  get filtered(): OrderResponse[] {
    return this.filterStatus === 'ALL' ? this.orders : this.orders.filter(o => o.statut === this.filterStatus);
  }

  get paginatedOrders(): OrderResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  selectStatus(status: OrderStatus | 'ALL'): void {
    this.filterStatus = status;
    this.currentPage = 1;
  }

  get shownCount(): number {
    return Math.min(this.currentPage * this.pageSize, this.filtered.length);
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
