import { supabase } from './_lib/db.js'

const ALLOWED_ORIGINS = [
  'https://ayankonji.github.io',
  'http://localhost:5173',
  'http://localhost:3000',
]

function setCorsHeaders(res, origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  res.setHeader('Access-Control-Allow-Origin', allowed)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req, res) {
  const origin = req.headers.origin || ''
  setCorsHeaders(res, origin)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    const { category, search } = req.query
    let query = supabase.from('foods').select('*').order('created_at', { ascending: false })

    if (category && category !== '全部') {
      query = query.eq('category', category)
    }
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data, error } = await query
    if (error) {
      return res.status(500).json({ error: error.message })
    }
    return res.status(200).json({ data: data || [] })
  }

  if (req.method === 'POST') {
    const body = req.body || {}
    const { data, error } = await supabase
      .from('foods')
      .insert([{
        name: body.name,
        price: Number(body.price) || 0,
        calories: Number(body.calories) || 0,
        sweetness: Number(body.sweetness) || 0,
        spiciness: Number(body.spiciness) || 0,
        temperature: body.temperature || '常温',
        image: body.image || null,
        category: body.category || '其他',
        description: body.description || '',
      }])
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }
    return res.status(200).json({ data })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
