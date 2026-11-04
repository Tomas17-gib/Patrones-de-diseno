import type { OrderEvent, OrderObserver } from './OrderObserver.ts';

type Print = (message: string) => void;

/** Pantalla de la cocina: solo le importan los pedidos nuevos. */
export class KitchenDisplay implements OrderObserver {
    private tickets: string[] = [];

    constructor(private readonly print: Print = console.log) {}

    update(event: OrderEvent): void {
        if (event.type !== 'created') return;

        const { order } = event;
        const dishes = order.items.map((item) => item.getDescription()).join('; ');
        const notes = order.notes ? ` (Notas: ${order.notes})` : '';
        const ticket = `Mesa ${order.table} · #${order.id}: ${dishes}${notes}`;

        this.tickets.push(ticket);
        this.print(`[COCINA] Nuevo pedido -> ${ticket}`);
    }

    getTickets(): string[] {
        return [...this.tickets];
    }
    }

    /** Avisos al cliente: le importan los cambios de estado. */
    export class CustomerNotifier implements OrderObserver {
        private messages: string[] = [];

        constructor(private readonly print: Print = console.log) {}

        update(event: OrderEvent): void {
            const { order } = event;
            let message: string | null = null;

            if (event.type === 'created') {
            message = `Hola ${order.customer}, recibimos tu pedido #${order.id}.`;
            } else if (order.status === 'preparando') {
            message = `${order.customer}, tu pedido #${order.id} ya se está preparando.`;
            } else if (order.status === 'listo') {
            message = `${order.customer}, tu pedido #${order.id} está listo.`;
            } else if (order.status === 'entregado') {
            message = `${order.customer}, tu pedido #${order.id} fue entregado. ¡Buen provecho!`;
            }

            if (message) {
            this.messages.push(message);
            this.print(`[CLIENTE] ${message}`);
            }
        }

        getMessages(): string[] {
            return [...this.messages];
        }
    }

    /** Bitácora: registra absolutamente todo. */
    export class ActivityLog implements OrderObserver {
    private entries: string[] = [];

    update(event: OrderEvent): void {
        const { order } = event;
        const time = new Date().toLocaleTimeString('es-CO');

        if (event.type === 'created') {
        this.entries.push(`${time} · Pedido #${order.id} creado (mesa ${order.table})`);
        return;
        }

        this.entries.push(`${time} · Pedido #${order.id}: ${event.previous} → ${order.status}`);
    }

    getEntries(): string[] {
        return [...this.entries];
    }
}