import { getSupabaseConfig, supabaseHeaders, jsonResponse } from './_lib/supabase.js';

export async function onRequest(context) {
  const { request, env } = context;
  const origin = request.headers.get('origin') || '';
  const { url, key } = getSupabaseConfig(env);

  if (request.method === 'OPTIONS') {
    return jsonResponse({}, 200, origin);
  }

  const res = await fetch(`${url}/rest/v1/foods?select=category`, {
    headers: supabaseHeaders(key),
  });

  const data = await res.json();
  const foods = Array.isArray(data) ? data : [];
  const cats = [...new Set(foods.map(f => f.category).filter(Boolean))];
  return jsonResponse({ data: cats.sort() }, 200, origin);
}
