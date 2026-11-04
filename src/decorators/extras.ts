import { ItemDecorator } from './ItemDecorator.ts';

export class ExtraCheese extends ItemDecorator {
    static readonly LABEL = 'Queso extra';
    static readonly PRICE = 3000;

    override getDescription(): string {
        return `${super.getDescription()} + ${ExtraCheese.LABEL}`;
    }

    override getPrice(): number {
        return super.getPrice() + ExtraCheese.PRICE;
    }
}

export class ExtraBacon extends ItemDecorator {
    static readonly LABEL = 'Tocineta';
    static readonly PRICE = 4000;

    override getDescription(): string {
        return `${super.getDescription()} + ${ExtraBacon.LABEL}`;
    }

    override getPrice(): number {
        return super.getPrice() + ExtraBacon.PRICE;
    }
}

export class ExtraEgg extends ItemDecorator {
    static readonly LABEL = 'Huevo';
    static readonly PRICE = 2500;

    override getDescription(): string {
        return `${super.getDescription()} + ${ExtraEgg.LABEL}`;
    }

    override getPrice(): number {
        return super.getPrice() + ExtraEgg.PRICE;
    }
}

export class ExtraGuacamole extends ItemDecorator {
    static readonly LABEL = 'Guacamole';
    static readonly PRICE = 3500;

    override getDescription(): string {
        return `${super.getDescription()} + ${ExtraGuacamole.LABEL}`;
    }

    override getPrice(): number {
        return super.getPrice() + ExtraGuacamole.PRICE;
    }
}