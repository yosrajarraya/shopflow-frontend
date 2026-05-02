import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth';
import { CartService } from '../../../core/services/other';
import { AuthResponse } from '../../../core/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: AuthResponse | null = null;
  cartCount = 0;
  scrolled = false;
  menuOpen = false;
  userMenuOpen = false;
  currentUrl = '';
  private sub!: Subscription;
  private routerSub!: Subscription;

  constructor(
    public authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.sub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user?.role === 'CUSTOMER') this.loadCartCount();
      else this.cartCount = 0;
    });
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.currentUrl = e.urlAfterRedirects;
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); this.routerSub?.unsubscribe(); }

  @HostListener('window:scroll')
  onScroll(): void { this.scrolled = window.scrollY > 30; }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('.user-menu')) this.userMenuOpen = false;
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }

  loadCartCount(): void {
    this.cartService.voirPanier().subscribe(
      cart => this.cartCount = cart.lignes?.length || 0,
      () => this.cartCount = 0
    );
  }

  logout(): void {
    this.closeUserMenu();
    this.authService.logout();
  }

  get dashboardRoute(): string {
    if (this.currentUser?.role === 'ADMIN') return '/dashboard/admin';
    if (this.currentUser?.role === 'SELLER') return '/dashboard/seller';
    if (this.currentUser?.role === 'CUSTOMER') return '/dashboard/client';
    return '/';
  }

  /** Catalogue actif = /products SANS ?promo=true */
  get isCatalogue(): boolean {
    return this.currentUrl.startsWith('/products') && !this.currentUrl.includes('promo=true');
  }

  /** Promotions actif = /products?promo=true */
  get isPromo(): boolean {
    return this.currentUrl.includes('promo=true');
  }
}
