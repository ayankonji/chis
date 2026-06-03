import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, RotateCcw, Bookmark, Sparkles, BarChart3 } from 'lucide-react'
import { fetchFoods, fetchPity, updatePity, createDrawLog } from '../utils/api'
import { calculateGachaDistribution, performGacha, TIER_CONFIG } from '../utils/gacha'
import { getDeviceId, getDeviceName } from '../utils/device'
import GachaCard from '../components/GachaCard'
import GachaProbabilityPanel from '../components/GachaProbabilityPanel'

// 判断是否PC端
function useIsPC() {
  const [isPC, setIsPC] = useState(() => window.innerWidth >= 768)
  useEffect(() => {
    const handler = () => setIsPC(window.innerWidth >= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isPC
}

export default function DrawPage() {
  const navigate = useNavigate()
  const isPC = useIsPC()
  const [foods, setFoods] = useState([])
  const [result, setResult] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawPhase, setDrawPhase] = useState('idle') // idle | spinning | reveal
  const [saved, setSaved] = useState(false)
  const [showProbPanel, setShowProbPanel] = useState(false)
  const [spinItems, setSpinItems] = useState([])

  useEffect(() => {
    fetchFoods().then(setFoods)
  }, [])

  const handleDraw = useCallback(async () => {
    if (isDrawing || foods.length === 0) return
    setIsDrawing(true)
    setResult(null)
    setSaved(false)
    setDrawPhase('spinning')

    // 1. 先计算概率分布并执行抽卡（获得真实结果）
    const foodsWithDist = calculateGachaDistribution(foods)
    const deviceId = getDeviceId()
    const deviceName = getDeviceName()
    const pityData = await fetchPity(deviceId)
    const { result: winner, newPity } = performGacha(foodsWithDist, pityData)

    // 2. 构造滚动序列：随机卡 × N + 最后一张 = winner
    const totalCards = 30
    const sequence = []
    for (let i = 0; i < totalCards - 1; i++) {
      sequence.push(foodsWithDist[Math.floor(Math.random() * foodsWithDist.length)])
    }
    sequence.push(winner) // 最后一张一定是中奖卡
    setSpinItems(sequence)

    // 3. 等待动画完成（7秒）
    await new Promise(r => setTimeout(r, 7200))

    // 4. 展示结果
    setResult(winner)
    setDrawPhase('reveal')

    // 5. 保存保底计数 + 抽卡记录
    try {
      await updatePity(deviceId, { ...newPity, device_name: deviceName || '匿名用户' })
      await createDrawLog({
        device_id: deviceId,
        device_name: deviceName || '匿名用户',
        food_id: winner.id,
        food_name: winner.name,
        tier: winner.gacha_tier,
      })
    } catch (e) {
      console.warn('保存抽卡记录失败:', e)
    }

    await new Promise(r => setTimeout(r, 300))
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
          {/* ====== 空闲状态 ====== */}
          {drawPhase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="mb-3">
                <Sparkles className="w-12 h-12 text-warm-orange mx-auto mb-4" />
              </motion.div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-ios-text mb-3">今天吃什么？</h1>
              <p className="text-ios-text-secondary text-base sm:text-lg mb-6 max-w-md mx-auto">
                不知道吃什么？点击按钮，让命运决定你的下一餐
              </p>

              {/* 概率公示按钮 - 在抽卡按钮上方，独立区域 */}
              <button
                onClick={() => setShowProbPanel(true)}
                className="mb-6 flex items-center gap-1.5 mx-auto text-sm text-ios-text-secondary hover:text-warm-orange transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                查看概率公示
              </button>

              <div className="flex justify-center">
                <DrawButton onClick={handleDraw} disabled={foods.length === 0} />
              </div>

              <p className="text-warm-gray text-sm mt-8">美食库共 {foods.length} 道菜</p>
            </motion.div>
          )}

          {/* ====== 抽卡滚动状态 ====== */}
          {drawPhase === 'spinning' && (
            <motion.div key="spinning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
              {isPC ? (
                <PCSpinStrip items={spinItems} />
              ) : (
                <MobileSpinStrip items={spinItems} />
              )}
              <p className="text-ios-text-secondary text-sm mt-6 animate-pulse">抽卡中...</p>
            </motion.div>
          )}

          {/* ====== 揭晓状态 ====== */}
          {drawPhase === 'reveal' && result && (
            <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
              {/* 品级标题 */}
              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-4">
                <span className="inline-block px-4 py-1.5 rounded-full text-sm font-bold text-white" style={{ background: tierConfig?.gradient }}>
                  {tierConfig?.name} · {tierConfig?.label}
                </span>
              </motion.div>

              {/* 卡片 */}
              <GachaCard food={result} showParticles={true} size="large" />

              {/* 操作按钮 - 间距加大防误触 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 flex flex-col items-center gap-5"
              >
                <div className="flex items-center gap-4">
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

                {/* 二级操作 - 与主按钮间距更大 */}
                <div className="flex items-center gap-6 mt-2">
                  <button onClick={() => navigate(`/food/${result.id}`)} className="text-warm-orange text-sm hover:underline">
                    查看详情
                  </button>
                  <span className="text-ios-gray-4">|</span>
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

// ============================================
// 抽卡按钮
// ============================================
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

// ============================================
// PC端：横向滚动条带（CS开箱风格）
// ============================================
function PCSpinStrip({ items }) {
  const containerRef = useRef(null)
  const CARD_W = 160
  const CARD_GAP = 16
  const CARD_TOTAL = CARD_W + CARD_GAP

  useEffect(() => {
    if (!containerRef.current || items.length === 0) return
    const el = containerRef.current
    // 目标偏移：最后一张卡片中心对齐指针
    const containerCenter = el.parentElement.offsetWidth / 2
    const targetX = (items.length - 1) * CARD_TOTAL + CARD_W / 2 - containerCenter

    // 使用 CSS animation 实现减速效果
    el.style.transition = 'transform 7s cubic-bezier(0.15, 0.85, 0.25, 1)'
    el.style.transform = `translateX(-${targetX}px)`

    return () => {
      el.style.transition = 'none'
      el.style.transform = 'translateX(0)'
    }
  }, [items])

  return (
    <div className="relative w-full max-w-4xl overflow-hidden rounded-ios-lg bg-white/30 backdrop-blur-md" style={{ height: '320px' }}>
      {/* 指针（中心高亮线） */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-warm-orange z-20" style={{ boxShadow: '0 0 12px rgba(255,127,50,0.6)' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-warm-orange z-20" />

      {/* 渐变遮罩 */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white/80 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white/80 to-transparent z-10" />

      {/* 滚动容器 */}
      <div ref={containerRef} className="flex items-center h-full gap-4 pl-8" style={{ willChange: 'transform' }}>
        {items.map((food, i) => {
          const cfg = TIER_CONFIG[food.gacha_tier] || TIER_CONFIG.bronze
          return (
            <div
              key={i}
              className="flex-shrink-0 rounded-ios overflow-hidden"
              style={{
                width: `${CARD_W}px`,
                height: '260px',
                border: `3px solid ${cfg.borderColor}`,
                boxShadow: cfg.borderShadow,
              }}
            >
              <div className="relative w-full h-full">
                <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-2 left-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style={{ background: cfg.gradient }}>
                    {cfg.label}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-white text-xs font-medium truncate text-center">{food.name}</p>
                  <p className="text-white/70 text-[10px] text-center">¥{food.price}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// 手机端：竖直滚动条带
// ============================================
function MobileSpinStrip({ items }) {
  const containerRef = useRef(null)
  const CARD_H = 110
  const CARD_GAP = 12
  const CARD_TOTAL = CARD_H + CARD_GAP

  useEffect(() => {
    if (!containerRef.current || items.length === 0) return
    const el = containerRef.current
    const containerCenter = el.parentElement.offsetHeight / 2
    const targetY = (items.length - 1) * CARD_TOTAL + CARD_H / 2 - containerCenter

    el.style.transition = 'transform 7s cubic-bezier(0.15, 0.85, 0.25, 1)'
    el.style.transform = `translateY(-${targetY}px)`

    return () => {
      el.style.transition = 'none'
      el.style.transform = 'translateY(0)'
    }
  }, [items])

  return (
    <div className="relative overflow-hidden rounded-ios-lg bg-white/30 backdrop-blur-md" style={{ width: '280px', height: '420px' }}>
      {/* 指针（中心高亮线） */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-warm-orange z-20" style={{ boxShadow: '0 0 12px rgba(255,127,50,0.6)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[10px] border-l-warm-orange z-20 rotate-180" style={{ left: 'calc(100% - 4px)' }} />

      {/* 渐变遮罩 */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/80 to-transparent z-10" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/80 to-transparent z-10" />

      {/* 滚动容器 */}
      <div ref={containerRef} className="flex flex-col items-center gap-3 pt-8" style={{ willChange: 'transform' }}>
        {items.map((food, i) => {
          const cfg = TIER_CONFIG[food.gacha_tier] || TIER_CONFIG.bronze
          return (
            <div
              key={i}
              className="flex-shrink-0 flex items-center gap-3 px-3 rounded-ios-sm overflow-hidden bg-white"
              style={{
                width: '240px',
                height: `${CARD_H}px`,
                border: `2px solid ${cfg.borderColor}`,
                boxShadow: cfg.borderShadow,
              }}
            >
              <img src={food.image} alt="" className="w-16 h-16 rounded object-cover flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ios-text truncate">{food.name}</p>
                <p className="text-xs text-ios-text-secondary">¥{food.price} · {food.calories}kcal</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded text-white mt-1 inline-block" style={{ background: cfg.gradient }}>
                  {cfg.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// 背景装饰胶片条
// ============================================
function FilmStrip({ foods, angle, top, speed, blur, scale, opacity, direction = 'left' }) {
  if (foods.length === 0) return null
  const repeated = [...foods, ...foods, ...foods, ...foods]
  return (
    <div
      className="absolute w-[200vw] pointer-events-none select-none"
      style={{ top, left: '-50vw', transform: `rotate(${angle}deg) scale(${scale})`, filter: `blur(${blur}px)`, opacity: opacity * 0.5 }}
    >
      <motion.div
        animate={{ x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
        className="flex gap-3"
      >
        {repeated.map((food, i) => (
          <div key={i} className="flex-shrink-0 w-32 h-44 rounded-ios overflow-hidden bg-ios-gray-5">
            <img src={food.image} alt="" className="w-full h-full object-cover opacity-30" loading="lazy" />
          </div>
        ))}
      </motion.div>
    </div>
  )
}
