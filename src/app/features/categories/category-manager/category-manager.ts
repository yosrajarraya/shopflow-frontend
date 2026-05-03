import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../../core/services/other';
import { ToastService } from '../../../core/services/toast';
import { CategoryResponse } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-category-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './category-manager.html',
  styleUrls: ['./category-manager.css']
})
export class CategoryManagerComponent implements OnInit {

  categories: CategoryResponse[] = [];
  loading = true;
  searchQuery = '';

  // Pagination
  currentPage = 1;
  pageSize = 6;

  // Modal
  showModal = false;
  editMode = false;
  editingId: number | null = null;
  submitting = false;

  // Confirm delete
  showDeleteConfirm = false;
  deletingCategory: CategoryResponse | null = null;
  deleting = false;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      nom:         ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      parentId:    [null]
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.categoryService.listerCategories().subscribe({
      next: data => { this.categories = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.toastService.error('Impossible de charger les catégories.'); this.loading = false; this.cdr.detectChanges(); }
    });
  }

  // ── Filtres & pagination ──────────────────────────────────────
  get filtered(): CategoryResponse[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.categories.filter(c =>
      !q || c.nom.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q)
    );
  }
  get totalPages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get pages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pagedCategories(): CategoryResponse[] {
    const s = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(s, s + this.pageSize);
  }
  goPage(p: number): void { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }
  onSearch(): void { this.currentPage = 1; }

  // ── Modal ─────────────────────────────────────────────────────
  openCreate(): void {
    this.editMode = false;
    this.editingId = null;
    this.form.reset({ nom: '', description: '', parentId: null });
    this.showModal = true;
  }

  openEdit(cat: CategoryResponse): void {
    this.editMode = true;
    this.editingId = cat.id;
    this.form.patchValue({ nom: cat.nom, description: cat.description || '', parentId: cat.parentId || null });
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.form.reset(); }

  // Backwards-compatible helpers used by template
  resetForm(): void { this.editMode = false; this.editingId = null; this.closeModal(); }
  editCategory(cat: CategoryResponse): void { this.openEdit(cat); }
  deleteCategory(id: number): void {
    const cat = this.categories.find(c => c.id === id);
    if (!cat) return;
    if (!confirm(`Supprimer la catégorie "${cat.nom}" ?`)) return;
    this.confirmDelete(cat);
    this.executeDelete();
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const payload = this.form.value;

    const req = this.editMode && this.editingId
      ? this.categoryService.modifierCategorie(this.editingId, payload)
      : this.categoryService.creerCategorie(payload);

    req.subscribe({
      next: () => {
        this.toastService.success(this.editMode ? 'Catégorie modifiée.' : 'Catégorie créée.');
        this.submitting = false;
        this.closeModal();
        this.load();
      },
      error: () => { this.toastService.error('Erreur lors de l\'enregistrement.'); this.submitting = false; this.cdr.detectChanges(); }
    });
  }

  // ── Suppression ───────────────────────────────────────────────
  confirmDelete(cat: CategoryResponse): void { this.deletingCategory = cat; this.showDeleteConfirm = true; }
  cancelDelete(): void { this.showDeleteConfirm = false; this.deletingCategory = null; }

  executeDelete(): void {
    if (!this.deletingCategory) return;
    this.deleting = true;
    this.categoryService.supprimerCategorie(this.deletingCategory.id).subscribe({
      next: () => {
        this.categories = this.categories.filter(c => c.id !== this.deletingCategory!.id);
        if (this.currentPage > this.totalPages && this.totalPages > 0) this.currentPage = this.totalPages;
        this.deleting = false;
        this.cancelDelete();
        this.toastService.success('Catégorie supprimée.');
        this.cdr.detectChanges();
      },
      error: () => { this.deleting = false; this.toastService.error('Suppression impossible.'); this.cdr.detectChanges(); }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  parentName(parentId: number | undefined): string {
    if (!parentId) return '';
    return this.categories.find(c => c.id === parentId)?.nom || '';
  }

  get availableParents(): CategoryResponse[] {
    return this.categories.filter(c => c.id !== this.editingId);
  }

  get nom() { return this.form.get('nom')!; }
}
