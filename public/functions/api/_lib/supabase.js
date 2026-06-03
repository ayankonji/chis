// Supabase REST API helper for Edge Functions

const ALLOWED_ORIGINS = [
  'https://ayankonji.github.io',
  'http://localhost:5173',
  'http://localhost:3000',
];

export function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

export function getSupabaseConfig(env) {
  return {
    url: env.SUPABASE_URL,
    key: env.SUPABASE_ANON_KEY,
  };
}

export function supabaseHeaders(key) {
  return {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };
}

export async function jsonResponse(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(origin),
  });
}
