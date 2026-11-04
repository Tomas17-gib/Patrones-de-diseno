import type { MenuItem } from './MenuItem.ts';

export class BaseDish implements MenuItem {
    constructor(
    private readonly name: string,
    private readonly price: number
    ) {}

    getName(): string {
    return this.name;
    }

    getDescription(): string {
    return this.name;
    }

    getPrice(): number {
    return this.price;
    }
}