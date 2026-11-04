import { BaseDish } from './models/BaseDish.ts';
import type { MenuItem } from './models/MenuItem.ts';
import { ExtraBacon, ExtraCheese, ExtraEgg, ExtraGuacamole } from './decorators/extras.ts';

export class UnknownMenuKeyError extends Error {
    constructor(kind: 'plato' | 'extra', key: string) {
        super(`No existe el ${kind} "${key}"`);
        this.name = 'UnknownMenuKeyError';
    }
}

type ExtraClass = {
    new (item: MenuItem): MenuItem;
    readonly LABEL: string;
    readonly PRICE: number;
};

export const DISHES: Record<string, { label: string; price: number }> = {
    hamburguesa: { label: 'Hamburguesa', price: 18000 },
    perro: { label: 'Perro caliente', price: 12000 },
    pizza: { label: 'Pizza personal', price: 20000 },
    ensalada: { label: 'Ensalada', price: 14000 },
};

export const EXTRAS: Record<string, ExtraClass> = {
    queso: ExtraCheese,
    tocineta: ExtraBacon,
    huevo: ExtraEgg,
    guacamole: ExtraGuacamole,
};

export function getMenu() {
    return {
        dishes: Object.entries(DISHES).map(([key, { label, price }]) => ({ key, label, price })),
        extras: Object.entries(EXTRAS).map(([key, extra]) => ({
        key,
            label: extra.LABEL,
            price: extra.PRICE,
        })),
    };
}

export function createMenuItem(dishKey: string, extraKeys: string[] = []): MenuItem {
    const dish = DISHES[dishKey];
    if (!dish) throw new UnknownMenuKeyError('plato', dishKey);

    let item: MenuItem = new BaseDish(dish.label, dish.price);

    for (const key of extraKeys) {
        const Extra = EXTRAS[key];
        if (!Extra) throw new UnknownMenuKeyError('extra', key);
        item = new Extra(item);
    }

    return item;
}