import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from 'src/services/product.service';
import { CategoryService } from 'src/services/category.service';
import { ToastService } from 'src/services/toast.service';
import { CategoryResponse } from 'src/Models/category.model';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
  standalone: false
})
export class ProductFormComponent implements OnInit {
  form: FormGroup;
  categories: CategoryResponse[] = [];
  loading = false;
  submitting = false;
  editMode = false;
  productId?: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      nom:         ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      prix:        ['', [Validators.required, Validators.min(0.01)]],
      prixPromo:   [null],
      stock:       [0,  [Validators.required, Validators.min(0)]],
      categoryIds: [[], [Validators.required]],
      images:      this.fb.array([this.fb.control('')])
    });
  }

  ngOnInit(): void {
    this.categoryService.listerCategories().subscribe(c => this.categories = c);
    const idParam = this.route.snapshot.paramMap.get('id');
    this.productId = idParam ? Number(idParam) : undefined;
    if (this.productId && !isNaN(this.productId)) {
      this.editMode = true; this.loading = true;
      this.productService.voirProduit(this.productId).subscribe(p => {
        this.form.patchValue({ ...p, categoryIds: p.categories.map(c => c.id) });
        while (this.images.length) this.images.removeAt(0);
        (p.images?.length ? p.images : ['']).forEach(img => this.images.push(this.fb.control(img)));
        this.loading = false;
      });
    }
  }

  get images(): FormArray { return this.form.get('images') as FormArray; }
  addImage(): void { this.images.push(this.fb.control('')); }
  removeImage(i: number): void { if (this.images.length > 1) this.images.removeAt(i); }

  toggleCategory(id: number): void {
    const current: number[] = this.form.get('categoryIds')!.value;
    const updated = current.includes(id) ? current.filter(c => c !== id) : [...current, id];
    this.form.get('categoryIds')!.setValue(updated);
  }
  isSelected(id: number): boolean { return (this.form.get('categoryIds')!.value as number[]).includes(id); }
  get previewImage(): string { return this.images.value.find((v: string) => v?.trim()) || ''; }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const payload = { ...this.form.value, images: this.images.value.filter((v: string) => v?.trim()) };
    const action = this.editMode ? this.productService.modifierProduit(this.productId!, payload) : this.productService.creerProduit(payload);
    action.subscribe({
      next: p => { this.toastService.success(this.editMode ? 'Produit modifié !' : 'Produit créé !'); this.router.navigate(['/products', p.id]); },
      error: () => { this.toastService.error('Une erreur est survenue.'); this.submitting = false; }
    });
  }

  get nom() { return this.form.get('nom')!; }
  get description() { return this.form.get('description')!; }
  get prix() { return this.form.get('prix')!; }
  get stock() { return this.form.get('stock')!; }
}
