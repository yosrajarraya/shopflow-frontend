import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="stars">
      <span *ngFor="let s of starsArray; let i = index" class="star" [class.filled]="i < note" [class.half]="i === Math.floor(note) && note % 1 >= 0.5">★</span>
      <span class="note-label" *ngIf="showLabel">{{ note | number:'1.1-1' }}</span>
    </span>
  `,
  styles: [`
    .stars { display:inline-flex; align-items:center; gap:2px; }
    .star { font-size:1rem; color:var(--text-muted); transition:color var(--transition); }
    .star.filled { color:var(--accent); }
    .star.half { color:var(--accent-dark); }
    .note-label { font-size:0.78rem; color:var(--text-muted); margin-left:4px; }
  `]
})
export class StarRatingComponent {
  @Input() note: number = 0;
  @Input() showLabel = true;
  starsArray = [1,2,3,4,5];
  Math = Math;
}
