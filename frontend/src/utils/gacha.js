// ============================================
// 抽卡概率算法模块
// Softmax注意力分数 + 品级划分 + 保底机制
//
// 核心逻辑：
//   - score 越高（价格高/热量大）→ 品级越高（金卡）
//   - 概率用 softmax(-score) 归一化 → score高的概率低（稀有难抽中）
//   - 品级按 score 排名 1:3:6 分配（金:银:铜）
//   - 数据库 gacha_tier 字段优先，仅当缺失时用算法兜底
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

/**
 * 提取美食的综合评分（score 越高 = 越贵/越高热量 = 越稀有）
 */
function extractScore(food, maxPrice, maxCalories) {
  const priceNorm = maxPrice > 0 ? (food.price || 0) / maxPrice : 0
  const calNorm = maxCalories > 0 ? (food.calories || 0) / maxCalories : 0
  const sweetness = (food.sweetness || 0) / 5
  const spiciness = (food.spiciness || 0) / 5
  const descLen = (food.description || '').length
  const rarity = Math.min(descLen / 30, 1)
  return (
    WEIGHTS.price * priceNorm +
    WEIGHTS.calories * calNorm +
    WEIGHTS.sweetness * sweetness +
    WEIGHTS.spiciness * spiciness +
    WEIGHTS.rarity * rarity
  )
}

/**
 * Softmax 归一化
 * @param {number[]} scores - 输入分数
 * @param {boolean} invert - 是否翻转（true = -score，让高分食物概率低）
 */
function softmax(scores, temperature = TEMPERATURE, invert = false) {
  const s = invert ? scores.map(v => -v) : scores
  const maxScore = Math.max(...s)
  const exps = s.map(v => Math.exp((v - maxScore) * temperature))
  const sumExps = exps.reduce((a, b) => a + b, 0)
  return exps.map(e => e / sumExps)
}

// ============================================
// 品级划分（按 score 排名，1:3:6 比例）
// score 越高 → 金卡（稀有）
// ============================================

/**
 * 按 score 从高到低排序，按 1:3:6 分配品级
 * @param {number[]} scores - 各食物的综合评分
 * @returns {string[]} 品级数组 ['gold', 'silver', 'bronze', ...]
 */
function assignTiers(scores) {
  const n = scores.length
  if (n === 0) return []

  // 创建 [index, score] 并按 score 降序排列
  const indexed = scores.map((s, i) => ({ index: i, score: s }))
  indexed.sort((a, b) => b.score - a.score)

  // 按 1:3:6 比例计算各品级数量
  const goldCount = Math.max(1, Math.round(n * 0.1))
  const silverCount = Math.max(1, Math.round(n * 0.3))
  // 剩下的全给铜卡

  const tiers = new Array(n)
  for (let i = 0; i < n; i++) {
    const rank = i // 0-based 排名（score 最高的排第0）
    if (rank < goldCount) {
      tiers[indexed[i].index] = 'gold'
    } else if (rank < goldCount + silverCount) {
      tiers[indexed[i].index] = 'silver'
    } else {
      tiers[indexed[i].index] = 'bronze'
    }
  }

  return tiers
}

// ============================================
// 主函数：计算全量概率分布 + 品级
// 优先使用数据库中的 gacha_tier 字段
// ============================================

export function calculateGachaDistribution(foods) {
  if (!foods || foods.length === 0) return []

  const maxPrice = Math.max(...foods.map(f => f.price || 0))
  const maxCalories = Math.max(...foods.map(f => f.calories || 0))

  const scores = foods.map(f => extractScore(f, maxPrice, maxCalories))

  // 翻转 score 做 Softmax：score 高 → -score 低 → 概率低
  const probabilities = softmax(scores, TEMPERATURE, true)

  // 检查数据库是否已有品级（不是全部默认 bronze）
  const hasDbTiers = foods.some(f => f.gacha_tier && f.gacha_tier !== 'bronze')

  // 如果数据库没有品级数据，用算法兜底（按 score 排名分配）
  const tiers = hasDbTiers
    ? foods.map(f => f.gacha_tier || 'bronze')
    : assignTiers(scores)

  return foods.map((food, i) => ({
    ...food,
    gacha_prob: probabilities[i],
    gacha_tier: tiers[i],
    gacha_score: scores[i],
    tier_config: TIER_CONFIG[tiers[i]],
  }))
}

