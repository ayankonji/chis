const sampleFoods = [
  {
    id: 1,
    name: '红烧肉',
    price: 38,
    calories: 520,
    sweetness: 1,
    spiciness: 0,
    temperature: '热',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
    category: '中餐',
    description: '肥而不腻，入口即化的经典家常菜'
  },
  {
    id: 2,
    name: '麻婆豆腐',
    price: 22,
    calories: 280,
    sweetness: 0,
    spiciness: 4,
    temperature: '热',
    image: 'https://images.unsplash.com/photo-1582576163090-09d3b6f8a969?w=600&h=400&fit=crop',
    category: '中餐',
    description: '麻辣鲜香，下饭神器'
  },
  {
    id: 3,
    name: '草莓蛋糕',
    price: 28,
    calories: 350,
    sweetness: 5,
    spiciness: 0,
    temperature: '冰',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=400&fit=crop',
    category: '甜点',
    description: '绵软细腻，甜而不腻'
  },
  {
    id: 4,
    name: '日式拉面',
    price: 35,
    calories: 480,
    sweetness: 0,
    spiciness: 1,
    temperature: '热',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop',
    category: '日料',
    description: '浓郁骨汤，劲道面条'
  },
  {
    id: 5,
    name: '水果沙拉',
    price: 25,
    calories: 120,
    sweetness: 3,
    spiciness: 0,
    temperature: '冰',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
    category: '轻食',
    description: '新鲜水果，健康低脂'
  },
  {
    id: 6,
    name: '炸鸡排',
    price: 18,
    calories: 450,
    sweetness: 0,
    spiciness: 2,
    temperature: '热',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&h=400&fit=crop',
    category: '快餐',
    description: '外酥里嫩，香气四溢'
  },
  {
    id: 7,
    name: '珍珠奶茶',
    price: 15,
    calories: 280,
    sweetness: 4,
    spiciness: 0,
    temperature: '冰',
    image: 'https://images.unsplash.com/photo-1558855410-3112e335e629?w=600&h=400&fit=crop',
    category: '饮品',
    description: 'Q弹珍珠，丝滑奶茶'
  },
  {
    id: 8,
    name: '麻辣火锅',
    price: 88,
    calories: 800,
    sweetness: 0,
    spiciness: 5,
    temperature: '热',
    image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&h=400&fit=crop',
    category: '中餐',
    description: '麻辣鲜香，聚餐首选'
  },
  {
    id: 9,
    name: '意大利面',
    price: 42,
    calories: 420,
    sweetness: 1,
    spiciness: 0,
    temperature: '热',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop',
    category: '西餐',
    description: '经典番茄肉酱意面'
  },
  {
    id: 10,
    name: '寿司拼盘',
    price: 68,
    calories: 320,
    sweetness: 1,
    spiciness: 0,
    temperature: '常温',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop',
    category: '日料',
    description: '新鲜食材，精致呈现'
  },
  {
    id: 11,
    name: '烤肉拌饭',
    price: 32,
    calories: 580,
    sweetness: 1,
    spiciness: 2,
    temperature: '热',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=400&fit=crop',
    category: '韩料',
    description: '炭火烤肉，粒粒飘香'
  },
  {
    id: 12,
    name: '芒果冰沙',
    price: 22,
    calories: 200,
    sweetness: 5,
    spiciness: 0,
    temperature: '冰',
    image: 'https://images.unsplash.com/photo-1516559828984-fb3b99548b21?w=600&h=400&fit=crop',
    category: '饮品',
    description: '清甜芒果，冰爽解暑'
  },
  {
    id: 13,
    name: '清蒸鲈鱼',
    price: 58,
    calories: 220,
    sweetness: 0,
    spiciness: 0,
    temperature: '热',
    image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&h=400&fit=crop',
    category: '中餐',
    description: '鲜嫩可口，营养丰富'
  },
  {
    id: 14,
    name: '牛排',
    price: 98,
    calories: 600,
    sweetness: 0,
    spiciness: 0,
    temperature: '热',
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&h=400&fit=crop',
    category: '西餐',
    description: '外焦里嫩，汁水丰盈'
  },
  {
    id: 15,
    name: '冬阴功汤',
    price: 45,
    calories: 180,
    sweetness: 1,
    spiciness: 3,
    temperature: '热',
    image: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=600&h=400&fit=crop',
    category: '泰料',
    description: '酸辣开胃，异域风情'
  },
  {
    id: 16,
    name: '抹茶拿铁',
    price: 24,
    calories: 150,
    sweetness: 3,
    spiciness: 0,
    temperature: '热',
    image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600&h=400&fit=crop',
    category: '饮品',
    description: '日式抹茶，香醇顺滑'
  }
];

export function getSampleData() {
  const stored = localStorage.getItem('chis_foods');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return sampleFoods;
    }
  }
  localStorage.setItem('chis_foods', JSON.stringify(sampleFoods));
  return sampleFoods;
}

export function saveFoods(foods) {
  localStorage.setItem('chis_foods', JSON.stringify(foods));
}

export function addFood(food) {
  const foods = getSampleData();
  const newFood = { ...food, id: Date.now() };
  foods.unshift(newFood);
  saveFoods(foods);
  return newFood;
}

export function updateFood(id, updates) {
  const foods = getSampleData();
  const idx = foods.findIndex(f => f.id === id || f.id === Number(id));
  if (idx >= 0) {
    foods[idx] = { ...foods[idx], ...updates };
    saveFoods(foods);
    return foods[idx];
  }
  return null;
}

export function deleteFood(id) {
  const foods = getSampleData();
  const filtered = foods.filter(f => f.id !== id && f.id !== Number(id));
  saveFoods(filtered);
  return filtered.length < foods.length;
}

export function getCategories() {
  const foods = getSampleData();
  const cats = [...new Set(foods.map(f => f.category))];
  return ['全部', ...cats.sort()];
}

export function getRandomFood() {
  const foods = getSampleData();
  if (foods.length === 0) return null;
  return foods[Math.floor(Math.random() * foods.length)];
}

export { sampleFoods };
