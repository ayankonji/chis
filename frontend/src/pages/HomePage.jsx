import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X, Loader2, User } from 'lucide-react'
import FoodCard from '../components/FoodCard'
import { useFoods } from '../context/FoodsContext'

const UPLOADER_OPTIONS = [
  { value: '全部', label: '全部' },
  { value: 'hyy', label: 'hyy' },
  { value: 'xyt', label: 'xyt' },
]

export default function HomePage() {
  const { foods, categories, loading, loadFoods, filterFoods } = useFoods()
  const [activeCategory, setActiveCategory] = useState('全部')
  const [activeUploader, setActiveUploader] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // 首次加载
  useEffect(() => {
    loadFoods()
  }, [loadFoods])

  // 从缓存中过滤
  const filteredFoods = filterFoods(activeCategory, searchQuery).filter(f => {
    if (activeUploader === '全部') return true
    const uploader = f.uploader || ''
    return uploader.includes(activeUploader)
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="pt-20 sm:pt-24 pb-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-semibold text-ios-text tracking-tight mb-2">
            美食库
          </h1>
          <p className="text-ios-text-secondary text-base sm:text-lg">
            {filteredFoods.length} 道美食等你发现
          </p>
        </motion.div>

        {/* 搜索和筛选 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
              <input
                type="text"
                placeholder="搜索美食..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="ios-input pl-11 pr-4"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-ios-gray-5 flex items-center justify-center hover:bg-ios-gray-4 transition-colors"
                >
                  <X className="w-3 h-3 text-ios-gray" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-ios transition-all duration-300 ${
                showFilters
                  ? 'bg-warm-orange text-white shadow-md'
                  : 'bg-white text-ios-text-secondary shadow-ios hover:text-ios-text'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* 筛选面板 */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                {/* 上传者筛选 */}
                <div className="mt-4 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-ios-text-secondary" />
                    <span className="text-sm font-medium text-ios-text">上传者</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {UPLOADER_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setActiveUploader(opt.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          activeUploader === opt.value
                            ? 'bg-warm-orange text-white shadow-md'
                            : 'bg-white text-ios-text-secondary shadow-ios hover:text-ios-text'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 分类筛选 */}
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeCategory === cat
                          ? 'bg-warm-orange text-white shadow-md'
                          : 'bg-white text-ios-text-secondary shadow-ios hover:text-ios-text'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 美食网格 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-warm-orange animate-spin" />
          </div>
        ) : filteredFoods.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-ios-text-secondary text-lg">没有找到匹配的美食</p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filteredFoods.map((food, i) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  index={i}
                  layoutId={`food-${food.id}`}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
