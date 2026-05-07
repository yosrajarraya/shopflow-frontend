import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="spinner-wrapper">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    .spinner-wrapper {
      display: flex; justify-content: center; align-items: center;
      padding: 60px 24px;
    }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
  standalone: false
})
export class LoadingSpinnerComponent {}
