// ============================================
// 全局美食数据缓存（React Context）
// 首次加载后缓存在内存中，切换页面不重复请求
// ============================================

import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { fetchFoods as apiFetchFoods, fetchCategories as apiFetchCategories } from '../utils/api'

const FoodsContext = createContext(null)

export function FoodsProvider({ children }) {
  const [foods, setFoods] = useState([])
  const [categories, setCategories] = useState(['全部'])
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const cacheRef = useRef({ foods: null, categories: null, timestamp: 0 })

  // 缓存有效期：5分钟
  const CACHE_TTL = 5 * 60 * 1000

  const loadFoods = useCallback(async (forceRefresh = false) => {
    const now = Date.now()
    const cached = cacheRef.current

    // 有缓存且未过期，直接使用
    if (!forceRefresh && cached.foods && (now - cached.timestamp) < CACHE_TTL) {
      setFoods(cached.foods)
      if (cached.categories) setCategories(cached.categories)
      setLoading(false)
      setLoaded(true)
      return cached.foods
    }

    setLoading(true)
    try {
      const [foodsData, catsData] = await Promise.all([
        apiFetchFoods(),
        apiFetchCategories(),
      ])
      setFoods(foodsData)
      setCategories(catsData)
      cacheRef.current = { foods: foodsData, categories: catsData, timestamp: now }
      setLoaded(true)
      setLoading(false)
      return foodsData
    } catch (e) {
      console.error('加载美食数据失败:', e)
      setLoading(false)
      return []
    }
  }, [])

  // 强制刷新缓存（增删改后调用）
  const refreshFoods = useCallback(async () => {
    return loadFoods(true)
  }, [loadFoods])

  // 按分类和搜索过滤（从缓存中过滤，不重新请求）
  const filterFoods = useCallback((category = '全部', search = '') => {
    let result = foods
    if (category && category !== '全部') {
      result = result.filter(f => f.category === category)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(f =>
        (f.name || '').toLowerCase().includes(q) ||
        (f.description || '').toLowerCase().includes(q)
      )
    }
    return result
  }, [foods])

  return (
    <FoodsContext.Provider value={{
      foods,
      categories,
      loading,
      loaded,
      loadFoods,
      refreshFoods,
      filterFoods,
    }}>
      {children}
    </FoodsContext.Provider>
  )
}

export function useFoods() {
  const ctx = useContext(FoodsContext)
  if (!ctx) throw new Error('useFoods must be used within FoodsProvider')
  return ctx
}
