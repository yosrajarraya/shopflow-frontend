import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/other';
import { ToastService } from '../../core/services/toast';
import { CartResponse } from '../../core/models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit {
  cart: CartResponse | null = null;
  loading = true;
  couponCode = '';
  applyingCoupon = false;

  constructor(
    private cartService: CartService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void { this.loadCart(); }

  loadCart(): void {
    this.loading = true;
    this.cartService.voirPanier().subscribe({
      next: c => { this.cart = c; this.loading = false; },
      error: () => this.loading = false
    });
  }

  updateQty(itemId: number, qty: number): void {
    if (qty < 1) { this.removeItem(itemId); return; }
    this.cartService.modifierQuantite(itemId, qty).subscribe(c => this.cart = c);
  }

  removeItem(itemId: number): void {
    this.cartService.retirerArticle(itemId).subscribe({
      next: c => { this.cart = c; this.toastService.info('Article retiré du panier.'); },
      error: () => this.toastService.error('Erreur lors de la suppression.')
    });
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) return;
    this.applyingCoupon = true;
    this.cartService.appliquerCoupon(this.couponCode).subscribe({
      next: c => { this.cart = c; this.toastService.success('Code promo appliqué !'); this.applyingCoupon = false; },
      error: () => { this.toastService.error('Code promo invalide.'); this.applyingCoupon = false; }
    });
  }

  removeCoupon(): void {
    this.cartService.retirerCoupon().subscribe(c => { this.cart = c; this.couponCode = ''; });
  }

  checkout(): void { this.router.navigate(['/checkout']); }
  get isEmpty(): boolean { return !this.cart?.lignes?.length; }
}
