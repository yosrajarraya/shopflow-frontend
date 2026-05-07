import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/services/auth.service';
import { ToastService } from 'src/services/toast.service';
import { CouponService, CouponResponse } from 'src/services/coupon.service';

@Component({
  selector: 'app-coupon-management',
  templateUrl: './coupon-management.component.html',
  styleUrls: ['./coupon-management.component.css'],
  standalone: false
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

  constructor(
    private couponService: CouponService,
    private authService: AuthService,
    private toastService: ToastService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      code:           ['', [Validators.required, Validators.minLength(3)]],
      type:           ['PERCENT', Validators.required],
      valeur:         [null, [Validators.required, Validators.min(0.01)]],
      dateExpiration: [null],
      usagesMax:      [100, [Validators.required, Validators.min(1)]],
      actif:          [true]
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.couponService.listerCoupons().subscribe({
      next: data => { this.coupons = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  openCreate(): void { this.editMode = false; this.editingId = null; this.form.reset({ type: 'PERCENT', usagesMax: 100, actif: true }); this.showModal = true; }
  openEdit(c: CouponResponse): void {
    this.editMode = true; this.editingId = c.id;
    this.form.patchValue({ code: c.code, type: c.type, valeur: c.valeur, dateExpiration: c.dateExpiration ? c.dateExpiration.substring(0, 10) : null, usagesMax: c.usagesMax, actif: c.actif });
    this.showModal = true;
  }
  closeModal(): void { this.showModal = false; this.form.reset(); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const body = { ...this.form.value };
    if (!body.dateExpiration) body.dateExpiration = null;
    const req = this.editMode && this.editingId
      ? this.couponService.modifierCoupon(this.editingId, body)
      : this.couponService.creerCoupon(body);
    req.subscribe({
      next: saved => {
        if (this.editMode) { const idx = this.coupons.findIndex(c => c.id === saved.id); if (idx !== -1) this.coupons[idx] = saved; }
        else { this.coupons.unshift(saved); }
        this.saving = false; this.closeModal(); this.toastService.success(this.editMode ? 'Coupon modifié.' : 'Coupon créé.'); this.cdr.detectChanges();
      },
      error: (err) => { this.saving = false; this.toastService.error(err.error?.message || 'Erreur.'); this.cdr.detectChanges(); }
    });
  }

  confirmDelete(c: CouponResponse): void { this.deletingCoupon = c; this.showDeleteConfirm = true; }
  cancelDelete(): void { this.showDeleteConfirm = false; this.deletingCoupon = null; }

  executeDelete(): void {
    if (!this.deletingCoupon) return;
    this.deleting = true;
    this.couponService.supprimerCoupon(this.deletingCoupon.id).subscribe({
      next: () => { this.coupons = this.coupons.filter(c => c.id !== this.deletingCoupon!.id); this.deleting = false; this.cancelDelete(); this.toastService.success('Coupon supprimé.'); this.cdr.detectChanges(); },
      error: () => { this.deleting = false; this.toastService.error('Erreur.'); this.cdr.detectChanges(); }
    });
  }

  typeLabel(t: string): string { return t === 'PERCENT' ? '%' : 'TND fixe'; }
  isExpired(c: CouponResponse): boolean { return !!c.dateExpiration && new Date(c.dateExpiration) < new Date(); }
}
