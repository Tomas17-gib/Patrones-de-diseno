import { createHandler } from './src/app.ts';
import { OrderService } from './src/services/OrderService.ts';
import { ActivityLog, CustomerNotifier, KitchenDisplay } from './src/observers/observers.ts';

/**
 * Raíz de composición: el ÚNICO archivo que conoce todas las piezas concretas
 * y las conecta. El resto del código solo depende de interfaces.
 */
const service = new OrderService();
const kitchen = new KitchenDisplay();
const customer = new CustomerNotifier();
const log = new ActivityLog();

// Suscribimos los observadores. Para sumar otro (correo, WhatsApp...) basta
// crear la clase y agregar una línea aquí.
service.subscribe(kitchen);
service.subscribe(customer);
service.subscribe(log);

const PORT = 8000;

Deno.serve({ port: PORT }, createHandler({ service, kitchen, customer, log }));
console.log(`Restaurante listo en http://localhost:${PORT}`);