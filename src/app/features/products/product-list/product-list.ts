import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product';
import { CategoryService } from '../../../core/services/other';
import { ProductResponse, CategoryResponse, Page } from '../../../core/models';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StarRatingComponent, LoadingSpinnerComponent],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})
export class ProductListComponent implements OnInit {
  products: ProductResponse[] = [];
  categories: CategoryResponse[] = [];
  page: Page<ProductResponse> | null = null;
  loading = true;
  currentPage = 0;

  // Filtres
  searchQuery = '';
  selectedCategory: number | null = null;
  prixMin: number | null = null;
  prixMax: number | null = null;
  promoOnly = false;
  sortBy = 'dateCreation';

  // UI
  showFilters = false;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.categoryService.listerCategories().subscribe((c: CategoryResponse[]) => this.categories = c);
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.promoOnly = params['promo'] === 'true';
      if (params['category']) this.selectedCategory = Number(params['category']);
      this.currentPage = 0;
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.loading = true;

    // Recherche texte
    if (this.searchQuery) {
      this.productService.rechercher(this.searchQuery, this.currentPage)
        .pipe(timeout(15000))
        .subscribe({
          next: (p: Page<ProductResponse>) => { this.page = p; this.products = p.content; this.loading = false; this.cdr.detectChanges(); },
          error: () => { this.loading = false; this.cdr.detectChanges(); }
        });
      return;
    }

    // Filtres combinés
    const hasFilters = this.selectedCategory || this.prixMin || this.prixMax || this.promoOnly;
    if (hasFilters) {
      this.productService.filtrerProduits(
        this.selectedCategory,
        this.prixMin,
        this.prixMax,
        this.promoOnly,
        this.currentPage,
        this.sortBy
      ).pipe(timeout(15000)).subscribe({
        next: (p: Page<ProductResponse>) => { this.page = p; this.products = p.content; this.loading = false; this.cdr.detectChanges(); },
        error: () => { this.loading = false; this.cdr.detectChanges(); }
      });
      return;
    }

    // Tous les produits
    this.productService.listerProduits(this.currentPage, 12, this.sortBy)
      .pipe(timeout(15000))
      .subscribe({
        next: (p: Page<ProductResponse>) => { this.page = p; this.products = p.content; this.loading = false; this.cdr.detectChanges(); },
        error: () => { this.loading = false; this.cdr.detectChanges(); }
      });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  resetFilters(): void {
    this.selectedCategory = null;
    this.prixMin = null;
    this.prixMax = null;
    this.promoOnly = false;
    this.sortBy = 'dateCreation';
    this.currentPage = 0;
    this.loadProducts();
  }

  selectCategory(id: number | null): void {
    this.selectedCategory = id;
    this.currentPage = 0;
    this.loadProducts();
  }

  goPage(p: number): void {
    this.currentPage = p;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pages(): number[] {
    if (!this.page) return [];
    return Array.from({ length: this.page.totalPages }, (_, i) => i);
  }

  get hasActiveFilters(): boolean {
    return !!(this.selectedCategory || this.prixMin || this.prixMax || this.promoOnly);
  }

  get pageTitle(): string {
    if (this.promoOnly) return 'Promotions';
    if (this.searchQuery) return `Résultats pour "${this.searchQuery}"`;
    if (this.selectedCategory) {
      const cat = this.categories.find(c => c.id === this.selectedCategory);
      return cat ? cat.nom : 'Catalogue';
    }
    return 'Catalogue';
  }
}
