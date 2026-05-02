import { OrdersByStatusPipe } from './orders-by-status-pipe';

describe('OrdersByStatusPipe', () => {
  it('create an instance', () => {
    const pipe = new OrdersByStatusPipe();
    expect(pipe).toBeTruthy();
  });
});
