import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProductService } from 'src/services/product.service';
import { ToastService } from 'src/services/toast.service';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-seller-products',
  templateUrl: './seller-products.component.html',
  styleUrls: ['./seller-products.component.css'],
  standalone: false
})
export class SellerProductsComponent implements OnInit {
  products: any[] = [];
  page: any = null;
  loading = true;
  deletingId: number | null = null;
  currentPage = 0;
  pageSize = 8;

  constructor(
    private productService: ProductService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.loadProducts(); }

  loadProducts(): void {
    this.loading = true;
    this.productService.mesProduits(this.currentPage, this.pageSize).pipe(timeout(15000)).subscribe({
      next: (page) => { this.page = page; this.products = page.content || []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.toastService.error('Impossible de charger vos produits.'); this.loading = false; this.cdr.detectChanges(); }
    });
  }

  supprimerProduit(id: number): void {
    if (!confirm('Cette action supprimera définitivement ce produit. Continuer ?')) return;
    this.deletingId = id;
    this.productService.supprimerProduit(id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== id);
        if (this.page?.content) { this.page.content = this.page.content.filter((p: any) => p.id !== id); this.page.totalElements = Math.max(0, (this.page.totalElements || 1) - 1); }
        this.toastService.success('Produit supprimé définitivement.');
        if (this.products.length === 0 && this.page && this.currentPage > 0) { this.currentPage--; this.loadProducts(); }
        else { this.deletingId = null; this.cdr.detectChanges(); }
      },
      error: () => { this.toastService.error('Erreur lors de la suppression du produit.'); this.deletingId = null; this.cdr.detectChanges(); }
    });
  }

  goToPage(pageIndex: number): void {
    if (pageIndex < 0 || (this.page && pageIndex >= this.page.totalPages)) return;
    this.currentPage = pageIndex; this.loadProducts(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get totalElements(): number { return this.page?.totalElements || 0; }
  get totalPages(): number { return this.page?.totalPages || 0; }
  get pages(): number[] { return this.page ? Array.from({ length: this.page.totalPages }, (_, i) => i) : []; }
  get canPrevious(): boolean { return this.currentPage > 0; }
  get canNext(): boolean { return !!this.page && !this.page.last; }
}
