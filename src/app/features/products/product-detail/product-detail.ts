import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product';
import { CartService } from '../../../core/services/other';
import { ToastService } from '../../../core/services/toast';
import { AuthService } from '../../../core/services/auth';
import { ProductResponse, VariantResponse } from '../../../core/models';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, StarRatingComponent, LoadingSpinnerComponent],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css']
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
    this.productService.voirProduit(id).pipe(
      timeout(15000)
    ).subscribe({
      next: p => {
        this.product = p;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Product load error:', err);
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/products']);
      }
    });
  }

  selectVariant(v: VariantResponse): void {
    this.selectedVariant = this.selectedVariant?.id === v.id ? null : v;
  }

  get finalPrice(): number {
    if (!this.product) return 0;
    const base = this.product.prixPromo || this.product.prix;
    return base + (this.selectedVariant?.prixDelta || 0);
  }

  adjustQty(delta: number): void {
    const max = this.product?.stock || 1;
    this.quantity = Math.max(1, Math.min(this.quantity + delta, max));
  }

  addToCart(): void {
    if (!this.authService.isLoggedIn()) { this.router.navigate(['/auth/login']); return; }
    if (!this.authService.isCustomer()) {
      this.toastService.warning('Seuls les clients peuvent ajouter au panier.');
      return;
    }
    this.addingToCart = true;
    const req = {
      productId: this.product!.id,
      quantite: this.quantity,
      variantId: this.selectedVariant?.id
    };
    console.log('AddToCart request:', req);

    // Vérifier localement la disponibilité en tenant compte du panier existant
    this.cartService.voirPanier().subscribe({
      next: cart => {
        const existing = cart.lignes.find(l => l.productId === req.productId && (req.variantId == null || l.variantId === req.variantId));
        const existingQty = existing ? existing.quantite : 0;
        const available = this.product ? this.product.stock : 0;
        if (existingQty + req.quantite > available) {
          this.toastService.error('Stock insuffisant pour cette quantité');
          this.addingToCart = false;
          return;
        }

        // Envoyer la requête si la vérification locale passe
        this.cartService.ajouterArticle(req).subscribe({
          next: () => { this.toastService.success('Produit ajouté au panier !'); this.addingToCart = false; },
          error: (err) => {
            console.error('AddToCart error status:', err.status);
            console.error('AddToCart error body:', err.error);
            try { console.error('AddToCart error body (json):', JSON.stringify(err.error)); } catch {};
            // Afficher le message précis du backend quand il est disponible
            this.toastService.error(err?.error?.message || 'Erreur lors de l\'ajout.');
            this.addingToCart = false;
          }
        });
      },
      error: () => {
        // Si on ne peut pas récupérer le panier, on tente quand même l'ajout (backend fera la validation finale)
        this.cartService.ajouterArticle(req).subscribe({
          next: () => { this.toastService.success('Produit ajouté au panier !'); this.addingToCart = false; },
          error: (err) => { this.toastService.error(err?.error?.message || 'Erreur lors de l\'ajout.'); this.addingToCart = false; }
        });
      }
    });
  }

  get hasImages(): boolean { return (this.product?.images?.length || 0) > 0; }
  get hasMultipleImages(): boolean { return (this.product?.images?.length || 0) > 1; }
  get hasCategories(): boolean { return (this.product?.categories?.length || 0) > 0; }
  get hasVariants(): boolean { return (this.product?.variantes?.length || 0) > 0; }
  get hasReviews(): boolean { return (this.product?.avis?.length || 0) > 0; }
  get activeImage(): string { return this.product?.images?.[this.activeImageIndex] || ''; }

  canDeleteProduct(): boolean {
    if (!this.authService.isLoggedIn()) return false;
    if (!this.product) return false;
    return this.authService.isAdmin() || (this.authService.isSeller() && this.isProductOwner());
  }

  isProductOwner(): boolean {
    if (!this.product || !this.authService.currentUser) return false;
    return this.product.sellerId === this.authService.currentUser.userId;
  }

  deleteProduit(): void {
    if (!this.product) return;
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${this.product.nom}" ?`)) return;

    this.deleting = true;
    this.productService.supprimerProduit(this.product.id).subscribe({
      next: () => {
        this.toastService.success('Produit supprimé avec succès !');
        this.router.navigate(['/products']);
      },
      error: (err: any) => {
        this.toastService.error(err.error?.message || 'Erreur lors de la suppression du produit');
        this.deleting = false;
      }
    });
  }
}
