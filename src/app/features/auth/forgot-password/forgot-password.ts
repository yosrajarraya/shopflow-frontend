import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
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

  get email() {
    return this.forgotForm.get('email');
  }

  submit(): void {
    if (!this.forgotForm.valid) {
      this.toastService.error('Veuillez entrer une adresse email valide');
      return;
    }

    this.loading = true;
    const { email } = this.forgotForm.value;

    this.authService.forgotPassword(email).subscribe({
      next: (message) => {
        this.loading = false;
        this.submitted = true;
        this.successMessage = message;
        this.toastService.success('Email de réinitialisation envoyé');
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur forgot password', error);
        this.toastService.error('Cet email n\'existe pas ou une erreur est survenue');
      }
    });
  }
}
