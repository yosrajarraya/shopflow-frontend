import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService, ReviewService } from '../../../core/services/other';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';
import { OrderResponse, OrderStatus, ReviewResponse } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './order-detail.html',
  styleUrls: ['./order-detail.css']
})
export class OrderDetailComponent implements OnInit {
  order: OrderResponse | null = null;
  loading = true;
  reviewForms: Map<number, FormGroup> = new Map();
  submittingReviews: Map<number, boolean> = new Map();
  submittedReviews: Map<number, ReviewResponse> = new Map();

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private reviewService: ReviewService,
    public authService: AuthService,
    private toastService: ToastService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.voirCommande(id).subscribe({
      next: o => {
        this.order = o;
        this.loading = false;
        // Initialize review forms for each line item
        if (o.lignes) {
          o.lignes.forEach(ligne => {
            this.reviewForms.set(ligne.id, this.fb.group({
              note: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
              commentaire: ['', [Validators.required, Validators.minLength(10)]]
            }));
            this.submittingReviews.set(ligne.id, false);
          });
        }
        this.cdr.detectChanges();
      },
      error: () => this.loading = false
    });
  }

  statusLabel(s: OrderStatus): string {
    const map: Record<OrderStatus, string> = { PENDING:'En attente', PAID:'Payée', PROCESSING:'En traitement', SHIPPED:'Expédiée', DELIVERED:'Livrée', CANCELLED:'Annulée' };
    return map[s] || s;
  }

  statusClass(s: OrderStatus): string {
    const map: Record<OrderStatus, string> = { PENDING:'badge-warning', PAID:'badge-info', PROCESSING:'badge-info', SHIPPED:'badge-accent', DELIVERED:'badge-success', CANCELLED:'badge-danger' };
    return map[s] || 'badge-muted';
  }

  get steps(): { label: string; status: OrderStatus; done: boolean }[] {
    const flow: OrderStatus[] = ['PENDING','PAID','PROCESSING','SHIPPED','DELIVERED'];
    const currentIdx = flow.indexOf(this.order!.statut);
    return flow.map((s, i) => ({ label: this.statusLabel(s), status: s, done: i <= currentIdx }));
  }

  canReview(): boolean {
    if (!this.order) return false;
    return ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(this.order.statut);
  }

  setReviewNote(lineId: number, note: number): void {
    const form = this.reviewForms.get(lineId);
    if (form) form.patchValue({ note });
  }

  submitReview(lineId: number, productId: number): void {
    const form = this.reviewForms.get(lineId);
    if (!form || form.invalid) {
      form?.markAllAsTouched();
      return;
    }

    this.submittingReviews.set(lineId, true);
    const note = Number(form.get('note')?.value || 5);
    const commentaire = String(form.get('commentaire')?.value || '').trim();

    this.reviewService.soumettreAvis(productId, this.order!.id, note, commentaire).subscribe({
      next: (review: ReviewResponse) => {
        this.submittedReviews.set(lineId, review);
        form.reset({ note: 5, commentaire: '' });
        this.submittingReviews.set(lineId, false);
        this.toastService.success(
          review.approuve
            ? 'Votre avis a été publié.'
            : 'Votre avis a été envoyé et sera affiché après validation.'
        );
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.submittingReviews.set(lineId, false);
        this.toastService.error(err.error?.message || 'Impossible d\'envoyer votre avis.');
        this.cdr.detectChanges();
      }
    });
  }

  hasSubmittedReview(lineId: number): boolean {
    return this.submittedReviews.has(lineId);
  }

  getForm(lineId: number): FormGroup | undefined {
    return this.reviewForms.get(lineId);
  }

  isSubmitting(lineId: number): boolean {
    return this.submittingReviews.get(lineId) || false;
  }
}
