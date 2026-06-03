import { jsonResponse } from './_lib/supabase.js';

export async function onRequest(context) {
  const { request } = context;
  const origin = request.headers.get('origin') || '';
  return jsonResponse({ status: 'ok', service: 'chis-api' }, 200, origin);
}
