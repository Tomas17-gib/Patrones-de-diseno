import { OrderBuilder, OrderValidationError } from './builders/OrderBuilder.ts';
import { UnknownMenuKeyError, createMenuItem, getMenu } from './catalog.ts';
import type { ActivityLog, CustomerNotifier, KitchenDisplay } from './observers/observers.ts';
import {
    InvalidTransitionError,
    OrderNotFoundError,
    type OrderService,
} from './services/OrderService.ts';
import { serveStatic } from './static.ts';

// Lo que necesita la API para funcionar. Se lo entrega server.ts.
export interface AppDeps {
    service: OrderService;
    kitchen: KitchenDisplay;
    customer: CustomerNotifier;
    log: ActivityLog;
}

// Atajo para responder JSON
const json = (data: unknown, status = 200) => Response.json(data, { status });

/** Aquí se usan Builder + Decorator (a través del catálogo). */
interface OrderRequest {
    customer?: string;
    table?: number | string;
    notes?: string;
    items?: { dish: string; extras?: string[] }[];
}

function buildOrderFromBody(body: OrderRequest) {
    const builder = new OrderBuilder()
        .setCustomer(String(body?.customer ?? ''))
        .setTable(Number(body?.table))
        .setNotes(String(body?.notes ?? ''));

    for (const entry of body?.items ?? []) {
        builder.addItem(createMenuItem(String(entry.dish), (entry.extras ?? []).map(String)));
    }

    return builder.build();
}

/** Convierte los errores del negocio en respuestas HTTP. */
function errorResponse(error: unknown): Response {
    if (error instanceof OrderValidationError) return json({ errors: error.errors }, 400);
    if (error instanceof UnknownMenuKeyError) return json({ errors: [error.message] }, 400);
    if (error instanceof OrderNotFoundError) return json({ errors: [error.message] }, 404);
    if (error instanceof InvalidTransitionError) return json({ errors: [error.message] }, 409);
    if (error instanceof SyntaxError) return json({ errors: ['El cuerpo debe ser un JSON válido'] }, 400);

    console.error(error);
    return json({ errors: ['Error interno del servidor'] }, 500);
}

export function createHandler({ service, kitchen, customer, log }: AppDeps) {
    return async (req: Request): Promise<Response> => {
        const { pathname } = new URL(req.url);
        const { method } = req;

        try {
            if (method === 'GET' && pathname === '/api/menu') {
                return json(getMenu());
            }

            if (method === 'GET' && pathname === '/api/orders') {
                return json(service.list());
            }

            if (method === 'POST' && pathname === '/api/orders') {
                const order = service.create(buildOrderFromBody(await req.json()));
                return json(order, 201);
            }

            const advance = pathname.match(/^\/api\/orders\/([\w-]+)\/advance$/);
            if (method === 'POST' && advance) {
                return json(service.advance(advance[1]));
            }

            if (method === 'GET' && pathname === '/api/activity') {
                return json({
                    kitchen: kitchen.getTickets(),
                    customer: customer.getMessages(),
                    log: log.getEntries(),
                });
            }

            if (method === 'GET' && !pathname.startsWith('/api/')) {
                return await serveStatic(pathname);
            }

            return json({ error: 'No encontrado' }, 404);
        }   catch (error) {
            return errorResponse(error);
        }
    };
}