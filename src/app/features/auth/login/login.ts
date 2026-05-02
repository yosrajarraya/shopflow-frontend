import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  showPass = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    });
    if (authService.isLoggedIn()) router.navigate(['/']);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.authService.login(this.form.value).subscribe({
      next: user => {
        this.toastService.success(`Bienvenue, ${user.nom} !`);
        if (user.role === 'ADMIN') this.router.navigate(['/dashboard/admin']);
        else if (user.role === 'SELLER') this.router.navigate(['/dashboard/seller']);
        else this.router.navigate(['/products']);
      },
      error: () => {
        this.toastService.error('Email ou mot de passe incorrect.');
        this.loading = false;
      }
    });
  }

  get email() { return this.form.get('email')!; }
  get motDePasse() { return this.form.get('motDePasse')!; }
}
