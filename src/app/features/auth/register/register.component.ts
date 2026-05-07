import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { ToastService } from 'src/services/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: false
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  role: 'CUSTOMER' | 'SELLER' = 'CUSTOMER';
  showPass = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nom:        ['', [Validators.required, Validators.minLength(2)]],
      prenom:     ['', [Validators.required, Validators.minLength(2)]],
      email:      ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)]],
      telephone:  [''],
      nomBoutique: ['']
    });
  }

  onRoleChange(newRole: 'CUSTOMER' | 'SELLER'): void {
    this.role = newRole;
    const nomBoutique = this.form.get('nomBoutique');
    if (newRole === 'SELLER') {
      nomBoutique?.setValidators([Validators.required, Validators.minLength(2)]);
    } else {
      nomBoutique?.clearValidators();
    }
    nomBoutique?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const payload = this.form.value;
    const action = this.role === 'SELLER'
      ? this.authService.registerSeller(payload)
      : this.authService.register(payload);

    action.subscribe({
      next: user => {
        this.toastService.success(`Bienvenue, ${user.nom} !`);
        if (user.role === 'SELLER') this.router.navigate(['/dashboard/seller']);
        else this.router.navigate(['/products']);
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error?.errors?.[0]?.defaultMessage || 'Erreur lors de l\'inscription.';
        this.toastService.error(msg);
        this.loading = false;
      }
    });
  }

  nom() { return this.form.get('nom')!; }
  prenom() { return this.form.get('prenom')!; }
  email() { return this.form.get('email')!; }
  motDePasse() { return this.form.get('motDePasse')!; }
  nomBoutique() { return this.form.get('nomBoutique')!; }
}
