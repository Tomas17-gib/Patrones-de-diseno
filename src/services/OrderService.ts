import type { Order, OrderStatus } from '../models/Order.ts';
import type { OrderEvent, OrderObserver } from '../observers/OrderObserver.ts';

export class OrderNotFoundError extends Error {
    constructor(id: string) {
        super(`No existe el pedido #${id}`);
        this.name = 'OrderNotFoundError';
    }
}

export class InvalidTransitionError extends Error {
    constructor(id: string, status: OrderStatus) {
        super(`El pedido #${id} ya está en estado final (${status})`);
        this.name = 'InvalidTransitionError';
    }
}

const FLOW: OrderStatus[] = ['recibido', 'preparando', 'listo', 'entregado'];

export class OrderService {
    private orders = new Map<string, Order>();
    private observers = new Set<OrderObserver>();

    subscribe(observer: OrderObserver): () => void {
        this.observers.add(observer);
        return () => this.unsubscribe(observer);
    }

    unsubscribe(observer: OrderObserver): void {
        this.observers.delete(observer);
    }

    create(order: Order): Order {
        this.orders.set(order.id, order);
        this.notify({ type: 'created', order });
        return order;
    }

    advance(id: string): Order {
        const order = this.orders.get(id);
        if (!order) throw new OrderNotFoundError(id);

        const previous = order.status;
        const next = FLOW[FLOW.indexOf(previous) + 1];
        if (!next) throw new InvalidTransitionError(id, previous);

        order.setStatus(next);
        this.notify({ type: 'status_changed', order, previous });
        return order;
    }

    list(): Order[] {
        return [...this.orders.values()].reverse();
    }

    private notify(event: OrderEvent): void {
        for (const observer of this.observers) {
            try {
                observer.update(event);
            } catch (error) {
                console.error('Un observador falló:', error);
            }
        }
    }
}