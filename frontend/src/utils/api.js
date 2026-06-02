import { getSampleData, addFood, updateFood, deleteFood, getCategories, getRandomFood } from './sampleData';

const API_BASE = '';
let useBackend = false;

// 检测后端是否可用
async function checkBackend() {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { method: 'GET', signal: AbortSignal.timeout(2000) });
    useBackend = res.ok;
    return useBackend;
  } catch {
    useBackend = false;
    return false;
  }
}

// 初始化时检测一次
checkBackend();

export async function fetchFoods(category = '全部', search = '') {
  if (useBackend) {
    try {
      const params = new URLSearchParams();
      if (category && category !== '全部') params.append('category', category);
      if (search) params.append('search', search);
      const res = await fetch(`${API_BASE}/api/foods?${params}`);
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
  if (useBackend) {
    try {
      const res = await fetch(`${API_BASE}/api/foods/${id}`);
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
  if (useBackend) {
    try {
      const formData = new FormData();
      Object.entries(foodData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value);
      });
      const res = await fetch(`${API_BASE}/api/foods`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Backend error');
      const data = await res.json();
      return { ...foodData, id: data.data.id };
    } catch {
      useBackend = false;
    }
  }
  return addFood(foodData);
}

export async function editFood(id, foodData) {
  if (useBackend) {
    try {
      const formData = new FormData();
      Object.entries(foodData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value);
      });
      const res = await fetch(`${API_BASE}/api/foods/${id}`, { method: 'PUT', body: formData });
      if (!res.ok) throw new Error('Backend error');
      return foodData;
    } catch {
      useBackend = false;
    }
  }
  return updateFood(id, foodData);
}

export async function removeFood(id) {
  if (useBackend) {
    try {
      const res = await fetch(`${API_BASE}/api/foods/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Backend error');
      return true;
    } catch {
      useBackend = false;
    }
  }
  return deleteFood(id);
}

export async function fetchCategories() {
  if (useBackend) {
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
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
  if (useBackend) {
    try {
      const res = await fetch(`${API_BASE}/api/draw`);
      if (!res.ok) throw new Error('Backend error');
      const data = await res.json();
      return data.data;
    } catch {
      useBackend = false;
    }
  }
  return getRandomFood();
}
