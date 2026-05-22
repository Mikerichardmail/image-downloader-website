export async function onRequest(context) {
  const { request } = context;
  const urlObj = new URL(request.url);
  const targetUrlStr = urlObj.searchParams.get('url');

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (!targetUrlStr) {
    return new Response(JSON.stringify({ error: 'URL parameter is required.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const targetUrl = new URL(targetUrlStr);
    
    // Fetch the image resource
    const response = await fetch(targetUrl.href, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/*'
      }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Proxy failed to load image. Status: ${response.status}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const contentType = response.headers.get('Content-Type') || 'image/jpeg';
    
    // Forward the image binary data with CORS enabled
    return new Response(response.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400' // cache for 1 day
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: `Proxy connection error: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
