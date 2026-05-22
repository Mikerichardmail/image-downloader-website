export async function onRequest(context) {
  const { request } = context;
  const urlObj = new URL(request.url);
  const targetUrlStr = urlObj.searchParams.get('url');

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Handle CORS Preflight request
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers
    });
  }

  if (!targetUrlStr) {
    return new Response(JSON.stringify({ error: 'URL parameter is required.' }), {
      status: 400,
      headers
    });
  }

  try {
    let cleanUrlStr = targetUrlStr.trim();
    if (!/^https?:\/\//i.test(cleanUrlStr)) {
      cleanUrlStr = 'http://' + cleanUrlStr;
    }
    
    const targetUrl = new URL(cleanUrlStr);
    
    const response = await fetch(targetUrl.href, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Failed to fetch target webpage. HTTP Status: ${response.status}` }), {
        status: 502,
        headers
      });
    }

    const html = await response.text();
    const images = [];
    const seenUrls = new Set();

    // Extract page title for UI contexts
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : targetUrl.hostname;

    const addImage = (src, alt = '', type = 'inline') => {
      if (!src) return;
      try {
        const absoluteUrl = new URL(src, targetUrl.href).href;
        if (!seenUrls.has(absoluteUrl) && !absoluteUrl.startsWith('data:image/')) {
          seenUrls.add(absoluteUrl);
          
          // Try to guess file extension or use general category
          let fileExtension = 'jpg';
          try {
            const pathOnly = absoluteUrl.split('?')[0].split('#')[0];
            const ext = pathOnly.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'ico'].includes(ext)) {
              fileExtension = ext === 'jpeg' ? 'jpg' : ext;
            }
          } catch(e) {}

          images.push({
            url: absoluteUrl,
            alt: alt.trim(),
            ext: fileExtension,
            sourceType: type
          });
        }
      } catch (e) {
        // Skip invalid URL creations
      }
    };

    // 1. Extract standard <img src="..."> tags
    const imgTagRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = imgTagRegex.exec(html)) !== null) {
      const tagContent = match[0];
      const src = match[1];
      const altMatch = tagContent.match(/alt=["']([^"']*)["']/i);
      const alt = altMatch ? altMatch[1] : '';
      addImage(src, alt, 'standard-img');
    }

    // 2. Extract lazy-loaded images (common src attributes like data-src, data-original, etc.)
    const lazySrcAttributes = ['data-src', 'data-original', 'data-lazy', 'data-lazy-src', 'zoom-src'];
    for (const attr of lazySrcAttributes) {
      const lazyRegex = new RegExp(`<img[^>]+${attr}=["']([^"']+)["'][^>]*>`, 'gi');
      while ((match = lazyRegex.exec(html)) !== null) {
        const tagContent = match[0];
        const src = match[1];
        const altMatch = tagContent.match(/alt=["']([^"']*)["']/i);
        const alt = altMatch ? altMatch[1] : '';
        addImage(src, alt, 'lazy-img');
      }
    }

    // 3. Extract Open Graph image (og:image)
    const ogImageRegex = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi;
    while ((match = ogImageRegex.exec(html)) !== null) {
      addImage(match[1], 'Social Preview Image', 'og-meta');
    }
    const ogImageRegexAlt = /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/gi;
    while ((match = ogImageRegexAlt.exec(html)) !== null) {
      addImage(match[1], 'Social Preview Image', 'og-meta');
    }

    // 4. Extract CSS background images (inline styles or general background: url() matches)
    const bgUrlRegex = /url\(["']?([^'")\s]+)["']?\)/gi;
    while ((match = bgUrlRegex.exec(html)) !== null) {
      addImage(match[1], 'CSS Background Image', 'css-bg');
    }

    return new Response(JSON.stringify({ title, images }), {
      status: 200,
      headers
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: `Invalid URL format or DNS error: ${error.message}` }), {
      status: 400,
      headers
    });
  }
}
