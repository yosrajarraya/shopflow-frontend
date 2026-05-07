import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from 'src/services/product.service';
import { CartService } from 'src/services/cart.service';
import { ToastService } from 'src/services/toast.service';
import { AuthService } from 'src/services/auth.service';
import { ProductResponse } from 'src/Models/product.model';
import { VariantResponse } from 'src/Models/variant.model';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
  standalone: false
})
export class ProductDetailComponent implements OnInit {
  product: ProductResponse | null = null;
  loading = true;
  addingToCart = false;
  deleting = false;
  selectedVariant: VariantResponse | null = null;
  quantity = 1;
  activeImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private toastService: ToastService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.voirProduit(id).pipe(timeout(15000)).subscribe({
      next: p => { this.product = p; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); this.router.navigate(['/products']); }
    });
  }

  selectVariant(v: VariantResponse): void {
    this.selectedVariant = this.selectedVariant?.id === v.id ? null : v;
  }

  get finalPrice(): number {
    if (!this.product) return 0;
    return (this.product.prixPromo || this.product.prix) + (this.selectedVariant?.prixDelta || 0);
  }

  adjustQty(delta: number): void {
    const max = this.product?.stock || 1;
    this.quantity = Math.max(1, Math.min(this.quantity + delta, max));
  }

  addToCart(): void {
    if (!this.authService.isLoggedIn()) { this.router.navigate(['/auth/login']); return; }
    if (!this.authService.isCustomer()) { this.toastService.warning('Seuls les clients peuvent ajouter au panier.'); return; }
    this.addingToCart = true;
    const req = { productId: this.product!.id, quantite: this.quantity, variantId: this.selectedVariant?.id };
    this.cartService.ajouterArticle(req).subscribe({
      next: () => { this.toastService.success('Produit ajouté au panier !'); this.addingToCart = false; },
      error: (err) => { this.toastService.error(err?.error?.message || 'Erreur lors de l\'ajout.'); this.addingToCart = false; }
    });
  }

  canDeleteProduct(): boolean {
    if (!this.authService.isLoggedIn() || !this.product) return false;
    return this.authService.isAdmin() || (this.authService.isSeller() && this.isProductOwner());
  }

  isProductOwner(): boolean {
    if (!this.product || !this.authService.currentUser) return false;
    return this.product.sellerId === this.authService.currentUser.userId;
  }

  deleteProduit(): void {
    if (!this.product || !confirm(`Êtes-vous sûr de vouloir supprimer "${this.product.nom}" ?`)) return;
    this.deleting = true;
    this.productService.supprimerProduit(this.product.id).subscribe({
      next: () => { this.toastService.success('Produit supprimé !'); this.router.navigate(['/products']); },
      error: (err: any) => { this.toastService.error(err.error?.message || 'Erreur'); this.deleting = false; }
    });
  }

  get hasImages(): boolean { return (this.product?.images?.length || 0) > 0; }
  get hasMultipleImages(): boolean { return (this.product?.images?.length || 0) > 1; }
  get hasCategories(): boolean { return (this.product?.categories?.length || 0) > 0; }
  get hasVariants(): boolean { return (this.product?.variantes?.length || 0) > 0; }
  get hasReviews(): boolean { return (this.product?.avis?.length || 0) > 0; }
  get activeImage(): string { return this.product?.images?.[this.activeImageIndex] || ''; }
}
