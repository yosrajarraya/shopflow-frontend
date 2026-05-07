import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { jwtInterceptorFn } from 'src/interceptors/jwt.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TemplateComponent } from './template/template.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

// Features - Auth
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';

// Features - Products
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { ProductDetailComponent } from './features/products/product-detail/product-detail.component';
import { ProductFormComponent } from './features/products/product-form/product-form.component';

// Features - Cart & Orders
import { CartComponent } from './features/cart/cart.component';
import { CheckoutComponent } from './features/orders/checkout/checkout.component';
import { OrderListComponent } from './features/orders/order-list/order-list.component';
import { OrderDetailComponent } from './features/orders/order-detail/order-detail.component';

// Features - Dashboard
import { AdminDashboardComponent } from './features/dashboard/admin-dashboard/admin-dashboard.component';
import { SellerDashboardComponent } from './features/dashboard/seller-dashboard/seller-dashboard.component';
import { ClientDashboardComponent } from './features/dashboard/client-dashboard/client-dashboard.component';
import { SellerOrdersComponent } from './features/dashboard/seller-orders/seller-orders.component';
import { SellerProductsComponent } from './features/dashboard/seller-products/seller-products.component';

// Features - Categories & Admin
import { CategoryManagerComponent } from './features/categories/category-manager/category-manager.component';
import { UserManagementComponent } from './features/admin/users/user-management.component';
import { ReviewModerationComponent } from './features/admin/reviews/review-moderation.component';
import { CouponManagementComponent } from './features/admin/coupons/coupon-management.component';

// Features - Home & Profile
import { HomeComponent } from './features/home/home.component';
import { ProfileComponent } from './features/profile/profile.component';

// Shared Components
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { StarRatingComponent } from './shared/components/star-rating/star-rating.component';
import { ChartComponent } from './shared/components/chart/chart.component';

// Pipes
import { OrdersByStatusPipe } from './shared/pipes/orders-by-status-pipe';

// Services
import { AuthService } from 'src/services/auth.service';
import { OrderService } from 'src/services/order.service';
import { CartService } from 'src/services/cart.service';
import { CategoryService } from 'src/services/category.service';
import { CouponService } from 'src/services/coupon.service';
import { DashboardService } from 'src/services/dashboard.service';
import { ProductService } from 'src/services/product.service';
import { ProfileService } from 'src/services/profile.service';
import { ReviewService } from 'src/services/review.service';
import { ToastService } from 'src/services/toast.service';
import { UserService } from 'src/services/user.service';

@NgModule({
  declarations: [
    AppComponent,
    TemplateComponent,
    ConfirmDialogComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ProductListComponent,
    ProductDetailComponent,
    ProductFormComponent,
    CartComponent,
    CheckoutComponent,
    OrderListComponent,
    OrderDetailComponent,
    AdminDashboardComponent,
    SellerDashboardComponent,
    ClientDashboardComponent,
    SellerOrdersComponent,
    SellerProductsComponent,
    CategoryManagerComponent,
    UserManagementComponent,
    ReviewModerationComponent,
    CouponManagementComponent,
    HomeComponent,
    ProfileComponent,
    NavbarComponent,
    FooterComponent,
    ToastComponent,
    LoadingSpinnerComponent,
    StarRatingComponent,
    ChartComponent,
    OrdersByStatusPipe,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatDialogModule,
  ],
  providers: [
    provideHttpClient(
      withInterceptors([jwtInterceptorFn])
    ),
    AuthService,
    OrderService,
    CartService,
    CategoryService,
    CouponService,
    DashboardService,
    ProductService,
    ProfileService,
    ReviewService,
    ToastService,
    UserService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