// ============================================
// 品级重算并写回数据库
// 每次增删改食物后调用
// ============================================

/**
 * 重新计算所有食物的品级和概率，并PATCH回数据库
 * @param {Function} fetchFoodsFn - 获取全量食物的函数
 * @param {Function} editFoodFn - 更新单个食物的函数
 */
export async function recalculateAndSaveTiers(fetchFoodsFn, editFoodFn) {
  try {
    const foods = await fetchFoodsFn()
    if (!foods || foods.length === 0) return

    const maxPrice = Math.max(...foods.map(f => f.price || 0))
    const maxCalories = Math.max(...foods.map(f => f.calories || 0))

    const scores = foods.map(f => extractScore(f, maxPrice, maxCalories))
    const probabilities = softmax(scores, TEMPERATURE, true)
    const tiers = assignTiers(scores)

    // 批量 PATCH 每个食物的品级和概率
    const updates = foods.map((food, i) =>
      editFoodFn(food.id, {
        gacha_tier: tiers[i],
        gacha_prob: probabilities[i],
      })
    )

    await Promise.allSettled(updates)
    console.log('[gacha] 品级重算完成：', {
      total: foods.length,
      gold: tiers.filter(t => t === 'gold').length,
      silver: tiers.filter(t => t === 'silver').length,
      bronze: tiers.filter(t => t === 'bronze').length,
    })
  } catch (e) {
    console.error('[gacha] 品级重算失败:', e)
  }
}

// ============================================
// 保底抽卡逻辑
// ============================================

function getFoodsByTier(foods, tier) {
  return foods.filter(f => f.gacha_tier === tier)
}

function weightedRandomPick(foodPool) {
  const totalProb = foodPool.reduce((sum, f) => sum + f.gacha_prob, 0)
  let rand = Math.random() * totalProb
  for (const food of foodPool) {
    rand -= food.gacha_prob
    if (rand <= 0) return food
  }
  return foodPool[foodPool.length - 1]
}

export function performGacha(foodWithDist, pityData) {
  const pullsSinceSilver = pityData?.pulls_since_last_4star || 0
  const pullsSinceGold = pityData?.pulls_since_last_5star || 0

  let forcedTier = null

  if (pullsSinceGold >= 49) {
    forcedTier = 'gold'
  } else if (pullsSinceSilver >= 9) {
    forcedTier = pullsSinceGold >= 39 ? 'gold' : 'silver'
  }

  let result

  if (forcedTier) {
    const pool = getFoodsByTier(foodWithDist, forcedTier)
    result = pool.length > 0
      ? weightedRandomPick(pool)
      : foodWithDist[Math.floor(Math.random() * foodWithDist.length)]
  } else {
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
  const tierStats = { gold: { foods: [], totalProb: 0 }, silver: { foods: [], totalProb: 0 }, bronze: { foods: [], totalProb: 0 } }
  for (const food of foodWithDist) {
    tierStats[food.gacha_tier].foods.push(food)
    tierStats[food.gacha_tier].totalProb += food.gacha_prob
  }

  return {
    foods: [...foodWithDist].sort((a, b) => b.gacha_score - a.gacha_score),
    tierStats,
    tierRanges: {
      gold: 'Score 排名前 ~10%',
      silver: 'Score 排名 10%~40%',
      bronze: 'Score 排名 40%~100%',
    },
    pity: pityData || { pulls_since_last_4star: 0, pulls_since_last_5star: 0, total_pulls: 0 },
    formula: {
      description: '基于注意力分数的Softmax概率分布（高分稀有）',
      steps: [
        '1. 提取美食特征：价格、热量、甜度、辣度、稀有度',
        '2. 加权求和得到综合评分 score = Σ(wi × fi)',
        '3. 评分越高 → 品级越高（金卡最稀有，铜卡最常见）',
        '4. 概率用 softmax(-score × T) 归一化，评分高者概率低',
        '5. 每次增删改食物后自动重算概率和品级',
      ],
      temperature: TEMPERATURE,
      weights: WEIGHTS,
    },
  }
}
