import { getSupabaseConfig, supabaseHeaders, jsonResponse } from './_lib/supabase.js';

export async function onRequest(context) {
  const { request, env } = context;
  const origin = request.headers.get('origin') || '';
  const { url, key } = getSupabaseConfig(env);

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return jsonResponse({}, 200, origin);
  }

  // GET /api/foods
  if (request.method === 'GET') {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let queryUrl = `${url}/rest/v1/foods?select=*&order=created_at.desc`;
    if (category && category !== '全部') {
      queryUrl += `&category=eq.${encodeURIComponent(category)}`;
    }
    if (search) {
      queryUrl += `&name=ilike.*${encodeURIComponent(search)}*`;
    }

    const res = await fetch(queryUrl, {
      headers: supabaseHeaders(key),
    });

    const data = await res.json();
    return jsonResponse({ data: Array.isArray(data) ? data : [] }, 200, origin);
  }

  // POST /api/foods
  if (request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const insertBody = {
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

    const res = await fetch(`${url}/rest/v1/foods`, {
      method: 'POST',
      headers: supabaseHeaders(key),
      body: JSON.stringify(insertBody),
    });

    const data = await res.json();
    return jsonResponse({ data: Array.isArray(data) ? data[0] : data }, res.status, origin);
  }

  return jsonResponse({ error: 'Method not allowed' }, 405, origin);
}
