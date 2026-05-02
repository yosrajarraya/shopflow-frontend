import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { CartService, OrderService } from '../../../core/services/other';
import { ToastService } from '../../../core/services/toast';
import { CartResponse, OrderResponse } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class CheckoutComponent implements OnInit {
  form: FormGroup;
  cart: CartResponse | null = null;
  createdOrder: OrderResponse | null = null;
  loading = true;
  submitting = false;
  step = 1; // 1=address 2=recap 3=success

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.form = this.fb.group({
      adresseLivraison: ['', [Validators.required, Validators.minLength(10)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.cartService.voirPanier().subscribe({
      next: c => { this.cart = c; this.loading = false; if (!c.lignes?.length) this.router.navigate(['/cart']); },
      error: () => this.router.navigate(['/cart'])
    });
  }

  nextStep(): void { if (this.form.valid) this.step = 2; else this.form.markAllAsTouched(); }

  placeOrder(): void {
    this.submitting = true;
    this.orderService.passerCommande(this.form.value).subscribe({
      next: order => { this.createdOrder = order; this.step = 3; this.submitting = false; },
      error: () => { this.toastService.error('Erreur lors de la commande.'); this.submitting = false; }
    });
  }

  get adresse() { return this.form.get('adresseLivraison')!; }
}
