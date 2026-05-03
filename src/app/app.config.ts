import { ApplicationConfig } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptorFn } from './core/interceptors/jwt-interceptor';
import { AuthGuard } from './core/guards/auth-guard';

import { HomeComponent } from './features/home/home';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password';
import { ProfileComponent } from './features/profile/profile';
import { ProductListComponent } from './features/products/product-list/product-list';
import { ProductDetailComponent } from './features/products/product-detail/product-detail';
import { ProductFormComponent } from './features/products/product-form/product-form';
import { CartComponent } from './features/cart/cart';
import { CheckoutComponent } from './features/orders/checkout/checkout';
import { OrderListComponent } from './features/orders/order-list/order-list';
import { OrderDetailComponent } from './features/orders/order-detail/order-detail';
import { AdminDashboardComponent } from './features/dashboard/admin-dashboard/admin-dashboard';
import { SellerDashboardComponent } from './features/dashboard/seller-dashboard/seller-dashboard';
import { ClientDashboardComponent } from './features/dashboard/client-dashboard/client-dashboard';
import { SellerOrdersComponent } from './features/dashboard/seller-orders/seller-orders';
import { SellerProductsComponent } from './features/dashboard/seller-products/seller-products';
import { CategoryManagerComponent } from './features/categories/category-manager/category-manager';
import { UserManagementComponent } from './features/admin/users/user-management';
import { ReviewModerationComponent } from './features/admin/reviews/review-moderation';
import { CouponManagementComponent } from './features/admin/coupons/coupon-management';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/forgot-password', component: ForgotPasswordComponent },
  { path: 'auth/reset-password', component: ResetPasswordComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard], data: { roles: ['CUSTOMER','SELLER','ADMIN'] } },
  { path: 'products', component: ProductListComponent },
  { path: 'products/new', component: ProductFormComponent, canActivate: [AuthGuard], data: { roles: ['SELLER','ADMIN'] } },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'products/:id/edit', component: ProductFormComponent, canActivate: [AuthGuard], data: { roles: ['SELLER','ADMIN'] } },
  { path: 'cart', component: CartComponent, canActivate: [AuthGuard], data: { roles: ['CUSTOMER'] } },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard], data: { roles: ['CUSTOMER'] } },
  { path: 'orders', component: OrderListComponent, canActivate: [AuthGuard], data: { roles: ['CUSTOMER','ADMIN'] } },
  { path: 'orders/:id', component: OrderDetailComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/admin', component: AdminDashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
  { path: 'dashboard/seller', component: SellerDashboardComponent, canActivate: [AuthGuard], data: { roles: ['SELLER'] } },
  { path: 'dashboard/client', component: ClientDashboardComponent, canActivate: [AuthGuard], data: { roles: ['CUSTOMER'] } },
  { path: 'seller/orders', component: SellerOrdersComponent, canActivate: [AuthGuard], data: { roles: ['SELLER'] } },
  { path: 'seller/products', component: SellerProductsComponent, canActivate: [AuthGuard], data: { roles: ['SELLER'] } },
  { path: 'categories', component: CategoryManagerComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/users', component: UserManagementComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/reviews', component: ReviewModerationComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/coupons', component: CouponManagementComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
  { path: '**', redirectTo: '' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([jwtInterceptorFn])
    ),
  ],
};
