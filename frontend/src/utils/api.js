// ============================================
// API 配置 - 强制使用 Vercel 后端
// ============================================
const API_BASE = 'https://chis-api.vercel.app';

// ============================================
// API 函数
// ============================================

export async function fetchFoods(category = '全部', search = '') {
  const params = new URLSearchParams();
  if (category && category !== '全部') params.append('category', category);
  if (search) params.append('search', search);
  const res = await fetch(`${API_BASE}/api/foods?${params}`);
  if (!res.ok) throw new Error('Failed to fetch foods');
  const data = await res.json();
  return data.data || [];
}

export async function fetchFood(id) {
  const res = await fetch(`${API_BASE}/api/foods/${id}`);
  if (!res.ok) throw new Error('Failed to fetch food');
  const data = await res.json();
  return data.data || null;
}

export async function createFood(foodData) {
  const res = await fetch(`${API_BASE}/api/foods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(foodData)
  });
  if (!res.ok) throw new Error('Failed to create food');
  const data = await res.json();
  return data.data;
}

export async function editFood(id, foodData) {
  const res = await fetch(`${API_BASE}/api/foods/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(foodData)
  });
  if (!res.ok) throw new Error('Failed to edit food');
  const data = await res.json();
  return data.data;
}

export async function removeFood(id) {
  const res = await fetch(`${API_BASE}/api/foods/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete food');
  return true;
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/api/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  const data = await res.json();
  return ['全部', ...(data.data || [])];
}

export async function drawRandomFood() {
  const res = await fetch(`${API_BASE}/api/draw`);
  if (!res.ok) throw new Error('Failed to draw');
  const data = await res.json();
  return data.data || null;
}
