import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from 'src/services/cart.service';
import { OrderService } from 'src/services/order.service';
import { ToastService } from 'src/services/toast.service';
import { CartResponse } from 'src/Models/cart.model';
import { OrderResponse } from 'src/Models/order.model';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  standalone: false
})
export class CheckoutComponent implements OnInit {
  form: FormGroup;
  cart: CartResponse | null = null;
  createdOrder: OrderResponse | null = null;
  loading = true;
  submitting = false;
  step = 1;

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
