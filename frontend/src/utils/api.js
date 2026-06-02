import { getSampleData, addFood, updateFood, deleteFood, getCategories, getRandomFood } from './sampleData';

// ============================================
// API 配置
// ============================================
// 部署到 Vercel 后，把下面的空字符串改成你的 Vercel 域名：
// 例如：const API_BASE = 'https://chis-api.vercel.app';
//
// 本地开发时保持为空字符串，会自动使用本地代理
const API_BASE = '';

let useBackend = false;

// 检测后端是否可用
async function checkBackend() {
  const base = API_BASE || '';
  try {
    const res = await fetch(`${base}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    useBackend = res.ok;
    return useBackend;
  } catch {
    useBackend = false;
    return false;
  }
}

// 初始化时检测一次
checkBackend();

// ============================================
// API 函数
// ============================================

export async function fetchFoods(category = '全部', search = '') {
  const base = API_BASE || '';
  if (useBackend) {
    try {
      const params = new URLSearchParams();
      if (category && category !== '全部') params.append('category', category);
      if (search) params.append('search', search);
      const res = await fetch(`${base}/api/foods?${params}`);
      if (!res.ok) throw new Error('Backend error');
      const data = await res.json();
      return data.data;
    } catch {
      useBackend = false;
    }
  }
  let foods = getSampleData();
  if (category && category !== '全部') {
    foods = foods.filter(f => f.category === category);
  }
  if (search) {
    foods = foods.filter(f => f.name.includes(search));
  }
  return foods;
}

export async function fetchFood(id) {
  const base = API_BASE || '';
  if (useBackend) {
    try {
      const res = await fetch(`${base}/api/foods/${id}`);
      if (!res.ok) throw new Error('Backend error');
      const data = await res.json();
      return data.data;
    } catch {
      useBackend = false;
    }
  }
  const foods = getSampleData();
  return foods.find(f => f.id === Number(id)) || null;
}

export async function createFood(foodData) {
  const base = API_BASE || '';
  if (useBackend) {
    try {
      const res = await fetch(`${base}/api/foods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodData)
      });
      if (!res.ok) throw new Error('Backend error');
      const data = await res.json();
      return data.data;
    } catch {
      useBackend = false;
    }
  }
  return addFood(foodData);
}

export async function editFood(id, foodData) {
  const base = API_BASE || '';
  if (useBackend) {
    try {
      const res = await fetch(`${base}/api/foods/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodData)
      });
      if (!res.ok) throw new Error('Backend error');
      const data = await res.json();
      return data.data;
    } catch {
      useBackend = false;
    }
  }
  return updateFood(id, foodData);
}

export async function removeFood(id) {
  const base = API_BASE || '';
  if (useBackend) {
    try {
      const res = await fetch(`${base}/api/foods/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Backend error');
      return true;
    } catch {
      useBackend = false;
    }
  }
  return deleteFood(id);
}

export async function fetchCategories() {
  const base = API_BASE || '';
  if (useBackend) {
    try {
      const res = await fetch(`${base}/api/categories`);
      if (!res.ok) throw new Error('Backend error');
      const data = await res.json();
      return ['全部', ...data.data];
    } catch {
      useBackend = false;
    }
  }
  return getCategories();
}

export async function drawRandomFood() {
  const base = API_BASE || '';
  if (useBackend) {
    try {
      const res = await fetch(`${base}/api/draw`);
      if (!res.ok) throw new Error('Backend error');
      const data = await res.json();
      return data.data;
    } catch {
      useBackend = false;
    }
  }
  return getRandomFood();
}
