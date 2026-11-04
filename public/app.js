const $ = (id) => document.getElementById(id);
const money = (n) => '$ ' + n.toLocaleString('es-CO');

// Aqui Evita que lo que escribe el usuario se interprete como HTML
const esc = (text) =>
    String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const NEXT_BUTTON = {
    recibido: 'Empezar a preparar',
    preparando: 'Marcar como listo',
    listo: 'Marcar como entregado',
};

let menu = { dishes: [], extras: [] };
let cart = [];

// Llama a la API y lanza un error si la respuesta no es exitosa
async function api(path, options) {
    const res = await fetch(path, options);
    const data = await res.json();
    if (!res.ok) throw new Error((data.errors ?? [data.error]).join('\n'));
    return data;
}

// ---------- Menú ----------

function showMenu() {
    $('dish').innerHTML = menu.dishes
        .map((d) => `<option value="${d.key}">${d.label} - ${money(d.price)}</option>`)
        .join('');

    $('extras').innerHTML = menu.extras
        .map((e) => `<label><input type="checkbox" value="${e.key}"> ${e.label} (+${money(e.price)})</label>`)
        .join('');
}

// ---------- Carrito ----------

function showCart() {
    $('cart').innerHTML = cart
        .map((line, i) => `<li><span>${line.text} - ${money(line.price)}</span><button type="button" data-index="${i}">Quitar</button></li>`)
        .join('');

    $('cart-total').textContent = money(cart.reduce((sum, line) => sum + line.price, 0));
}

$('add-item').onclick = () => {
    const dish = menu.dishes.find((d) => d.key === $('dish').value);
    const checked = [...$('extras').querySelectorAll('input:checked')];
    const extras = checked.map((input) => menu.extras.find((e) => e.key === input.value));

    cart.push({
        dish: dish.key,
        extras: extras.map((e) => e.key),
        text: [dish.label, ...extras.map((e) => e.label)].join(' + '),
        price: dish.price + extras.reduce((sum, e) => sum + e.price, 0),
    });

    checked.forEach((input) => (input.checked = false));
    showCart();
};

$('cart').onclick = (event) => {
    const index = event.target.dataset.index;
    if (index === undefined) return;
    cart.splice(index, 1);
    showCart();
};

// ---------- Enviar pedido ----------

$('order-form').onsubmit = async (event) => {
    event.preventDefault();
    $('form-error').hidden = true;

    try {
        await api('/api/orders', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                customer: $('customer').value,
                table: $('table').value,
                notes: $('notes').value,
                items: cart.map(({ dish, extras }) => ({ dish, extras })),
            }),
        });

        cart = [];
        $('order-form').reset();
        showCart();
        await refresh();
    } catch (error) {
        $('form-error').textContent = error.message;
        $('form-error').hidden = false;
    }
};

// ---------- Pedidos ----------

function showOrders(orders) {
    if (orders.length === 0) {
        $('orders').innerHTML = '<p class="empty">Aún no hay pedidos.</p>';
        return;
    }

    $('orders').innerHTML = orders
        .map(
        (o) => `
        <article class="order">
            <header>
            <strong>#${o.id} - Mesa ${o.table} - ${esc(o.customer)}</strong>
            <span class="badge ${o.status}">${o.status}</span>
            </header>
            <ul>${o.items.map((i) => `<li>${i.description} - ${money(i.price)}</li>`).join('')}</ul>
            ${o.notes ? `<p class="meta">Notas: ${esc(o.notes)}</p>` : ''}
            <p class="meta">Total: ${money(o.total)}</p>
            ${NEXT_BUTTON[o.status] ? `<button class="small" data-id="${o.id}">${NEXT_BUTTON[o.status]}</button>` : ''}
        </article>`
    )
    .join('');
}

$('orders').onclick = async (event) => {
    const id = event.target.dataset.id;
    if (!id) return;

    try {
        await api(`/api/orders/${id}/advance`, { method: 'POST' });
        await refresh();
    } catch (error) {
        alert(error.message);
    }
};

// ---------- Paneles de los observadores ----------

function showList(id, entries) {
  // Más recientes primero
    $(id).innerHTML = [...entries].reverse().map((text) => `<li>${esc(text)}</li>`).join('');
}

async function refresh() {
    const orders = await api('/api/orders');
    const activity = await api('/api/activity');

    showOrders(orders);
    showList('kitchen', activity.kitchen);
    showList('customer-msgs', activity.customer);
    showList('log', activity.log);
}

// ---------- Inicio ----------

async function start() {
    menu = await api('/api/menu');
    showMenu();
    showCart();
    await refresh();
    setInterval(refresh, 4000); // se actualiza solo cada 4 segundos
}

start();