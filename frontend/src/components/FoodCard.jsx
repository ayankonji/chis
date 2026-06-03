import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, Candy, Thermometer } from 'lucide-react'

export default function FoodCard({ food, index = 0, layoutId }) {
  const [imgLoaded, setImgLoaded] = useState(false)

  const tempConfig = {
    '热': { color: 'bg-ios-red/90 text-white', icon: <Thermometer className="w-3 h-3" /> },
    '冰': { color: 'bg-ios-blue/90 text-white', icon: <Thermometer className="w-3 h-3" /> },
    '常温': { color: 'bg-ios-orange/90 text-white', icon: <Thermometer className="w-3 h-3" /> },
  }
  const temp = tempConfig[food.temperature] || tempConfig['常温']

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.4, 0, 0.2, 1]
      }}
      layoutId={layoutId}
      className="group"
    >
      <Link to={`/food/${food.id}`} className="block tap-highlight-none">
        <div className="relative rounded-[20px] overflow-hidden shadow-ios hover:shadow-ios-hover transition-all duration-500 group-hover:-translate-y-3">
          {/* 全图背景 */}
          <div className="relative w-full aspect-[3/4] overflow-hidden">
            {!imgLoaded && (
              <div className="absolute inset-0 bg-ios-gray-5 animate-pulse" />
            )}
            <img
              src={food.image}
              alt={food.name}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              } group-hover:scale-110`}
            />

            {/* 底部毛玻璃渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* 分类标签 - 左上角 */}
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/80 backdrop-blur-md text-ios-text shadow-sm">
                {food.category}
              </span>
            </div>

            {/* 信息区域 - 底部毛玻璃面板 */}
            <div className="absolute bottom-0 left-0 right-0 p-4 backdrop-blur-md bg-white/15">
              {/* 美食名称 */}
              <h3 className="text-lg font-semibold text-white text-center mb-1 drop-shadow-lg">
                {food.name}
              </h3>

              {/* 价格 & 热量 */}
              <div className="flex items-center justify-center gap-3 text-sm text-white/90 mb-2">
                <span className="font-medium">¥{food.price}</span>
                <span className="w-1 h-1 rounded-full bg-white/50" />
                <span>{food.calories} kcal</span>
              </div>

              {/* 描述 */}
              {food.description && (
                <p className="text-xs text-white/75 text-center mb-3 line-clamp-2 leading-relaxed">
                  {food.description}
                </p>
              )}

              {/* 甜度 - 单独一行 */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[10px] text-white/80 w-6 flex-shrink-0">甜度</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} className={i <= food.sweetness ? 'text-ios-pink' : 'text-white/25'}>
                      <Candy className="w-3 h-3" fill={i <= food.sweetness ? 'currentColor' : 'none'} />
                    </span>
                  ))}
                </div>
              </div>

              {/* 辣度 - 单独一行 */}
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] text-white/80 w-6 flex-shrink-0">辣度</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} className={i <= food.spiciness ? 'text-ios-red' : 'text-white/25'}>
                      <Flame className="w-3 h-3" fill={i <= food.spiciness ? 'currentColor' : 'none'} />
                    </span>
                  ))}
                </div>
              </div>

              {/* 温度标签 */}
              <div className="flex justify-center">
                <span className={`${temp.color} flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm`}>
                  {temp.icon}
                  {food.temperature}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
