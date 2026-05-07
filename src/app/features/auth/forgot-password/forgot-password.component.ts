import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { ToastService } from 'src/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  standalone: false
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = false;
  submitted = false;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() { return this.forgotForm.get('email'); }

  submit(): void {
    if (!this.forgotForm.valid) { this.toastService.error('Veuillez entrer une adresse email valide'); return; }
    this.loading = true;
    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: (message) => {
        this.loading = false; this.submitted = true; this.successMessage = message as any;
        this.toastService.success('Email de réinitialisation envoyé');
        setTimeout(() => this.router.navigate(['/auth/login']), 3000);
      },
      error: () => {
        this.loading = false;
        this.toastService.error('Cet email n\'existe pas ou une erreur est survenue');
      }
    });
  }
}
