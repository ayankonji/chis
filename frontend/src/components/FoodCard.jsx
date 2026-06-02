import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, Candy, Thermometer } from 'lucide-react'

export default function FoodCard({ food, index = 0, layoutId }) {
  const [imgLoaded, setImgLoaded] = useState(false)

  const tempConfig = {
    '热': { class: 'tag-hot', icon: <Thermometer className="w-3 h-3" /> },
    '冰': { class: 'tag-cold', icon: <Thermometer className="w-3 h-3" /> },
    '常温': { class: 'tag-warm', icon: <Thermometer className="w-3 h-3" /> },
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
        <div className="ios-card shimmer-effect relative">
          {/* 图片区域 */}
          <div className="relative w-full overflow-hidden" style={{ paddingBottom: '70%' }}>
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* 分类标签 */}
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/80 backdrop-blur-md text-ios-text shadow-sm">
                {food.category}
              </span>
            </div>
          </div>

          {/* 信息区域 */}
          <div className="p-4 space-y-3">
            <h3 className="text-base font-semibold text-ios-text text-center truncate">
              {food.name}
            </h3>

            <div className="flex items-center justify-between text-sm">
              <span className="text-ios-text-secondary">
                ¥{food.price}
              </span>
              <span className="text-ios-text-secondary">
                {food.calories} kcal
              </span>
            </div>

            {/* 甜度辣度 */}
            <div className="flex items-center justify-between">
              <RatingDisplay
                icon={<Candy className="w-3.5 h-3.5" />}
                value={food.sweetness}
                color="text-ios-pink"
                emptyColor="text-ios-gray-4"
                label="甜度"
              />
              <RatingDisplay
                icon={<Flame className="w-3.5 h-3.5" />}
                value={food.spiciness}
                color="text-ios-red"
                emptyColor="text-ios-gray-4"
                label="辣度"
              />
            </div>

            {/* 温度标签 */}
            <div className="flex justify-center">
              <span className={`${temp.class} flex items-center gap-1`}>
                {temp.icon}
                {food.temperature}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function RatingDisplay({ icon, value, color, emptyColor, label }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-ios-text-secondary mr-1">{label}</span>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= value ? color : emptyColor}>
          {icon}
        </span>
      ))}
    </div>
  )
}
