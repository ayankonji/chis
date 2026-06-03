// ============================================
// 抽卡概率算法模块
// Softmax注意力分数 + 品级划分 + 保底机制
// ============================================

// ---- 品级配置（含配色参数）----
export const TIER_CONFIG = {
  gold: {
    name: '金卡',
    label: 'SSR',
    borderColor: '#FFD700',
    borderShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
    gradient: 'linear-gradient(135deg, #FFD700, #FFA500)',
    particleColors: ['#FFD700', '#FFA500', '#FFEC8B'],
    bgClass: 'tier-gold',
  },
  silver: {
    name: '银卡',
    label: 'SR',
    borderColor: '#C0C0C0',
    borderShadow: '0 0 15px rgba(192, 192, 192, 0.4)',
    gradient: 'linear-gradient(135deg, #C0C0C0, #E8E8E8)',
    particleColors: ['#C0C0C0', '#E8E8E8', '#A8A8A8'],
    bgClass: 'tier-silver',
  },
  bronze: {
    name: '铜卡',
    label: 'R',
    borderColor: '#CD7F32',
    borderShadow: '0 0 10px rgba(205, 127, 50, 0.3)',
    gradient: 'linear-gradient(135deg, #CD7F32, #E8A862)',
    particleColors: ['#CD7F32', '#E8A862', '#8B5A2B'],
    bgClass: 'tier-bronze',
  },
}

// ---- Softmax温度参数 ----
const TEMPERATURE = 0.1

// ---- 特征权重 ----
const WEIGHTS = {
  price: 0.3,
  calories: 0.2,
  sweetness: 0.15,
  spiciness: 0.15,
  rarity: 0.2,
}

// ============================================
// Softmax核心计算
// ============================================

// 提取单道菜的特征分数
function extractScore(food, maxPrice, maxCalories) {
  const priceNorm = maxPrice > 0 ? (food.price || 0) / maxPrice : 0
  const calNorm = maxCalories > 0 ? (food.calories || 0) / maxCalories : 0
  const sweetness = (food.sweetness || 0) / 5
  const spiciness = (food.spiciness || 0) / 5

  // 稀有度因子：描述越长、越有特色的菜越稀有
  const descLen = (food.description || '').length
  const rarity = Math.min(descLen / 30, 1) // 归一化到 0-1

  return (
    WEIGHTS.price * priceNorm +
    WEIGHTS.calories * calNorm +
    WEIGHTS.sweetness * sweetness +
    WEIGHTS.spiciness * spiciness +
    WEIGHTS.rarity * rarity
  )
}

// Softmax函数
function softmax(scores, temperature = TEMPERATURE) {
  // 数值稳定性：减去最大值
  const maxScore = Math.max(...scores)
  const exps = scores.map(s => Math.exp((s - maxScore) * temperature))
  const sumExps = exps.reduce((a, b) => a + b, 0)
  return exps.map(e => e / sumExps)
}

// ============================================
// 品级划分（基于概率百分位）
// ============================================

function assignTiers(probabilities) {
  // 概率从低到高排序，低概率=稀有=金卡
  const sorted = [...probabilities].sort((a, b) => a - b)
  const n = sorted.length

  // P25 和 P75 分位点
  const p25 = sorted[Math.floor(n * 0.25)] || sorted[0]
  const p75 = sorted[Math.floor(n * 0.75)] || sorted[n - 1]

  return probabilities.map(p => {
    if (p <= p25) return 'gold'    // 最低25%概率 = 金卡（稀有）
    if (p <= p75) return 'silver'  // 中间50%概率 = 银卡（普通稀有）
    return 'bronze'                // 最高25%概率 = 铜卡（常见）
  })
}

// ============================================
// 主函数：计算全量概率分布 + 品级
// ============================================

export function calculateGachaDistribution(foods) {
  if (!foods || foods.length === 0) return []

  const maxPrice = Math.max(...foods.map(f => f.price || 0))
  const maxCalories = Math.max(...foods.map(f => f.calories || 0))

  // 1. 提取所有特征分数
  const scores = foods.map(f => extractScore(f, maxPrice, maxCalories))

  // 2. Softmax归一化为概率
  const probabilities = softmax(scores)

  // 3. 品级划分
  const tiers = assignTiers(probabilities)

  // 4. 组装结果
  return foods.map((food, i) => ({
    ...food,
    gacha_prob: probabilities[i],
    gacha_tier: tiers[i],
    gacha_score: scores[i],
    tier_config: TIER_CONFIG[tiers[i]],
  }))
}

