const PUBLIC_DIR = new URL('../public/', import.meta.url);

const CONTENT_TYPES: Record<string, string> = {
    html: 'text/html; charset=utf-8',
    css: 'text/css; charset=utf-8',
    js: 'text/javascript; charset=utf-8',
};

export async function serveStatic(pathname: string): Promise<Response> {
    try {
        const relative = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
        const fileUrl = new URL(`.${relative}`, PUBLIC_DIR);

        if (!fileUrl.pathname.startsWith(PUBLIC_DIR.pathname)) {
            return Response.json({ error: 'Ruta no permitida' }, { status: 403 });
        }

        const extension = fileUrl.pathname.split('.').pop() ?? '';
        const body = await Deno.readFile(fileUrl);

        return new Response(body, {
            headers: { 'content-type': CONTENT_TYPES[extension] ?? 'application/octet-stream' },
        });
    }   catch {
        return Response.json({ error: 'No encontrado' }, { status: 404 });
    }
}