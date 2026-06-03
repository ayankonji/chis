import { getSupabaseConfig, supabaseHeaders, jsonResponse } from '../_lib/supabase.js';

export async function onRequest(context) {
  const { request, env } = context;
  const origin = request.headers.get('origin') || '';
  const { url, key } = getSupabaseConfig(env);
  const id = new URL(request.url).pathname.split('/').pop();

  if (request.method === 'OPTIONS') {
    return jsonResponse({}, 200, origin);
  }

  // GET /api/foods/:id
  if (request.method === 'GET') {
    const res = await fetch(`${url}/rest/v1/foods?id=eq.${id}&select=*`, {
      headers: supabaseHeaders(key),
    });
    const data = await res.json();
    return jsonResponse({ data: Array.isArray(data) && data.length > 0 ? data[0] : null }, 200, origin);
  }

  // PUT /api/foods/:id
  if (request.method === 'PUT') {
    const body = await request.json().catch(() => ({}));
    const updates = {
      name: body.name,
      price: Number(body.price) || 0,
      calories: Number(body.calories) || 0,
      sweetness: Number(body.sweetness) || 0,
      spiciness: Number(body.spiciness) || 0,
      temperature: body.temperature || '常温',
      image: body.image || null,
      category: body.category || '其他',
      description: body.description || '',
    };

    const res = await fetch(`${url}/rest/v1/foods?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...supabaseHeaders(key), 'Prefer': 'return=representation' },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    return jsonResponse({ data: Array.isArray(data) && data.length > 0 ? data[0] : data }, res.status, origin);
  }

  // DELETE /api/foods/:id
  if (request.method === 'DELETE') {
    const res = await fetch(`${url}/rest/v1/foods?id=eq.${id}`, {
      method: 'DELETE',
      headers: supabaseHeaders(key),
    });
    return jsonResponse({ data: { deleted: true } }, 200, origin);
  }

  return jsonResponse({ error: 'Method not allowed' }, 405, origin);
}