// ============================================
// 保底抽卡逻辑
// ============================================

// 获取所有指定品级的食物
function getFoodsByTier(foods, tier) {
  return foods.filter(f => f.gacha_tier === tier)
}

// 按概率加权随机抽取（从指定品级池中）
function weightedRandomPick(foodPool) {
  const totalProb = foodPool.reduce((sum, f) => sum + f.gacha_prob, 0)
  let rand = Math.random() * totalProb
  for (const food of foodPool) {
    rand -= food.gacha_prob
    if (rand <= 0) return food
  }
  return foodPool[foodPool.length - 1]
}

// 主抽卡函数：带保底机制
export function performGacha(foodWithDist, pityData) {
  const pullsSinceSilver = pityData?.pulls_since_last_4star || 0
  const pullsSinceGold = pityData?.pulls_since_last_5star || 0

  let forcedTier = null

  // 保底判定：50抽未出金 → 强制金卡
  if (pullsSinceGold >= 49) {
    forcedTier = 'gold'
  }
  // 保底判定：10抽未出银卡及以上 → 强制银卡+
  else if (pullsSinceSilver >= 9) {
    // 40抽以上同时满足银卡保底，给金卡
    forcedTier = pullsSinceGold >= 39 ? 'gold' : 'silver'
  }

  let result

  if (forcedTier) {
    // 强制品级抽取
    const pool = getFoodsByTier(foodWithDist, forcedTier)
    result = pool.length > 0
      ? weightedRandomPick(pool)
      : foodWithDist[Math.floor(Math.random() * foodWithDist.length)]
  } else {
    // 正常概率抽取
    const rand = Math.random()
    let cumulative = 0
    result = foodWithDist[foodWithDist.length - 1]
    for (const food of foodWithDist) {
      cumulative += food.gacha_prob
      if (rand <= cumulative) {
        result = food
        break
      }
    }
  }

  // 计算新的保底计数
  const newPity = {
    pulls_since_last_4star: result.gacha_tier === 'bronze' ? pullsSinceSilver + 1 : 0,
    pulls_since_last_5star: result.gacha_tier === 'gold' ? 0 : pullsSinceGold + 1,
    total_pulls: (pityData?.total_pulls || 0) + 1,
  }

  return { result, newPity }
}

// ============================================
// 概率公示数据生成
// ============================================

export function generateProbabilityReport(foodWithDist, pityData) {
  // 按品级分组统计
  const tierStats = { gold: { foods: [], totalProb: 0 }, silver: { foods: [], totalProb: 0 }, bronze: { foods: [], totalProb: 0 } }
  for (const food of foodWithDist) {
    tierStats[food.gacha_tier].foods.push(food)
    tierStats[food.gacha_tier].totalProb += food.gacha_prob
  }

  // 品级区间说明
  const sorted = [...foodWithDist].sort((a, b) => a.gacha_prob - b.gacha_prob)
  const n = sorted.length
  const p25Prob = sorted[Math.floor(n * 0.25)]?.gacha_prob || 0
  const p75Prob = sorted[Math.floor(n * 0.75)]?.gacha_prob || 0

  return {
    foods: foodWithDist.sort((a, b) => a.gacha_prob - b.gacha_prob),
    tierStats,
    tierRanges: {
      gold: `≤ ${(p25Prob * 100).toFixed(2)}%`,
      silver: `${(p25Prob * 100).toFixed(2)}% ~ ${(p75Prob * 100).toFixed(2)}%`,
      bronze: `> ${(p75Prob * 100).toFixed(2)}%`,
    },
    pity: pityData || { pulls_since_last_4star: 0, pulls_since_last_5star: 0, total_pulls: 0 },
    formula: {
      description: '基于注意力分数的Softmax概率分布',
      steps: [
        '1. 提取美食特征：价格、热量、甜度、辣度、稀有度',
        '2. 加权求和得到注意力分数 score = Σ(wi × fi)',
        '3. Softmax归一化：prob = exp(score × T) / Σexp(score_j × T)',
        '4. 按概率百分位划分品级：低概率=金卡(稀有)，高概率=铜卡(常见)',
      ],
      temperature: TEMPERATURE,
      weights: WEIGHTS,
    },
  }
}
