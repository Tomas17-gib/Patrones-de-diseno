import type { MenuItem } from '../models/MenuItem.ts';

export abstract class ItemDecorator implements MenuItem {
    constructor(protected readonly item: MenuItem) {}

    getName(): string {
        return this.item.getName();
    }

    getDescription(): string {
        return this.item.getDescription();
    }

    getPrice(): number {
        return this.item.getPrice();
    }
}