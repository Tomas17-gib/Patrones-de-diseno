const PORT = 8000;

Deno.serve({ port: PORT }, () => new Response('Restaurante funcionando'));