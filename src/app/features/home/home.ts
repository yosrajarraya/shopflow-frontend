import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product';
import { CategoryService } from '../../core/services/other';
import { ProductResponse, CategoryResponse } from '../../core/models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  topProducts: ProductResponse[] = [];
  promoProducts: ProductResponse[] = [];
  categories: CategoryResponse[] = [];
  searchQuery = '';
  loading = true;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productService.topVentes().subscribe({
      next: p => { this.topProducts = p.slice(0, 8); this.loading = false; },
      error: () => this.loading = false
    });
    this.productService.promos().subscribe({
      next: p => this.promoProducts = p.content.slice(0, 4)
    });
    this.categoryService.listerCategories().subscribe({
      next: c => this.categories = c.slice(0, 8)
    });
  }

  search(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { queryParams: { q: this.searchQuery } });
    }
  }
}
