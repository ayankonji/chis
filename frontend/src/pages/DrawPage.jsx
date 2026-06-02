import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, RotateCcw, Bookmark, Sparkles } from 'lucide-react'
import { drawRandomFood, fetchFoods } from '../utils/api'

export default function DrawPage() {
  const navigate = useNavigate()
  const [foods, setFoods] = useState([])
  const [result, setResult] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawPhase, setDrawPhase] = useState('idle') // idle, flying, flipping, reveal
  const [flipCards, setFlipCards] = useState([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchFoods().then(setFoods)
  }, [])

  const handleDraw = useCallback(async () => {
    if (isDrawing || foods.length === 0) return
    setIsDrawing(true)
    setDrawPhase('flying')
    setResult(null)
    setSaved(false)

    // 飞入阶段
    const tempCards = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      food: foods[Math.floor(Math.random() * foods.length)],
      x: (Math.random() - 0.5) * window.innerWidth,
      y: (Math.random() - 0.5) * window.innerHeight,
      rotation: Math.random() * 360,
    }))
    setFlipCards(tempCards)

    await new Promise(r => setTimeout(r, 600))
    setDrawPhase('flipping')

    // 快速翻转阶段
    await new Promise(r => setTimeout(r, 2500))

    const winner = await drawRandomFood()
    setResult(winner)
    setDrawPhase('reveal')

    await new Promise(r => setTimeout(r, 800))
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 overflow-hidden"
    >
      {/* 背景层 */}
      <div className="absolute inset-0 bg-ios-bg">
        {/* 毛玻璃背景 */}
        <div className="absolute inset-0 backdrop-blur-xl" style={{ background: 'rgba(245,245,247,0.6)' }} />

        {/* 动态胶卷装饰 */}
        <FilmStrip foods={foods} angle={-15} top="10%" speed={30} blur={2} scale={0.6} opacity={0.15} />
        <FilmStrip foods={foods} angle={10} top="60%" speed={40} blur={4} scale={0.4} opacity={0.1} direction="right" />
        <FilmStrip foods={foods} angle={-5} top="85%" speed={25} blur={1} scale={0.8} opacity={0.12} />
      </div>

      {/* 内容层 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-20 pb-8">
        <AnimatePresence mode="wait">
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
                <Sparkles className="w-12 h-12 text-ios-blue mx-auto mb-4" />
              </motion.div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-ios-text mb-3">
                今天吃什么？
              </h1>
              <p className="text-ios-text-secondary text-base sm:text-lg mb-10 max-w-md mx-auto">
                不知道吃什么？点击按钮，让命运决定你的下一餐
              </p>

              <DrawButton onClick={handleDraw} disabled={foods.length === 0} />

              <p className="text-ios-gray text-sm mt-6">
                美食库共 {foods.length} 道美食
              </p>
            </motion.div>
          )}

          {(drawPhase === 'flying' || drawPhase === 'flipping') && (
            <motion.div
              key="drawing"
              className="absolute inset-0 flex items-center justify-center"
            >
              {flipCards.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{
                    x: card.x,
                    y: card.y,
                    rotate: card.rotation,
                    scale: 0.3,
                    opacity: 0,
                  }}
                  animate={drawPhase === 'flipping' ? {
                    x: 0,
                    y: 0,
                    rotate: [0, 360, 720, 1080, 1440].map(r => r + i * 45),
                    scale: [0.8, 1.1, 0.9, 1.05, 0.95],
                    opacity: [0.8, 1, 0.8, 1, 0],
                  } : {
                    x: 0,
                    y: 0,
                    rotate: 0,
                    scale: 0.9,
                    opacity: 1,
                  }}
                  transition={drawPhase === 'flipping' ? {
                    duration: 2.5,
                    delay: i * 0.05,
                    ease: 'easeInOut',
                  } : {
                    duration: 0.6,
                    delay: i * 0.03,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="absolute w-40 sm:w-56 aspect-[3/4] rounded-ios overflow-hidden shadow-ios bg-white"
                >
                  <img
                    src={card.food.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {drawPhase === 'reveal' && result && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center w-full max-w-sm"
            >
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-ios-text-secondary text-sm mb-4"
              >
                命运选择了
              </motion.p>

              <motion.div
                initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                  delay: 0.1,
                }}
                className="ios-card overflow-hidden mb-6 mx-auto"
                style={{
                  boxShadow: '0 8px 48px rgba(0, 122, 255, 0.2), 0 0 0 1px rgba(0, 122, 255, 0.1)',
                }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={result.image}
                    alt={result.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-ios-text mb-2">
                    {result.name}
                  </h2>
                  <div className="flex items-center justify-center gap-4 text-sm text-ios-text-secondary">
                    <span>¥{result.price}</span>
                    <span>{result.calories} kcal</span>
                    <span className={result.temperature === '热' ? 'text-ios-red' : result.temperature === '冰' ? 'text-ios-blue' : 'text-ios-orange'}>
                      {result.temperature}
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-3"
              >
                <button
                  onClick={handleDraw}
                  className="ios-button gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  再抽一次
                </button>
                <button
                  onClick={handleSave}
                  disabled={saved}
                  className={`flex items-center gap-2 px-5 py-3 rounded-ios-lg font-medium text-sm transition-all duration-300 ${
                    saved
                      ? 'bg-ios-green text-white'
                      : 'bg-white text-ios-text shadow-ios hover:shadow-ios-hover'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                  {saved ? '已保存' : '保存结果'}
                </button>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                onClick={() => navigate(`/food/${result.id}`)}
                className="mt-4 text-ios-blue text-sm hover:underline"
              >
                查看详情
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
        background: 'linear-gradient(180deg, #007AFF 0%, #0066CC 100%)',
        boxShadow: '0 8px 32px rgba(0, 122, 255, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.25), inset 0 -2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Shuffle className="w-8 h-8 text-white" />
      <span className="text-white font-semibold text-lg">抽一张</span>
      {/* 脉冲光环 */}
      <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-ios-blue" style={{ animationDuration: '2s' }} />
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
        opacity,
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
              className="w-full h-full object-cover opacity-60"
              loading="lazy"
            />
          </div>
        ))}
      </motion.div>
    </div>
  )
}
