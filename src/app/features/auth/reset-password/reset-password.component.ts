import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { ToastService } from 'src/services/toast.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  standalone: false
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  loading = false;
  submitted = false;
  token: string | null = null;
  showPassword = false;
  showConfirmPassword = false;
  passwordStrength = 0;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.toastService.error('Token invalide ou manquant');
      setTimeout(() => this.router.navigate(['/auth/login']), 2000);
    }
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const valid = /[A-Z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value);
    return valid ? null : { passwordStrength: true };
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const p = group.get('newPassword');
    const c = group.get('confirmPassword');
    if (!p || !c) return null;
    return p.value === c.value ? null : { passwordMismatch: true };
  }

  calculateStrength(): void {
    const p = this.resetForm.get('newPassword')?.value;
    if (!p) { this.passwordStrength = 0; return; }
    let s = 0;
    if (p.length >= 8) s += 25;
    if (p.length >= 12) s += 25;
    if (/[A-Z]/.test(p)) s += 12;
    if (/[a-z]/.test(p)) s += 12;
    if (/\d/.test(p)) s += 13;
    if (/[^A-Za-z0-9]/.test(p)) s += 13;
    this.passwordStrength = Math.min(s, 100);
  }

  get newPassword() { return this.resetForm.get('newPassword'); }
  get confirmPassword() { return this.resetForm.get('confirmPassword'); }
  get passwordMismatch(): boolean { return this.resetForm.hasError('passwordMismatch') && !!this.confirmPassword?.touched; }

  get strengthText(): string {
    if (this.passwordStrength === 0) return '';
    if (this.passwordStrength < 40) return 'Faible';
    if (this.passwordStrength < 70) return 'Moyen';
    return 'Fort';
  }

  get strengthClass(): string {
    if (this.passwordStrength === 0) return '';
    if (this.passwordStrength < 40) return 'weak';
    if (this.passwordStrength < 70) return 'medium';
    return 'strong';
  }

  submit(): void {
    if (!this.resetForm.valid || !this.token) { this.toastService.error('Formulaire invalide'); return; }
    this.loading = true;
    this.authService.resetPassword(this.token, this.resetForm.value.newPassword).subscribe({
      next: () => {
        this.loading = false; this.submitted = true;
        this.toastService.success('Mot de passe réinitialisé avec succès');
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: () => { this.loading = false; this.toastService.error('Token expiré ou mot de passe invalide'); }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
