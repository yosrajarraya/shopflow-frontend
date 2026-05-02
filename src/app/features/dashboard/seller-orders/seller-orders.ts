import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/other';
import { ToastService } from '../../../core/services/toast';
import { OrderResponse } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-seller-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './seller-orders.html',
  styleUrls: ['./seller-orders.css']
})
export class SellerOrdersComponent implements OnInit {
  orders: OrderResponse[] = [];
  filteredOrders: OrderResponse[] = [];
  loading = true;
  processingOrderId: number | null = null;

  // Filtres
  selectedStatus: string = '';
  searchTerm: string = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;

  constructor(
    private orderService: OrderService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.mesCommandesVendeur().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.error('Erreur lors du chargement des commandes.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchStatus = !this.selectedStatus || order.statut === this.selectedStatus;
      const matchSearch = !this.searchTerm ||
        order.numeroCommande.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.customerNom.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  get paginatedOrders(): OrderResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredOrders.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cdr.detectChanges();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cdr.detectChanges();
    }
  }

  decisionVendeur(orderId: number, action: 'ACCEPT' | 'REFUSE'): void {
    if (!confirm(`Confirmer ${action === 'ACCEPT' ? 'l\'acceptation' : 'le refus'} de la commande ?`)) return;
    this.processingOrderId = orderId;
    this.orderService.decisionVendeur(orderId, action).subscribe({
      next: (updated) => {
        const idx = this.orders.findIndex(o => o.id === updated.id);
        if (idx !== -1) this.orders[idx] = updated;
        this.applyFilters();
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

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'En attente',
      'PAID': 'Payée',
      'PROCESSING': 'En traitement',
      'SHIPPED': 'Expédiée',
      'DELIVERED': 'Livrée',
      'CANCELLED': 'Annulée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'PENDING': 'badge-warning',
      'PAID': 'badge-info',
      'PROCESSING': 'badge-info',
      'SHIPPED': 'badge-accent',
      'DELIVERED': 'badge-success',
      'CANCELLED': 'badge-danger'
    };
    return classes[status] || 'badge-info';
  }
}
