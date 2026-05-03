import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
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

  // Password Validator: Must have uppercase, digit, special char, min 8
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUppercase = /[A-Z]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    const valid = hasUppercase && hasDigit && hasSpecialChar;
    return valid ? null : { passwordStrength: true };
  }

  // Password Match Validator
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('newPassword');
    const confirm = group.get('confirmPassword');

    if (!password || !confirm) return null;
    return password.value === confirm.value ? null : { passwordMismatch: true };
  }

  // Calculate password strength
  calculateStrength(): void {
    const password = this.resetForm.get('newPassword')?.value;
    if (!password) {
      this.passwordStrength = 0;
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[A-Z]/.test(password)) strength += 12;
    if (/[a-z]/.test(password)) strength += 12;
    if (/\d/.test(password)) strength += 13;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 13;

    this.passwordStrength = Math.min(strength, 100);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  get newPassword() {
    return this.resetForm.get('newPassword');
  }

  get confirmPassword() {
    return this.resetForm.get('confirmPassword');
  }

  get passwordMismatch(): boolean {
      return this.resetForm.hasError('passwordMismatch') &&
        !!this.confirmPassword?.touched;
  }

  submit(): void {
    if (!this.resetForm.valid || !this.token) {
      this.toastService.error('Formulaire invalide');
      return;
    }

    this.loading = true;
    const { newPassword } = this.resetForm.value;

    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: (response) => {
        this.loading = false;
        this.submitted = true;
        this.toastService.success('Mot de passe réinitialisé avec succès');
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur reset password', error);
        this.toastService.error('Token expiré ou mot de passe invalide');
      }
    });
  }

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
}
