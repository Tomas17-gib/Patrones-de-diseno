import type { MenuItem } from './MenuItem.ts';

export type OrderStatus = 'recibido' | 'preparando' | 'listo' | 'entregado';

export interface OrderProps {
    id: string;
    customer: string;
    table: number;
    items: MenuItem[];
    notes?: string;
}

export class Order {
    readonly id: string;
    readonly customer: string;
    readonly table: number;
    readonly items: readonly MenuItem[];
    readonly notes?: string;
    readonly createdAt = new Date();

    private _status: OrderStatus = 'recibido';

    constructor({ id, customer, table, items, notes }: OrderProps) {
        this.id = id;
        this.customer = customer;
        this.table = table;
        this.items = items;
        this.notes = notes;
    }

    get status(): OrderStatus {
        return this._status;
    }

    setStatus(status: OrderStatus): void {
        this._status = status;
    }

    getTotal(): number {
        return this.items.reduce((sum, item) => sum + item.getPrice(), 0);
    }

    toJSON() {
        return {
            id: this.id,
            customer: this.customer,
            table: this.table,
            notes: this.notes ?? null,
            status: this._status,
            createdAt: this.createdAt.toISOString(),
            items: this.items.map((item) => ({
                name: item.getName(),
                description: item.getDescription(),
                price: item.getPrice(),
            })),
            total: this.getTotal(),
        };
    }
}