import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Flame, Candy, Thermometer, Trash2, Edit3, Loader2 } from 'lucide-react'
import { fetchFood, removeFood } from '../utils/api'

export default function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [food, setFood] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgLoaded, setImgLoaded] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchFood(id).then(data => {
      setFood(data)
      setLoading(false)
    })
  }, [id])

  const handleDelete = async () => {
    if (!confirm('确定要删除这道美食吗？')) return
    await removeFood(id)
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 text-warm-orange animate-spin" />
      </div>
    )
  }

  if (!food) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <p className="text-ios-text-secondary text-lg mb-4">美食不存在</p>
        <Link to="/" className="ios-button">返回美食库</Link>
      </div>
    )
  }

  const tempConfig = {
    '热': { class: 'tag-hot', color: '#D85A38' },
    '冰': { class: 'tag-cold', color: '#5AC8FA' },
    '常温': { class: 'tag-warm', color: '#FF7F32' },
  }
  const temp = tempConfig[food.temperature] || tempConfig['常温']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pt-16 sm:pt-20 pb-12"
    >
      {/* 大图区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-h-[50vh] overflow-hidden"
      >
        {!imgLoaded && (
          <div className="absolute inset-0 bg-ios-gray-5 animate-pulse" />
        )}
        <img
          src={food.image}
          alt={food.name}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-[50vh] object-cover transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* 返回按钮 */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-white/90 hover:text-ios-text transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>

        {/* 操作按钮 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute top-4 right-4 flex gap-2"
        >
          <Link
            to={`/edit/${food.id}`}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-white/90 hover:text-ios-text transition-all duration-300"
          >
            <Edit3 className="w-4 h-4" />
          </Link>
          <button
            onClick={handleDelete}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-brick-red/90 transition-all duration-300"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </motion.div>

        {/* 标题叠加 */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="inline-block px-3 py-1 rounded-lg text-xs font-medium bg-white/20 backdrop-blur-md text-white mb-2">
              {food.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
              {food.name}
            </h1>
          </motion.div>
        </div>
      </motion.div>

      {/* 详情信息 */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-ios-lg p-6 shadow-ios"
        >
          {/* 基础信息 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <InfoBlock label="价格" value={`¥${food.price}`} />
            <InfoBlock label="热量" value={`${food.calories} kcal`} />
            <InfoBlock label="温度" value={
              <span className={temp.class}>
                <Thermometer className="w-3 h-3" />
                {food.temperature}
              </span>
            } />
          </div>

          {/* 甜度辣度 */}
          <div className="space-y-4 mb-6">
            <RatingBar label="甜度" value={food.sweetness} icon={<Candy className="w-4 h-4" />} color="bg-warm-orange" />
            <RatingBar label="辣度" value={food.spiciness} icon={<Flame className="w-4 h-4" />} color="bg-brick-red" />
          </div>

          {/* 描述 */}
          {food.description && (
            <div className="pt-4 border-t border-ios-gray-5">
              <h3 className="text-sm font-medium text-ios-text-secondary mb-2">简介</h3>
              <p className="text-ios-text leading-relaxed">{food.description}</p>
            </div>
          )}
        </motion.div>

        {/* 底部操作 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex gap-3"
        >
          <Link to="/draw" className="flex-1 ios-button text-center">
            去抽卡
          </Link>
          <Link to="/" className="flex-1 px-6 py-3 rounded-ios-lg font-medium text-sm bg-white text-ios-text shadow-ios hover:shadow-ios-hover transition-all duration-300 text-center" style={{ border: '1px solid #E8DFD5' }}>
            返回美食库
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}

function InfoBlock({ label, value }) {
  return (
    <div className="text-center p-3 rounded-ios bg-ios-gray-6">
      <p className="text-xs text-ios-text-secondary mb-1">{label}</p>
      <div className="text-lg font-semibold text-ios-text">{value}</div>
    </div>
  )
}

function RatingBar({ label, value, icon, color }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-ios-text-secondary w-10">{label}</span>
      <div className="flex-1 flex gap-1.5">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`flex-1 h-2.5 rounded-full transition-all duration-500 ${
              i <= value ? color : 'bg-ios-gray-5'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-ios-text w-6 text-right">{value}</span>
    </div>
  )
}
