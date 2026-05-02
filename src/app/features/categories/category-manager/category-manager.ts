import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../../core/services/other';
import { ToastService } from '../../../core/services/toast';
import { CategoryResponse } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-category-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './category-manager.html',
  styleUrls: ['./category-manager.css']
})
export class CategoryManagerComponent implements OnInit {
  categories: CategoryResponse[] = [];
  form: FormGroup;
  loading = true;
  submitting = false;
  editMode = false;
  selectedId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      parentId: [null]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.listerCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Impossible de charger les catégories.');
        this.loading = false;
      }
    });
  }

  editCategory(category: CategoryResponse): void {
    this.editMode = true;
    this.selectedId = category.id;
    this.form.patchValue({
      nom: category.nom,
      description: category.description || '',
      parentId: category.parentId || null
    });
  }

  resetForm(): void {
    this.editMode = false;
    this.selectedId = null;
    this.form.reset({ nom: '', description: '', parentId: null });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = this.form.value;

    const request = this.editMode && this.selectedId
      ? this.categoryService.modifierCategorie(this.selectedId, payload)
      : this.categoryService.creerCategorie(payload);

    request.subscribe({
      next: () => {
        this.toastService.success(this.editMode ? 'Catégorie modifiée.' : 'Catégorie créée.');
        this.resetForm();
        this.loadCategories();
        this.submitting = false;
      },
      error: () => {
        this.toastService.error('Erreur lors de l’enregistrement.');
        this.submitting = false;
      }
    });
  }

  deleteCategory(id: number): void {
    if (!confirm('Supprimer cette catégorie ?')) return;

    this.categoryService.supprimerCategorie(id).subscribe({
      next: () => {
        this.categories = this.categories.filter(c => c.id !== id);
        this.toastService.success('Catégorie supprimée.');
      },
      error: () => this.toastService.error('Suppression impossible.')
    });
  }

  get nom() {
    return this.form.get('nom')!;
  }
}
