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
// 美食 API
// ============================================

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

// 无条件获取全量食物（用于品级重算和缓存）
export async function fetchAllFoods() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/foods?select=*&order=created_at.desc`, { headers })
  if (!res.ok) throw new Error('Failed to fetch all foods')
  return await res.json()
}

export async function fetchFood(id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/foods?id=eq.${id}&select=*`, { headers })
  if (!res.ok) throw new Error('Failed to fetch food')
  const data = await res.json()
  return data[0] || null
}

export async function createFood(foodData) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/foods`, {
    method: 'POST',
    headers,
    body: JSON.stringify(foodData)
  })
  if (!res.ok) {
    const errText = await res.text()
    console.error('createFood 失败:', res.status, errText)
    throw new Error(`Failed to create food: ${res.status} ${errText}`)
  }
  const data = await res.json()
  return data[0] || data
}

export async function editFood(id, foodData) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/foods?id=eq.${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(foodData)
  })
  if (!res.ok) {
    const errText = await res.text()
    console.error('editFood 失败:', res.status, errText)
    throw new Error(`Failed to edit food: ${res.status}`)
  }
  const data = await res.json()
  return data[0] || data
}

export async function removeFood(id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/foods?id=eq.${id}`, {
    method: 'DELETE',
    headers
  })
  if (!res.ok) throw new Error('Failed to delete food')
  return true
}

export async function fetchCategories() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/foods?select=category&order=category`, { headers })
  if (!res.ok) throw new Error('Failed to fetch categories')
  const data = await res.json()
  const unique = [...new Set(data.map(f => f.category).filter(Boolean))]
  return ['全部', ...unique]
}

// 检查同名美食是否已存在（问题5：重复检测）
export async function checkFoodExists(name) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/foods?name=eq.${encodeURIComponent(name)}&select=id,name`,
    { headers }
  )
  if (!res.ok) return []
  return await res.json()
}

// ============================================
// 管理员配置 API（明文密码）
// ============================================

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

export async function fetchPity(deviceId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/pity?device_id=eq.${encodeURIComponent(deviceId)}&select=*`,
    { headers }
  )
  if (!res.ok) return null
  const data = await res.json()
  return data[0] || null
}

export async function updatePity(deviceId, pityData) {
  const body = {
    device_id: deviceId,
    device_name: pityData.device_name || '匿名用户',
    pulls_since_last_4star: pityData.pulls_since_last_4star || 0,
    pulls_since_last_5star: pityData.pulls_since_last_5star || 0,
    total_pulls: pityData.total_pulls || 0,
    updated_at: new Date().toISOString(),
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/pity`, {
    method: 'POST',
    headers: {
      ...headers,
      'Prefer': 'resolution=merge-duplicates,return=representation'
    },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const errText = await res.text()
    console.error('updatePity 失败:', res.status, errText)
    throw new Error('Failed to update pity')
  }
  const data = await res.json()
  return data[0] || data
}

// ============================================
// 抽卡记录 API
// ============================================

export async function createDrawLog(logData) {
  const body = {
    device_id: logData.device_id,
    device_name: logData.device_name || '匿名用户',
    food_id: logData.food_id || null,
    food_name: logData.food_name || '',
    tier: logData.tier || 'bronze',
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/draw_log`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const errText = await res.text()
    console.error('createDrawLog 失败:', res.status, errText)
    throw new Error(`Failed to create draw log: ${res.status}`)
  }
  const data = await res.json()
  return data[0] || data
}

export async function fetchDrawLogs(deviceId, limit = 20) {
  const params = new URLSearchParams()
  params.append('select', '*')
  params.append('device_id', `eq.${deviceId}`)
  params.append('order', 'drawn_at.desc')
  params.append('limit', String(limit))
  const res = await fetch(`${SUPABASE_URL}/rest/v1/draw_log?${params}`, { headers })
  if (!res.ok) {
    console.error('fetchDrawLogs 失败:', res.status)
    return []
  }
  return await res.json()
}
