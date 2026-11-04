import { Order } from '../models/Order.ts';
import type { MenuItem } from '../models/MenuItem.ts';

export class OrderValidationError extends Error {
    constructor(public readonly errors: string[]) {
        super(errors.join(' | '));
        this.name = 'OrderValidationError';
    }
}

export class OrderBuilder {
    private customer?: string;
    private table?: number;
    private items: MenuItem[] = [];
    private notes?: string;

    setCustomer(name: string): this {
        this.customer = name.trim();
        return this;
    }

    setTable(table: number): this {
        this.table = table;
        return this;
    }

    addItem(item: MenuItem): this {
        this.items.push(item);
        return this;
    }

    setNotes(notes: string): this {
        const clean = notes.trim();
        this.notes = clean === '' ? undefined : clean;
        return this;
    }

    build(): Order {
        const errors: string[] = [];

        if (!this.customer) errors.push('El nombre del cliente es obligatorio');
        if (!Number.isInteger(this.table) || (this.table as number) < 1) {
        errors.push('La mesa debe ser un número entero mayor a 0');
        }
        if (this.items.length === 0) errors.push('El pedido debe tener al menos un plato');

        if (errors.length > 0) throw new OrderValidationError(errors);

        return new Order({
            id: crypto.randomUUID().slice(0, 8),
            customer: this.customer!,
            table: this.table!,
            items: [...this.items],
            notes: this.notes,
        });
    }
}