import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();
  private nextId = 0;

  private add(message: string, type: Toast['type']): void {
    const id = this.nextId++;
    const toasts = [...this.toastsSubject.value, { id, message, type }];
    this.toastsSubject.next(toasts);
    setTimeout(() => this.remove(id), 4000);
  }

  success(message: string): void { this.add(message, 'success'); }
  error(message: string): void { this.add(message, 'error'); }
  warning(message: string): void { this.add(message, 'warning'); }
  info(message: string): void { this.add(message, 'info'); }

  remove(id: number): void {
    this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
  }
}