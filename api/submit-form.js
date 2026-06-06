export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(request.url);
    const formType = url.searchParams.get('type') || 'unknown'; // 'feedback' or 'contact'

    const data = await request.json();
    
    // Generate a unique ID (timestamp + random string)
    const id = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 7);
    
    // Attach server-side timestamp
    data.timestamp = new Date().toISOString();
    data.type = formType;
    
    // Save to KV with a prefix based on form type
    const key = `${formType}:${id}`;
    
    // Ensure the FORMS_DB KV namespace is bound
    if (!env.FORMS_DB) {
      console.error('FORMS_DB KV namespace is not bound to the worker.');
      return new Response(JSON.stringify({ error: 'Server misconfiguration: KV namespace missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await env.FORMS_DB.put(key, JSON.stringify(data));
    
    return new Response(JSON.stringify({ success: true, id, type: formType }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Error storing form submission:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
