import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from 'src/services/category.service';
import { ToastService } from 'src/services/toast.service';
import { CategoryResponse } from 'src/Models/category.model';

@Component({
  selector: 'app-category-manager',
  templateUrl: './category-manager.component.html',
  styleUrls: ['./category-manager.component.css'],
  standalone: false
})
export class CategoryManagerComponent implements OnInit {
  categories: CategoryResponse[] = [];
  loading = true;
  searchQuery = '';
  currentPage = 1;
  pageSize = 6;
  showModal = false;
  editMode = false;
  editingId: number | null = null;
  submitting = false;
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

  filtered(): CategoryResponse[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.categories.filter(c => !q || c.nom.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q));
  }

  totalPages(): number { return Math.max(1, Math.ceil(this.filtered().length / this.pageSize)); }
  pages(): number[] { return Array.from({ length: this.totalPages() }, (_, i) => i + 1); }
  pagedCategories(): CategoryResponse[] {
    const s = (this.currentPage - 1) * this.pageSize;
    return this.filtered().slice(s, s + this.pageSize);
  }
  goPage(p: number): void { if (p >= 1 && p <= this.totalPages()) this.currentPage = p; }
  onSearch(): void { this.currentPage = 1; }

  openCreate(): void { this.editMode = false; this.editingId = null; this.form.reset({ nom: '', description: '', parentId: null }); this.showModal = true; }
  openEdit(cat: CategoryResponse): void { this.editMode = true; this.editingId = cat.id; this.form.patchValue({ nom: cat.nom, description: cat.description || '', parentId: cat.parentId || null }); this.showModal = true; }
  closeModal(): void { this.showModal = false; this.form.reset(); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const req = this.editMode && this.editingId
      ? this.categoryService.modifierCategorie(this.editingId, this.form.value)
      : this.categoryService.creerCategorie(this.form.value);
    req.subscribe({
      next: () => { this.toastService.success(this.editMode ? 'Catégorie modifiée.' : 'Catégorie créée.'); this.submitting = false; this.closeModal(); this.load(); },
      error: () => { this.toastService.error('Erreur lors de l\'enregistrement.'); this.submitting = false; this.cdr.detectChanges(); }
    });
  }

  confirmDelete(cat: CategoryResponse): void { this.deletingCategory = cat; this.showDeleteConfirm = true; }
  cancelDelete(): void { this.showDeleteConfirm = false; this.deletingCategory = null; }

  executeDelete(): void {
    if (!this.deletingCategory) return;
    this.deleting = true;
    this.categoryService.supprimerCategorie(this.deletingCategory.id).subscribe({
      next: () => {
        this.categories = this.categories.filter(c => c.id !== this.deletingCategory!.id);
        if (this.currentPage > this.totalPages() && this.totalPages() > 0) this.currentPage = this.totalPages();
        this.deleting = false; this.cancelDelete(); this.toastService.success('Catégorie supprimée.'); this.cdr.detectChanges();
      },
      error: () => { this.deleting = false; this.toastService.error('Suppression impossible.'); this.cdr.detectChanges(); }
    });
  }

  parentName(parentId: number | undefined): string {
    if (!parentId) return '';
    return this.categories.find(c => c.id === parentId)?.nom || '';
  }

  availableParents(): CategoryResponse[] { return this.categories.filter(c => c.id !== this.editingId); }
  nom() { return this.form.get('nom')!; }
}
