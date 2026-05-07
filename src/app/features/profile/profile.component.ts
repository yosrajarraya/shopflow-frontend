import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/services/auth.service';
import { ProfileService } from 'src/services/profile.service';
import { ToastService } from 'src/services/toast.service';
import { AddressRequest, AddressResponse } from 'src/Models/address.model';
import { AuthResponse } from 'src/Models/auth.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: false
})
export class ProfileComponent implements OnInit {
  currentUser: AuthResponse | null = null;
  addresses: AddressResponse[] = [];
  loading = true;
  showAddressModal = false;
  editingAddressId: number | null = null;
  addressForm: FormGroup;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.addressForm = this.fb.group({
      rue: ['', [Validators.required, Validators.minLength(3)]],
      ville: ['', [Validators.required, Validators.minLength(2)]],
      codePostal: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      pays: ['', [Validators.required, Validators.minLength(2)]],
      principal: [false]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.loading = true;
    this.profileService.getAddresses().subscribe({
      next: (addresses) => { this.addresses = addresses; this.loading = false; },
      error: () => { this.toastService.error('Erreur lors du chargement des adresses'); this.loading = false; }
    });
  }

  openAddAddressModal(): void {
    this.editingAddressId = null;
    this.addressForm.reset({ principal: false });
    this.showAddressModal = true;
  }

  openEditAddressModal(address: AddressResponse): void {
    this.editingAddressId = address.id;
    this.addressForm.patchValue(address);
    this.showAddressModal = true;
  }

  closeAddressModal(): void { this.showAddressModal = false; this.addressForm.reset(); }

  saveAddress(): void {
    if (!this.addressForm.valid) { this.toastService.error('Veuillez remplir tous les champs correctement'); return; }
    const request: AddressRequest = this.addressForm.value;
    if (this.editingAddressId) {
      this.profileService.updateAddress(this.editingAddressId, request).subscribe({
        next: () => { this.toastService.success('Adresse mise à jour'); this.closeAddressModal(); this.loadAddresses(); },
        error: () => this.toastService.error('Erreur lors de la mise à jour')
      });
    } else {
      this.profileService.createAddress(request).subscribe({
        next: () => { this.toastService.success('Adresse créée'); this.closeAddressModal(); this.loadAddresses(); },
        error: () => this.toastService.error('Erreur lors de la création')
      });
    }
  }

  deleteAddress(id: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette adresse?')) return;
    this.profileService.deleteAddress(id).subscribe({
      next: () => { this.toastService.success('Adresse supprimée'); this.loadAddresses(); },
      error: () => this.toastService.error('Erreur lors de la suppression')
    });
  }

  setMainAddress(id: number): void {
    this.profileService.setMainAddress(id).subscribe({
      next: () => { this.toastService.success('Adresse principale définie'); this.loadAddresses(); },
      error: () => this.toastService.error('Erreur')
    });
  }

  get isFormDirty(): boolean { return this.addressForm.dirty && this.addressForm.valid; }
}
