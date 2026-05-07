import { Component, OnInit } from '@angular/core';
import { OrderService } from 'src/services/order.service';
import { AuthService } from 'src/services/auth.service';
import { ToastService } from 'src/services/toast.service';
import { OrderResponse, OrderStatus } from 'src/Models/order.model';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css'],
  standalone: false
})
export class OrderListComponent implements OnInit {
  orders: OrderResponse[] = [];
  loading = true;
  filterStatus: OrderStatus | 'ALL' = 'ALL';
  allStatuses: (OrderStatus | 'ALL')[] = ['ALL','PENDING','PROCESSING','CANCELLED'];
  adminStatuses: OrderStatus[] = ['PROCESSING','CANCELLED'];
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

  get totalPages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  nextPage(): void { if (this.currentPage < this.totalPages) this.currentPage++; }
  prevPage(): void { if (this.currentPage > 1) this.currentPage--; }
  selectStatus(status: OrderStatus | 'ALL'): void { this.filterStatus = status; this.currentPage = 1; }
  get shownCount(): number { return Math.min(this.currentPage * this.pageSize, this.filtered.length); }

  statusLabel(s: OrderStatus): string {
    const map: Partial<Record<OrderStatus, string>> = { PENDING:'En attente', PROCESSING:'En traitement', CANCELLED:'Annulée' };
    return map[s] || s;
  }

  statusClass(s: OrderStatus): string {
    const map: Partial<Record<OrderStatus, string>> = { PENDING:'badge-warning', PROCESSING:'badge-info', CANCELLED:'badge-danger' };
    return map[s] || 'badge-muted';
  }
}
