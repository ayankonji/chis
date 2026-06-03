import { motion } from 'framer-motion'
import { Flame, Candy, Thermometer, Star } from 'lucide-react'
import { TIER_CONFIG } from '../utils/gacha'
import ParticleEffect from './ParticleEffect'

export default function GachaCard({ food, showParticles = true, size = 'normal' }) {
  if (!food) return null

  const tier = food.gacha_tier || 'bronze'
  const config = TIER_CONFIG[tier]
  const isLarge = size === 'large'

  const tempConfig = {
    '热': { color: 'bg-brick-red/90 text-white', icon: <Thermometer className="w-3 h-3" /> },
    '冷': { color: 'bg-ios-teal/90 text-white', icon: <Thermometer className="w-3 h-3" /> },
    '常温': { color: 'bg-warm-orange/90 text-white', icon: <Thermometer className="w-3 h-3" /> },
  }
  const temp = tempConfig[food.temperature] || tempConfig['常温']

  return (
    <motion.div
      initial={{ rotateY: 180, scale: 0.8 }}
      animate={{ rotateY: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      className={`relative ${isLarge ? 'w-72 sm:w-80' : 'w-56'} mx-auto card-25d-wrapper`}
    >
      {/* 品级光环（金卡和银卡都有） */}
      {(tier === 'gold' || tier === 'silver') && (
        <div className="absolute -inset-3 rounded-[28px] opacity-30 animate-pulse"
          style={{ background: config.gradient, filter: 'blur(12px)' }}
        />
      )}

      {/* 卡片主体 - 2.5D 品级渐变边框 */}
      <div
        className={`card-25d card-25d-${tier} relative rounded-[20px] overflow-hidden`}
      >
        {/* 图片容器 - 保持圆角 */}
        <div className={`relative ${isLarge ? 'aspect-[3/4]' : 'aspect-[3/3.5]'} overflow-hidden rounded-[20px]`}>
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-105"
          />

          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* 品级角标 */}
          <div className="absolute top-3 left-3">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white backdrop-blur-md"
              style={{ background: config.gradient }}
            >
              <Star className="w-3 h-3 fill-current" />
              {config.label}
            </span>
          </div>

          {/* 概率角标 */}
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/40 backdrop-blur-md text-white/90">
              {(food.gacha_prob * 100).toFixed(2)}%
            </span>
          </div>

          {/* 底部信息 */}
          <div className="absolute bottom-0 left-0 right-0 p-4 backdrop-blur-md bg-white/10">
            <h3 className={`${isLarge ? 'text-xl' : 'text-lg'} font-semibold text-white text-center mb-1 drop-shadow-lg`}>
              {food.name}
            </h3>
            <div className="flex items-center justify-center gap-3 text-sm text-white/90 mb-2">
              <span className="font-medium">¥{food.price}</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span>{food.calories} kcal</span>
            </div>

            {/* 甜度辣度 */}
            <div className="flex justify-center gap-4 mb-2">
              <div className="flex items-center gap-1">
                <Candy className="w-3 h-3 text-warm-orange" fill={food.sweetness > 0 ? 'currentColor' : 'none'} />
                <span className="text-xs text-white/80">{food.sweetness}</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-brick-red" fill={food.spiciness > 0 ? 'currentColor' : 'none'} />
                <span className="text-xs text-white/80">{food.spiciness}</span>
              </div>
              <span className={`${temp.color} flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium`}>
                {temp.icon}
                {food.temperature}
              </span>
            </div>

            {/* 品级名称 */}
            <div className="flex justify-center">
              <span
                className="px-3 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ background: config.gradient }}
              >
                {config.name} · {config.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 粒子特效 */}
      {showParticles && <ParticleEffect tier={tier} active={showParticles} />}
    </motion.div>
  )
}
