import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, RotateCcw, Bookmark, Sparkles, BarChart3 } from 'lucide-react'
import { fetchFoods, fetchPity, updatePity } from '../utils/api'
import { calculateGachaDistribution, performGacha, TIER_CONFIG } from '../utils/gacha'
import { getDeviceId } from '../utils/device'
import GachaCard from '../components/GachaCard'
import GachaProbabilityPanel from '../components/GachaProbabilityPanel'

export default function DrawPage() {
  const navigate = useNavigate()
  const [foods, setFoods] = useState([])
  const [result, setResult] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawPhase, setDrawPhase] = useState('idle') // idle, spinning, reveal
  const [saved, setSaved] = useState(false)
  const [showProbPanel, setShowProbPanel] = useState(false)
  const [spinItems, setSpinItems] = useState([])

  // 加载美食数据
  useEffect(() => {
    fetchFoods().then(setFoods)
  }, [])

  const handleDraw = useCallback(async () => {
    if (isDrawing || foods.length === 0) return
    setIsDrawing(true)
    setResult(null)
    setSaved(false)
    setDrawPhase('spinning')

    // 计算概率分布
    const foodsWithDist = calculateGachaDistribution(foods)

    // 获取保底计数
    const deviceId = getDeviceId()
    const pityData = await fetchPity(deviceId)

    // 生成滚动展示序列（用于动画）
    const spinCount = 18
    const spinSequence = []
    for (let i = 0; i < spinCount; i++) {
      const randFood = foodsWithDist[Math.floor(Math.random() * foodsWithDist.length)]
      spinSequence.push(randFood)
    }
    setSpinItems(spinSequence)

    // 滚动动画
    await new Promise(r => setTimeout(r, 2200))

    // 执行真正的抽卡（带保底）
    const { result: winner, newPity } = performGacha(foodsWithDist, pityData)
    setResult(winner)
    setDrawPhase('reveal')

    // 保存保底计数到 Supabase
    try {
      await updatePity(deviceId, newPity)
    } catch (e) {
      console.warn('保底计数保存失败:', e)
    }

    await new Promise(r => setTimeout(r, 500))
    setIsDrawing(false)
  }, [foods, isDrawing])

  const handleSave = () => {
    const savedList = JSON.parse(localStorage.getItem('chis_saved') || '[]')
    if (!savedList.find(s => s.id === result.id)) {
      savedList.push(result)
      localStorage.setItem('chis_saved', JSON.stringify(savedList))
    }
    setSaved(true)
  }

  const tierConfig = result ? TIER_CONFIG[result.gacha_tier] : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 overflow-hidden"
    >
      {/* 背景层 */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at top, #FFF9F3 0%, #F5EFE6 100%)',
      }}>
        <div className="absolute inset-0 backdrop-blur-xl" style={{ background: 'rgba(255, 249, 243, 0.6)' }} />
        <FilmStrip foods={foods} angle={-15} top="10%" speed={30} blur={2} scale={0.6} opacity={0.15} />
        <FilmStrip foods={foods} angle={10} top="60%" speed={40} blur={4} scale={0.4} opacity={0.1} direction="right" />
        <FilmStrip foods={foods} angle={-5} top="85%" speed={25} blur={1} scale={0.8} opacity={0.12} />
      </div>

      {/* 内容层 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-20 pb-8">
        <AnimatePresence mode="wait">
          {/* 空闲状态 */}
          {drawPhase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-3"
              >
                <Sparkles className="w-12 h-12 text-warm-orange mx-auto mb-4" />
              </motion.div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-ios-text mb-3">
                今天吃什么？
              </h1>
              <p className="text-ios-text-secondary text-base sm:text-lg mb-10 max-w-md mx-auto">
                不知道吃什么？点击按钮，让命运决定你的下一餐
              </p>

              <div className="flex justify-center">
                <DrawButton onClick={handleDraw} disabled={foods.length === 0} />
              </div>

              <p className="text-warm-gray text-sm mt-6">
                美食库共 {foods.length} 道菜
              </p>

              {/* 概率公示入口 */}
              <button
                onClick={() => setShowProbPanel(true)}
                className="mt-4 flex items-center gap-1.5 mx-auto text-sm text-ios-text-secondary hover:text-warm-orange transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                查看概率公示
              </button>
            </motion.div>
          )}

          {/* 转盘滚动状态 */}
          {drawPhase === 'spinning' && (
            <motion.div
              key="spinning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="relative w-72 sm:w-80 overflow-hidden rounded-ios-lg bg-white/50 backdrop-blur-md shadow-ios"
                style={{ height: '380px' }}
              >
                {/* 顶部渐变遮罩 */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/80 to-transparent z-10" />
                {/* 底部渐变遮罩 */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/80 to-transparent z-10" />
                {/* 中心选择指示器 */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-warm-orange/30 z-10" />

                <motion.div
                  animate={{ y: [0, -(spinItems.length - 1) * 130] }}
                  transition={{ duration: 2, ease: [0.2, 0.8, 0.3, 1] }}
                  className="space-y-3 px-4 pt-40 pb-40"
                >
                  {spinItems.map((food, i) => (
                    <div
                      key={i}
                      className="h-[120px] rounded-ios-sm overflow-hidden flex items-center gap-3 px-3"
                      style={{
                        border: `2px solid ${TIER_CONFIG[food.gacha_tier]?.borderColor || '#CD7F32'}`,
                        background: 'white',
                      }}
                    >
                      <img src={food.image} alt="" className="w-16 h-16 rounded object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ios-text truncate">{food.name}</p>
                        <p className="text-xs text-ios-text-secondary">{food.category}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded text-white mt-1 inline-block"
                          style={{ background: TIER_CONFIG[food.gacha_tier]?.gradient }}
                        >
                          {TIER_CONFIG[food.gacha_tier]?.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
              <p className="text-ios-text-secondary text-sm mt-6 animate-pulse">抽卡中...</p>
            </motion.div>
          )}

          {/* 揭晓状态 */}
          {drawPhase === 'reveal' && result && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* 品级标题 */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-4"
              >
                <span
                  className="inline-block px-4 py-1.5 rounded-full text-sm font-bold text-white"
                  style={{ background: tierConfig?.gradient }}
                >
                  {tierConfig?.name} · {tierConfig?.label}
                </span>
              </motion.div>

              {/* 卡片 */}
              <GachaCard food={result} showParticles={true} size="large" />

              {/* 操作按钮 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 flex flex-col items-center gap-4"
              >
                <div className="flex items-center gap-3">
                  <button onClick={handleDraw} className="ios-button gap-2">
                    <RotateCcw className="w-4 h-4" />
                    再抽一次
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saved}
                    className={`flex items-center gap-2 px-5 py-3 rounded-ios-lg font-medium text-sm transition-all duration-300 ${
                      saved
                        ? 'bg-ios-green text-white'
                        : 'bg-white text-ios-text shadow-ios hover:shadow-ios-hover hover:translate-y-[-1px]'
                    }`}
                    style={{ border: '1px solid #E8DFD5' }}
                  >
                    <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                    {saved ? '已保存' : '保存结果'}
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate(`/food/${result.id}`)}
                    className="text-warm-orange text-sm hover:underline"
                  >
                    查看详情
                  </button>
                  <button
                    onClick={() => setShowProbPanel(true)}
                    className="flex items-center gap-1 text-ios-text-secondary text-sm hover:text-warm-orange transition-colors"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    概率公示
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 概率公示面板 */}
      <GachaProbabilityPanel isOpen={showProbPanel} onClose={() => setShowProbPanel(false)} />
    </motion.div>
  )
}

function DrawButton({ onClick, disabled }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      disabled={disabled}
      className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: 'linear-gradient(135deg, #FF7F32 0%, #FF9A5C 50%, #FFB088 100%)',
        boxShadow: '0 8px 32px rgba(255, 127, 50, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.25), inset 0 -2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Shuffle className="w-8 h-8 text-white" />
      <span className="text-white font-semibold text-lg">抽一张</span>
      <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-warm-orange" style={{ animationDuration: '2s' }} />
    </motion.button>
  )
}

function FilmStrip({ foods, angle, top, speed, blur, scale, opacity, direction = 'left' }) {
  if (foods.length === 0) return null
  const repeated = [...foods, ...foods, ...foods, ...foods]
  return (
    <div
      className="absolute w-[200vw] pointer-events-none select-none"
      style={{
        top,
        left: '-50vw',
        transform: `rotate(${angle}deg) scale(${scale})`,
        filter: `blur(${blur}px)`,
        opacity: opacity * 0.5,
      }}
    >
      <motion.div
        animate={{ x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
        className="flex gap-3"
      >
        {repeated.map((food, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-32 h-44 rounded-ios overflow-hidden bg-ios-gray-5"
          >
            <img
              src={food.image}
              alt=""
              className="w-full h-full object-cover opacity-30"
              loading="lazy"
            />
          </div>
        ))}
      </motion.div>
    </div>
  )
}
