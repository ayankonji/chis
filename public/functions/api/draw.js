import { getSupabaseConfig, supabaseHeaders, jsonResponse } from './_lib/supabase.js';

export async function onRequest(context) {
  const { request, env } = context;
  const origin = request.headers.get('origin') || '';
  const { url, key } = getSupabaseConfig(env);

  if (request.method === 'OPTIONS') {
    return jsonResponse({}, 200, origin);
  }

  const res = await fetch(`${url}/rest/v1/foods?select=*`, {
    headers: supabaseHeaders(key),
  });

  const data = await res.json();
  const foods = Array.isArray(data) ? data : [];

  if (foods.length === 0) {
    return jsonResponse({ data: null }, 200, origin);
  }

  const randomFood = foods[Math.floor(Math.random() * foods.length)];
  return jsonResponse({ data: randomFood }, 200, origin);
}
