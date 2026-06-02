import { supabase } from './_lib/db.js'

const ALLOWED_ORIGINS = [
  'https://ayankonji.github.io',
  'http://localhost:5173',
  'http://localhost:3000',
]

function setCorsHeaders(res, origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  res.setHeader('Access-Control-Allow-Origin', allowed)
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req, res) {
  const origin = req.headers.origin || ''
  setCorsHeaders(res, origin)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('foods')
      .select('category')

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    const categories = [...new Set((data || []).map(f => f.category))].sort()
    return res.status(200).json({ data: categories })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
