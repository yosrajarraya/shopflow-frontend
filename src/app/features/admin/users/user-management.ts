import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/other';
import { UserResponse, UserUpdateRequest } from '../../../core/models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagementComponent implements OnInit {

  // ── Données ───────────────────────────────────────────────────────────────
  allUsers: UserResponse[] = [];
  filtered: UserResponse[] = [];
  loading = true;

  // ── Filtres ───────────────────────────────────────────────────────────────
  searchQuery = '';
  roleFilter: 'ALL' | 'CUSTOMER' | 'SELLER' | 'ADMIN' = 'ALL';
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';

  // ── Pagination ────────────────────────────────────────────────────────────
  currentPage = 1;
  pageSize = 8;

  // ── Modal édition ─────────────────────────────────────────────────────────
  showEditModal = false;
  editingUser: UserResponse | null = null;
  editForm: FormGroup;
  saving = false;

  // ── Modal détail ──────────────────────────────────────────────────────────
  showDetailModal = false;
  detailUser: UserResponse | null = null;

  // ── Confirmation suppression ──────────────────────────────────────────────
  showDeleteConfirm = false;
  deletingUser: UserResponse | null = null;
  deleting = false;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.editForm = this.fb.group({
      nom:       ['', [Validators.required, Validators.minLength(2)]],
      prenom:    ['', [Validators.required, Validators.minLength(2)]],
      email:     ['', [Validators.required, Validators.email]],
      telephone: [''],
      role:      ['CUSTOMER', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.listerUtilisateurs().subscribe({
      next: users => {
        this.allUsers = users;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  // ── Filtres ───────────────────────────────────────────────────────────────
  applyFilters(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filtered = this.allUsers.filter(u => {
      const matchSearch = !q ||
        u.nom.toLowerCase().includes(q) ||
        u.prenom.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.telephone || '').includes(q);
      const matchRole = this.roleFilter === 'ALL' || u.role === this.roleFilter;
      const matchStatus = this.statusFilter === 'ALL' ||
        (this.statusFilter === 'ACTIVE' && u.actif) ||
        (this.statusFilter === 'INACTIVE' && !u.actif);
      return matchSearch && matchRole && matchStatus;
    });
    this.currentPage = 1;
  }

  onSearch(): void { this.applyFilters(); }
  setRole(r: 'ALL' | 'CUSTOMER' | 'SELLER' | 'ADMIN'): void { this.roleFilter = r; this.applyFilters(); }
  setStatus(s: 'ALL' | 'ACTIVE' | 'INACTIVE'): void { this.statusFilter = s; this.applyFilters(); }

  // ── Pagination ────────────────────────────────────────────────────────────
  get totalPages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get pages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pagedUsers(): UserResponse[] {
    const s = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(s, s + this.pageSize);
  }
  goPage(p: number): void { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }

  // ── Détail ────────────────────────────────────────────────────────────────
  openDetail(u: UserResponse): void { this.detailUser = u; this.showDetailModal = true; }
  closeDetail(): void { this.showDetailModal = false; this.detailUser = null; }

  // ── Édition ───────────────────────────────────────────────────────────────
  openEdit(u: UserResponse): void {
    this.editingUser = u;
    this.editForm.patchValue({
      nom: u.nom, prenom: u.prenom, email: u.email,
      telephone: u.telephone || '', role: u.role
    });
    this.showEditModal = true;
  }
  closeEdit(): void { this.showEditModal = false; this.editingUser = null; this.editForm.reset(); }

  saveEdit(): void {
    if (this.editForm.invalid || !this.editingUser) return;
    this.saving = true;
    const req: UserUpdateRequest = this.editForm.value;
    this.userService.modifierUtilisateur(this.editingUser.id, req).subscribe({
      next: updated => {
        const idx = this.allUsers.findIndex(u => u.id === updated.id);
        if (idx !== -1) this.allUsers[idx] = updated;
        this.applyFilters();
        this.saving = false;
        this.closeEdit();
        this.cdr.detectChanges();
      },
      error: () => { this.saving = false; this.cdr.detectChanges(); }
    });
  }

  // ── Activer / Désactiver ──────────────────────────────────────────────────
  toggleStatus(u: UserResponse): void {
    const obs = u.actif
      ? this.userService.desactiverCompte(u.id)
      : this.userService.activerCompte(u.id);
    obs.subscribe({
      next: updated => {
        const idx = this.allUsers.findIndex(x => x.id === updated.id);
        if (idx !== -1) this.allUsers[idx] = updated;
        this.applyFilters();
        this.cdr.detectChanges();
      }
    });
  }

  // ── Suppression ───────────────────────────────────────────────────────────
  confirmDelete(u: UserResponse): void { this.deletingUser = u; this.showDeleteConfirm = true; }
  cancelDelete(): void { this.showDeleteConfirm = false; this.deletingUser = null; }

  executeDelete(): void {
    if (!this.deletingUser) return;
    this.deleting = true;
    this.userService.supprimerUtilisateur(this.deletingUser.id).subscribe({
      next: () => {
        this.allUsers = this.allUsers.filter(u => u.id !== this.deletingUser!.id);
        this.applyFilters();
        this.deleting = false;
        this.cancelDelete();
        this.cdr.detectChanges();
      },
      error: () => { this.deleting = false; this.cdr.detectChanges(); }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  roleLabel(r: string): string {
    return ({ CUSTOMER: 'Client', SELLER: 'Vendeur', ADMIN: 'Admin' } as any)[r] || r;
  }
  roleBadgeClass(r: string): string {
    return ({ CUSTOMER: 'badge-info', SELLER: 'badge-accent', ADMIN: 'badge-warning' } as any)[r] || 'badge-muted';
  }
  initials(u: UserResponse): string {
    return `${u.prenom.charAt(0)}${u.nom.charAt(0)}`.toUpperCase();
  }
  avatarColor(u: UserResponse): string {
    const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444'];
    return colors[(u.id || 0) % colors.length];
  }

  get totalActive(): number { return this.allUsers.filter(u => u.actif).length; }
  get totalCustomers(): number { return this.allUsers.filter(u => u.role === 'CUSTOMER').length; }
  get totalSellers(): number { return this.allUsers.filter(u => u.role === 'SELLER').length; }
  get totalAdmins(): number { return this.allUsers.filter(u => u.role === 'ADMIN').length; }
}
