// ============================================
// API 配置 - 直连 Supabase（无需后端中间层）
// ============================================
const SUPABASE_URL = 'https://maaaelaazykudvguqkby.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYWFlbGFhenlrdWR2Z3Vxa2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MTAzNjksImV4cCI6MjA5NTk4NjM2OX0.krxmTZmiNOW3nLEIIDnXB2TZALIhdrA5u8gvaWVI1ms'

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
}

// ============================================
// API 函数 - 使用 Supabase REST API (PostgREST)
// ============================================

// 获取所有美食（支持分类筛选和搜索）
export async function fetchFoods(category = '全部', search = '') {
  const params = new URLSearchParams()
  params.append('select', '*')
  params.append('order', 'created_at.desc')
  if (category && category !== '全部') {
    params.append('category', `eq.${category}`)
  }
  if (search) {
    params.append('or', `(name.ilike.%${search}%,description.ilike.%${search}%)`)
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/foods?${params}`, { headers })
  if (!res.ok) throw new Error('Failed to fetch foods')
  return await res.json()
}

// 获取单个美食
export async function fetchFood(id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/foods?id=eq.${id}&select=*`, { headers })
  if (!res.ok) throw new Error('Failed to fetch food')
  const data = await res.json()
  return data[0] || null
}

// 创建美食
export async function createFood(foodData) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/foods`, {
    method: 'POST',
    headers,
    body: JSON.stringify(foodData)
  })
  if (!res.ok) throw new Error('Failed to create food')
  const data = await res.json()
  return data[0] || data
}

// 编辑美食
export async function editFood(id, foodData) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/foods?id=eq.${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(foodData)
  })
  if (!res.ok) throw new Error('Failed to edit food')
  const data = await res.json()
  return data[0] || data
}

// 删除美食
export async function removeFood(id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/foods?id=eq.${id}`, {
    method: 'DELETE',
    headers
  })
  if (!res.ok) throw new Error('Failed to delete food')
  return true
}

// 获取分类列表（从数据中提取去重的分类）
export async function fetchCategories() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/foods?select=category&order=category`, { headers })
  if (!res.ok) throw new Error('Failed to fetch categories')
  const data = await res.json()
  const unique = [...new Set(data.map(f => f.category).filter(Boolean))]
  return ['全部', ...unique]
}

// ============================================
// 管理员配置 API
// ============================================

// 获取管理员配置（按用户名查询）
export async function fetchAdminConfig(username) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/admin_config?username=eq.${encodeURIComponent(username)}&select=*`,
    { headers }
  )
  if (!res.ok) throw new Error('Failed to fetch admin config')
  return await res.json()
}

// ============================================
// 保底计数 API
// ============================================

// 获取保底计数
export async function fetchPity(deviceId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/pity?device_id=eq.${encodeURIComponent(deviceId)}&select=*`,
    { headers }
  )
  if (!res.ok) return null
  const data = await res.json()
  return data[0] || null
}

// 更新保底计数（upsert：存在则更新，不存在则插入）
export async function updatePity(deviceId, pityData) {
  const body = {
    device_id: deviceId,
    ...pityData,
    updated_at: new Date().toISOString(),
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/pity`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error('Failed to update pity')
  const data = await res.json()
  return data[0] || data
}

// ============================================
// 抽卡 API（全量读取 + 概率计算由前端 gacha.js 处理）
// ============================================

export async function drawGachaFood() {
  const foods = await fetchFoods()
  if (!foods || foods.length === 0) return null
  return foods
}
