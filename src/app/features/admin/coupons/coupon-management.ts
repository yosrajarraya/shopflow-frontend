import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';
import { environment } from '../../../../environments/environment';

interface CouponResponse {
  id: number;
  code: string;
  type: 'PERCENT' | 'FIXED';
  valeur: number;
  dateExpiration: string | null;
  usagesMax: number;
  usagesActuels: number;
  actif: boolean;
}

@Component({
  selector: 'app-coupon-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './coupon-management.html',
  styleUrls: ['./coupon-management.css']
})
export class CouponManagementComponent implements OnInit {

  coupons: CouponResponse[] = [];
  loading = true;
  showModal = false;
  editMode = false;
  editingId: number | null = null;
  saving = false;
  showDeleteConfirm = false;
  deletingCoupon: CouponResponse | null = null;
  deleting = false;

  form: FormGroup;

  private readonly API = `${environment.apiUrl}/coupons`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      code:            ['', [Validators.required, Validators.minLength(3)]],
      type:            ['PERCENT', Validators.required],
      valeur:          [null, [Validators.required, Validators.min(0.01)]],
      dateExpiration:  [null],
      usagesMax:       [100, [Validators.required, Validators.min(1)]],
      actif:           [true]
    });
  }

  ngOnInit(): void { this.load(); }

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.token}` });
  }

  load(): void {
    this.loading = true;
    this.http.get<CouponResponse[]>(this.API, { headers: this.headers() }).subscribe({
      next: data => { this.coupons = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  openCreate(): void {
    this.editMode = false;
    this.editingId = null;
    this.form.reset({ type: 'PERCENT', usagesMax: 100, actif: true });
    this.showModal = true;
  }

  openEdit(c: CouponResponse): void {
    this.editMode = true;
    this.editingId = c.id;
    this.form.patchValue({
      code: c.code,
      type: c.type,
      valeur: c.valeur,
      dateExpiration: c.dateExpiration ? c.dateExpiration.substring(0, 10) : null,
      usagesMax: c.usagesMax,
      actif: c.actif
    });
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.form.reset(); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const body = { ...this.form.value };
    // Envoyer la date au format yyyy-MM-dd (LocalDate côté backend)
    // Ne pas ajouter T23:59:59 — le backend gère la conversion
    if (!body.dateExpiration) body.dateExpiration = null;

    const req = this.editMode && this.editingId
      ? this.http.put<CouponResponse>(`${this.API}/${this.editingId}`, body, { headers: this.headers() })
      : this.http.post<CouponResponse>(this.API, body, { headers: this.headers() });

    req.subscribe({
      next: saved => {
        if (this.editMode) {
          const idx = this.coupons.findIndex(c => c.id === saved.id);
          if (idx !== -1) this.coupons[idx] = saved;
        } else {
          this.coupons.unshift(saved);
        }
        this.saving = false;
        this.closeModal();
        this.toastService.success(this.editMode ? 'Coupon modifié.' : 'Coupon créé.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.saving = false;
        this.toastService.error(err.error?.message || 'Erreur.');
        this.cdr.detectChanges();
      }
    });
  }

  confirmDelete(c: CouponResponse): void { this.deletingCoupon = c; this.showDeleteConfirm = true; }
  cancelDelete(): void { this.showDeleteConfirm = false; this.deletingCoupon = null; }

  executeDelete(): void {
    if (!this.deletingCoupon) return;
    this.deleting = true;
    this.http.delete(`${this.API}/${this.deletingCoupon.id}`, { headers: this.headers() }).subscribe({
      next: () => {
        this.coupons = this.coupons.filter(c => c.id !== this.deletingCoupon!.id);
        this.deleting = false;
        this.cancelDelete();
        this.toastService.success('Coupon supprimé.');
        this.cdr.detectChanges();
      },
      error: () => { this.deleting = false; this.toastService.error('Erreur.'); this.cdr.detectChanges(); }
    });
  }

  typeLabel(t: string): string { return t === 'PERCENT' ? '%' : 'TND fixe'; }
  isExpired(c: CouponResponse): boolean {
    return !!c.dateExpiration && new Date(c.dateExpiration) < new Date();
  }
}
