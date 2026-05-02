import { Pipe, PipeTransform } from '@angular/core';
import { OrderResponse, OrderStatus } from '../../core/models';

@Pipe({
  name: 'ordersByStatus',
  standalone: true
})
export class OrdersByStatusPipe implements PipeTransform {
  transform(orders: OrderResponse[], status: OrderStatus | 'ALL'): number {
    if (status === 'ALL') return orders.length;
    return orders.filter(o => o.statut === status).length;
  }
}
