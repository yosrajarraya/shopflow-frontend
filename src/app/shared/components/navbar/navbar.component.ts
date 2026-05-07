import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from 'src/services/auth.service';
import { CartService } from 'src/services/cart.service';
import { AuthResponse } from 'src/Models/auth.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: false
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: AuthResponse | null = null;
  cartCount$;
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
  ) {
    this.cartCount$ = this.cartService.cartCount$;
  }

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.sub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user?.role === 'CUSTOMER') {
        this.cartService.refreshCartCount();
      }
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

  closeUserMenu(): void { this.userMenuOpen = false; }

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

  get isCatalogue(): boolean {
    return this.currentUrl.startsWith('/products') && !this.currentUrl.includes('promo=true');
  }

  get isPromo(): boolean {
    return this.currentUrl.includes('promo=true');
  }
}
