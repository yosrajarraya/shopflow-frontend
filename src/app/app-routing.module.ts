import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from 'src/guards/auth.guard';

import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { ProfileComponent } from './features/profile/profile.component';
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { ProductDetailComponent } from './features/products/product-detail/product-detail.component';
import { ProductFormComponent } from './features/products/product-form/product-form.component';
import { CartComponent } from './features/cart/cart.component';
import { CheckoutComponent } from './features/orders/checkout/checkout.component';
import { OrderListComponent } from './features/orders/order-list/order-list.component';
import { OrderDetailComponent } from './features/orders/order-detail/order-detail.component';
import { AdminDashboardComponent } from './features/dashboard/admin-dashboard/admin-dashboard.component';
import { SellerDashboardComponent } from './features/dashboard/seller-dashboard/seller-dashboard.component';
import { ClientDashboardComponent } from './features/dashboard/client-dashboard/client-dashboard.component';
import { SellerOrdersComponent } from './features/dashboard/seller-orders/seller-orders.component';
import { SellerProductsComponent } from './features/dashboard/seller-products/seller-products.component';
import { CategoryManagerComponent } from './features/categories/category-manager/category-manager.component';
import { UserManagementComponent } from './features/admin/users/user-management.component';
import { ReviewModerationComponent } from './features/admin/reviews/review-moderation.component';
import { CouponManagementComponent } from './features/admin/coupons/coupon-management.component';

// l'ordre intervient dans la résolution des routes
const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent, pathMatch: 'full' },
  { path: 'auth/register', component: RegisterComponent, pathMatch: 'full' },
  { path: 'auth/forgot-password', component: ForgotPasswordComponent, pathMatch: 'full' },
  { path: 'auth/reset-password', component: ResetPasswordComponent, pathMatch: 'full' },
  { path: 'profile', component: ProfileComponent, pathMatch: 'full', canActivate: [authGuard], data: { roles: ['CUSTOMER','SELLER','ADMIN'] } },
  { path: 'products', component: ProductListComponent, pathMatch: 'full' },
  { path: 'products/new', component: ProductFormComponent, pathMatch: 'full', canActivate: [authGuard], data: { roles: ['SELLER','ADMIN'] } },
  { path: 'products/:id', component: ProductDetailComponent, pathMatch: 'full' },
  { path: 'products/:id/edit', component: ProductFormComponent, pathMatch: 'full', canActivate: [authGuard], data: { roles: ['SELLER','ADMIN'] } },
  { path: 'cart', component: CartComponent, pathMatch: 'full', canActivate: [authGuard], data: { roles: ['CUSTOMER'] } },
  { path: 'checkout', component: CheckoutComponent, pathMatch: 'full', canActivate: [authGuard], data: { roles: ['CUSTOMER'] } },
  { path: 'orders', component: OrderListComponent, pathMatch: 'full', canActivate: [authGuard], data: { roles: ['CUSTOMER','ADMIN'] } },
  { path: 'orders/:id', component: OrderDetailComponent, pathMatch: 'full', canActivate: [authGuard] },
  { path: 'dashboard/admin', component: AdminDashboardComponent, pathMatch: 'full', canActivate: [authGuard], data: { roles: ['ADMIN'] } },
  { path: 'dashboard/seller', component: SellerDashboardComponent, pathMatch: 'full', canActivate: [authGuard], data: { roles: ['SELLER'] } },
  { path: 'dashboard/client', component: ClientDashboardComponent, pathMatch: 'full', canActivate: [authGuard], data: { roles: ['CUSTOMER'] } },
  { path: 'seller/orders', component: SellerOrdersComponent, pathMatch: 'full', canActivate: [authGuard], data: { roles: ['SELLER'] } },
  { path: 'seller/products', component: SellerProductsComponent, pathMatch: 'full', canActivate: [authGuard], data: { roles: ['SELLER'] } },
  { path: 'categories', component: CategoryManagerComponent, pathMatch: 'full', canActivate: [authGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/users', component: UserManagementComponent, pathMatch: 'full', canActivate: [authGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/reviews', component: ReviewModerationComponent, pathMatch: 'full', canActivate: [authGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/coupons', component: CouponManagementComponent, pathMatch: 'full', canActivate: [authGuard], data: { roles: ['ADMIN'] } },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
