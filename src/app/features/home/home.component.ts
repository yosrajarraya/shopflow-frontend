import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from 'src/services/product.service';
import { CategoryService } from 'src/services/category.service';
import { CategoryResponse } from 'src/Models/category.model';
import { HomeStats } from 'src/Models/home-stats.model';
import { ProductResponse } from 'src/Models/product.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: false
})
export class HomeComponent implements OnInit {
  topProducts: ProductResponse[] = [];
  promoProducts: ProductResponse[] = [];
  categories: CategoryResponse[] = [];
  homeStats: HomeStats | null = null;
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
    this.productService.statistiquesAccueil().subscribe({
      next: stats => this.homeStats = stats
    });
  }

  search(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { queryParams: { q: this.searchQuery } });
    }
  }
}
