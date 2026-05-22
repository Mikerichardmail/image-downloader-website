import { onRequest as extractRequest } from '../functions/api/extract.js';
import { onRequest as proxyRequest } from '../functions/api/proxy.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API Routes mapping
    if (url.pathname === '/api/extract') {
      return extractRequest({ request, env, params: {}, next: () => {} });
    }
    if (url.pathname === '/api/proxy') {
      return proxyRequest({ request, env, params: {}, next: () => {} });
    }

    // Default: Fallback to static assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
