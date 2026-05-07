import { Component } from '@angular/core';
import { ToastService, Toast } from 'src/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  standalone: false
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
  trackById(_: number, t: Toast) { return t.id; }
}
