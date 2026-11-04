import type { Order, OrderStatus } from '../models/Order.ts';

export type OrderEvent =
    | { type: 'created'; order: Order }
    | { type: 'status_changed'; order: Order; previous: OrderStatus };

export interface OrderObserver {
    update(event: OrderEvent): void;
}