import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent implements OnInit {
  title = 'ShopFlow';
  isLogin = false;

  private readonly authPaths = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.isLogin = this.authPaths.some(p => (e.urlAfterRedirects as string).startsWith(p));
      });
  }
}
