import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, Bookmark, Sparkles, User, Filter, X } from 'lucide-react'
import { fetchPity, updatePity, createDrawLog } from '../utils/api'
import { calculateGachaDistribution, performGacha, TIER_CONFIG } from '../utils/gacha'
import { getDeviceId, getDeviceName } from '../utils/device'
import { useFoods } from '../context/FoodsContext'
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
  const { foods, loadFoods } = useFoods()
  const [result, setResult] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawPhase, setDrawPhase] = useState('idle') // idle | spinning | reveal
  const [saved, setSaved] = useState(false)
  const [showProbPanel, setShowProbPanel] = useState(false)
  const [spinItems, setSpinItems] = useState([])
  const [uploaderFilter, setUploaderFilter] = useState('全部')
  const [showFilter, setShowFilter] = useState(false)
  
  // 音效相关状态
  const [showNailongEasterEgg, setShowNailongEasterEgg] = useState(false)
  const audioRef = useRef(null)
  const nailongAudioRef = useRef(null)

  useEffect(() => {
    if (foods.length === 0) loadFoods()
  }, [foods.length, loadFoods])

  // 播放CS2开箱音效
  const playCsgoSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(e => console.warn('音效播放失败:', e))
    }
  }, [])

  // 播放奶龙音效
  const playNailongSound = useCallback(() => {
    if (nailongAudioRef.current) {
      nailongAudioRef.current.currentTime = 0
      nailongAudioRef.current.play().catch(e => console.warn('奶龙音效播放失败:', e))
    }
  }, [])

  // 停止奶龙音效
  const stopNailongSound = useCallback(() => {
    if (nailongAudioRef.current) {
      nailongAudioRef.current.pause()
      nailongAudioRef.current.currentTime = 0
    }
  }, [])

  // 按上传者筛选食物
  const filteredFoods = uploaderFilter === '全部'
    ? foods
    : foods.filter(f => (f.uploader || '').includes(uploaderFilter))

  // 构造CS开箱式滚动序列
  const buildSpinSequence = (allFoods, winner, isPCMode) => {
    const totalCards = isPCMode ? 60 : 50
    const sequence = []

    // 按品级分组
    const goldFoods = allFoods.filter(f => f.gacha_tier === 'gold')
    const silverFoods = allFoods.filter(f => f.gacha_tier === 'silver')
    const bronzeFoods = allFoods.filter(f => f.gacha_tier === 'bronze')

    // 构造滚动序列：按 1:3:5 比例
    for (let i = 0; i < totalCards - 1; i++) {
      const rand = Math.random()
      let pool
      if (rand < 0.1 && goldFoods.length > 0) {
        pool = goldFoods
      } else if (rand < 0.4 && silverFoods.length > 0) {
        pool = silverFoods
      } else {
        pool = bronzeFoods.length > 0 ? bronzeFoods : allFoods
      }
      sequence.push(pool[Math.floor(Math.random() * pool.length)])
    }

    // 最后一张是中奖卡
    sequence.push(winner)
    return sequence
  }

  const handleDraw = useCallback(async () => {
    if (isDrawing || filteredFoods.length === 0) return
    setIsDrawing(true)
    setResult(null)
    setSaved(false)
    setDrawPhase('spinning')

    // 播放CS2开箱音效
    playCsgoSound()

    // 1. 计算概率分布并执行抽卡
    const foodsWithDist = calculateGachaDistribution(filteredFoods)
    const deviceId = getDeviceId()
    const deviceName = getDeviceName()
    const pityData = await fetchPity(deviceId)
    const { result: winner, newPity } = performGacha(foodsWithDist, pityData)

    // 2. 构造CS开箱式滚动序列
    const sequence = buildSpinSequence(foodsWithDist, winner, isPC)
    setSpinItems(sequence)

    // 3. 等待动画完成（7秒）
    await new Promise(r => setTimeout(r, 7200))

    // 4. 展示结果
    setResult(winner)
    setDrawPhase('reveal')

    // 5. 检查是否是奶龙彩蛋
    if (winner.name === '奶龙') {
      setShowNailongEasterEgg(true)
      playNailongSound()
    }

    // 6. 保存保底计数 + 抽卡记录
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
  }, [filteredFoods, isDrawing, isPC, playCsgoSound, playNailongSound])

  const handleSave = () => {
    const savedList = JSON.parse(localStorage.getItem('chis_saved') || '[]')
    if (!savedList.find(s => s.id === result.id)) {
      savedList.push(result)
      localStorage.setItem('chis_saved', JSON.stringify(savedList))
    }
    setSaved(true)
  }

  // 关闭奶龙彩蛋
  const closeNailongEasterEgg = () => {
    setShowNailongEasterEgg(false)
    stopNailongSound()
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
      {/* 音频元素 */}
      <audio ref={audioRef} src="/chis/sounds/csgo-case-open.mp3" preload="auto" />
      <audio ref={nailongAudioRef} src="/chis/sounds/nailong-laugh.wav" preload="auto" />
      {/* 背景层 */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at top, #FFF9F3 0%, #F5EFE6 100%)',
      }}>
        <div className="absolute inset-0 backdrop-blur-md" style={{ background: 'rgba(255, 249, 243, 0.45)' }} />
        <FilmStrip foods={foods} angle={-15} top="5%" speed={30} blur={1} scale={0.85} opacity={0.22} />
        <FilmStrip foods={foods} angle={10} top="52%" speed={40} blur={2} scale={0.65} opacity={0.16} direction="right" />
        <FilmStrip foods={foods} angle={-5} top="82%" speed={25} blur={1} scale={0.95} opacity={0.2} />
        <CornerDecor position="top-left" />
        <CornerDecor position="top-right" />
        <CornerDecor position="bottom-left" />
        <CornerDecor position="bottom-right" />
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
              className="text-center w-full max-w-md"
            >
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="mb-3">
                <Sparkles className="w-12 h-12 text-warm-orange mx-auto mb-4" />
              </motion.div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-ios-text mb-4 tracking-tight">今天吃什么？</h1>
              <p className="text-warm-gray-light text-base sm:text-lg mb-6 max-w-md mx-auto leading-relaxed">
                不知道吃什么？点击按钮，让命运决定你的下一餐
              </p>

              {/* 上传者筛选 */}
              <div className="mb-8">
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/80 backdrop-blur-md text-ios-text-secondary hover:text-ios-text shadow-ios transition-all duration-300 mb-3"
                >
                  <Filter className="w-4 h-4" />
                  {uploaderFilter === '全部' ? '筛选上传者' : `当前：${uploaderFilter}`}
                </button>
                <AnimatePresence>
                  {showFilter && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="flex justify-center gap-2 flex-wrap"
                    >
                      {['全部', 'hyy', 'xyt'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => { setUploaderFilter(opt); setShowFilter(false) }}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                            uploaderFilter === opt
                              ? 'bg-warm-orange text-white shadow-md'
                              : 'bg-white text-ios-text-secondary shadow-ios hover:text-ios-text'
                          }`}
                        >
                          {opt === '全部' ? '全部' : opt}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 两个按钮：概率公示 在上，抽一张 在下，间距加大 */}
              <div className="flex flex-col items-center gap-5">
                <button
                  onClick={() => setShowProbPanel(true)}
                  className="text-sm text-ios-text-secondary hover:text-warm-orange transition-colors underline underline-offset-4"
                >
                  查看概率公式
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={handleDraw}
                  disabled={isDrawing || filteredFoods.length === 0}
                  className="ios-button px-10 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Shuffle className="w-5 h-5 mr-2" />
                  抽一张
                </motion.button>
                {filteredFoods.length === 0 && foods.length > 0 && (
                  <p className="text-xs text-ios-red">当前筛选条件下没有美食</p>
                )}
              </div>
            </motion.div>
          )}

          {/* ====== 旋转状态 ====== */}
          {drawPhase === 'spinning' && (
            <motion.div
              key="spinning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex justify-center"
            >
              {isPC ? (
                <PCSpinStrip items={spinItems} />
              ) : (
                <MobileSpinStrip items={spinItems} />
              )}
            </motion.div>
          )}

          {/* ====== 结果展示 ====== */}
          {drawPhase === 'reveal' && result && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="text-center"
            >
              <GachaCard food={result} showParticles={true} size="large" />

              {/* 操作按钮 */}
              <div className="mt-8 flex flex-col items-center gap-4">
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={saved}
                    className={`ios-button px-6 py-3 ${saved ? 'opacity-60' : ''}`}
                  >
                    <Bookmark className="w-4 h-4 mr-2" />
                    {saved ? '已收藏' : '收藏'}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/food/${result.id}`)}
                    className="px-6 py-3 rounded-ios-lg font-medium text-sm bg-white text-ios-text shadow-ios hover:shadow-ios-hover transition-all duration-300"
                    style={{ border: '1px solid #E8DFD5' }}
                  >
                    查看详情
                  </motion.button>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={() => setShowProbPanel(true)}
                    className="text-sm text-ios-text-secondary hover:text-warm-orange transition-colors underline underline-offset-4"
                  >
                    查看概率公式
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { 
                      setDrawPhase('idle'); 
                      setSpinItems([])
                      setShowNailongEasterEgg(false)
                      stopNailongSound()
                    }}
                    className="ios-button px-8 py-3"
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    再来一发
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 概率公示面板 */}
      <GachaProbabilityPanel
        isOpen={showProbPanel}
        onClose={() => setShowProbPanel(false)}
        foods={filteredFoods}
      />

      {/* 奶龙彩蛋弹窗 */}
      <AnimatePresence>
        {showNailongEasterEgg && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={closeNailongEasterEgg}
          >
            {/* 背景虚化 */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            
            {/* 弹窗内容 */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 关闭按钮 */}
              <button
                onClick={closeNailongEasterEgg}
                className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/20 text-white/80 hover:bg-black/30 hover:text-white transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>

              {/* 奶龙图片 */}
              <div className="aspect-square overflow-hidden">
                <img
                  src={result.image}
                  alt="奶龙"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 底部信息 */}
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-ios-text mb-2">🎉 恭喜抽到奶龙！</h3>
                <p className="text-ios-text-secondary mb-4">奶龙正在开心地大笑呢～</p>
                <button
                  onClick={closeNailongEasterEgg}
                  className="ios-button px-6 py-2"
                >
                  收下了
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================
// PC端：横向滚动条带（CS开箱风格）
// ============================================
function PCSpinStrip({ items }) {
  const stripRef = useRef(null)
  const CARD_W = 140
  const CARD_GAP = 12
  const CARD_TOTAL = CARD_W + CARD_GAP

  useEffect(() => {
    if (!stripRef.current || items.length === 0) return
    const el = stripRef.current
    const containerCenter = el.parentElement.offsetWidth / 2
    const targetX = (items.length - 1) * CARD_TOTAL + CARD_W / 2 - containerCenter

    // CS开箱效果：先快后慢，7秒缓动
    el.style.transition = 'transform 7s cubic-bezier(0.10, 0.90, 0.20, 1)'
    el.style.transform = `translateX(-${targetX}px)`

    return () => {
      el.style.transition = 'none'
      el.style.transform = 'translateX(0)'
    }
  }, [items])

  return (
    <div className="relative overflow-hidden rounded-ios-lg bg-white/30 backdrop-blur-md" style={{ width: '90vw', maxWidth: '900px', height: '320px' }}>
      {/* 指针（中心高亮线） */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-warm-orange z-20" style={{ boxShadow: '0 0 12px rgba(255,127,50,0.6)' }} />

      {/* 渐变遮罩 */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white/80 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white/80 to-transparent z-10" />

      {/* 滚动容器 */}
      <div ref={stripRef} className="flex items-center gap-3 h-full px-4" style={{ willChange: 'transform' }}>
        {items.map((food, i) => {
          const cfg = TIER_CONFIG[food.gacha_tier] || TIER_CONFIG.bronze
          return (
            <div
              key={i}
              className="flex-shrink-0 rounded-ios-sm overflow-hidden bg-white"
              style={{
                width: `${CARD_W}px`,
                height: '240px',
                border: `2px solid ${cfg.borderColor}`,
                boxShadow: cfg.borderShadow,
              }}
            >
              <div className="relative w-full h-32 overflow-hidden">
                <img src={food.image} alt="" className="w-full h-full object-cover" />
                <span className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded text-white font-bold" style={{ background: cfg.gradient }}>
                  {cfg.label}
                </span>
              </div>
              <div className="p-2">
                <p className="text-sm font-medium text-ios-text truncate text-center">{food.name}</p>
                <p className="text-white/70 text-[10px] text-center">¥{food.price}</p>
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

    el.style.transition = 'transform 7s cubic-bezier(0.10, 0.90, 0.20, 1)'
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
// 四角美食简笔画暗纹
// ============================================
function CornerDecor({ position }) {
  const posClass = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4 -scale-x-100',
    'bottom-left': 'bottom-4 left-4 -scale-y-100',
    'bottom-right': 'bottom-4 right-4 -scale-x-100 -scale-y-100',
  }[position]

  return (
    <div className={`absolute ${posClass} pointer-events-none`} style={{ opacity: 0.04 }}>
      <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
        <ellipse cx="60" cy="120" rx="45" ry="18" stroke="#8B7E74" strokeWidth="2.5" />
        <path d="M15 120 Q60 60 105 120" stroke="#8B7E74" strokeWidth="2.5" fill="none" />
        <line x1="75" y1="50" x2="95" y2="115" stroke="#8B7E74" strokeWidth="2" strokeLinecap="round" />
        <line x1="85" y1="48" x2="100" y2="112" stroke="#8B7E74" strokeWidth="2" strokeLinecap="round" />
        <rect x="120" y="55" width="35" height="50" rx="4" stroke="#8B7E74" strokeWidth="2" />
        <path d="M155 65 Q175 65 175 82 Q175 100 155 100" stroke="#8B7E74" strokeWidth="2" fill="none" />
        <path d="M130 50 Q133 40 137 50" stroke="#8B7E74" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M140 48 Q143 36 147 48" stroke="#8B7E74" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
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
          <div key={i} className="flex-shrink-0 w-44 h-60 rounded-ios overflow-hidden bg-ios-gray-5">
            <img src={food.image} alt="" className="w-full h-full object-cover opacity-30" loading="lazy" />
          </div>
        ))}
      </motion.div>
    </div>
  )
}
