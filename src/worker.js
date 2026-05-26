import { onRequest as extractRequest } from '../api/extract.js';
import { onRequest as proxyRequest } from '../api/proxy.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    let response;

    // API Routes mapping & static assets fallback
    if (url.pathname === '/api/extract') {
      response = await extractRequest({ request, env, params: {}, next: () => {} });
    } else if (url.pathname === '/api/proxy') {
      response = await proxyRequest({ request, env, params: {}, next: () => {} });
    } else if (env.ASSETS) {
      response = await env.ASSETS.fetch(request);
    } else {
      response = new Response('Not Found', { status: 404 });
    }

    // Clone response to make headers mutable
    const newResponse = new Response(response.body, response);
    const contentType = newResponse.headers.get('content-type');

    if (contentType) {
      const isText = /^(text\/html|text\/css|application\/javascript|application\/json|image\/svg\+xml)/i.test(contentType);
      if (isText && !contentType.toLowerCase().includes('charset')) {
        newResponse.headers.set('content-type', `${contentType}; charset=utf-8`);
      }
    }

    return newResponse;
  }
};
