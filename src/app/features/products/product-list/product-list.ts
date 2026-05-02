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
  searchQuery = '';
  selectedCategory: number | null = null;
  promoOnly = false;

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
      this.currentPage = 0;
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.loading = true;
    const obs = this.promoOnly
      ? this.productService.promos(this.currentPage)
      : this.searchQuery
        ? this.productService.rechercher(this.searchQuery, this.currentPage)
        : this.productService.listerProduits(this.currentPage);

    obs.pipe(timeout(15000)).subscribe({
      next: (p: Page<ProductResponse>) => {
        this.page = p;
        this.products = p.content;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Products load error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(): void {
    this.router.navigate([], { queryParams: { q: this.searchQuery || null }, queryParamsHandling: 'merge' });
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
}
