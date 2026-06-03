import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Flame, Candy, Thermometer, Trash2, Edit3, Loader2, Star } from 'lucide-react'
import { fetchFood, removeFood, fetchAllFoods, editFood } from '../utils/api'
import { isAdminLoggedIn } from '../utils/admin'
import { TIER_CONFIG, recalculateAndSaveTiers } from '../utils/gacha'
import AdminLoginModal from '../components/AdminLoginModal'

export default function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [food, setFood] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [pendingAction, setPendingAction] = useState(null) // 'edit' | 'delete'

  useEffect(() => {
    setLoading(true)
    fetchFood(id).then(data => {
      setFood(data)
      setLoading(false)
    })
  }, [id])

  // 需要管理员权限的操作
  const requireAdmin = (action) => {
    if (isAdminLoggedIn()) {
      executeAction(action)
    } else {
      setPendingAction(action)
      setShowAdminModal(true)
    }
  }

  const executeAction = async (action) => {
    if (action === 'edit') {
      navigate(`/edit/${food.id}`)
    } else if (action === 'delete') {
      if (!confirm('确定要删除这道美食吗？')) return
      await removeFood(id)
      // 删除后自动重算品级和概率
      await recalculateAndSaveTiers(fetchAllFoods, editFood)
      navigate('/')
    }
  }

  const handleAdminSuccess = () => {
    setShowAdminModal(false)
    if (pendingAction) {
      executeAction(pendingAction)
      setPendingAction(null)
    }
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
    '冷': { class: 'tag-cold', color: '#5AC8FA' },
    '常温': { class: 'tag-warm', color: '#FF7F32' },
  }
  const temp = tempConfig[food.temperature] || tempConfig['常温']

  // 品级信息（如果数据库中有 gacha_tier 字段）
  const tier = food.gacha_tier || 'bronze'
  const tierCfg = TIER_CONFIG[tier]

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

        {/* 操作按钮（需管理员权限） */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute top-4 right-4 flex gap-2"
        >
          <button
            onClick={() => requireAdmin('edit')}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-white/90 hover:text-ios-text transition-all duration-300"
            title="编辑（需要管理员权限）"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => requireAdmin('delete')}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-brick-red/90 transition-all duration-300"
            title="删除（需要管理员权限）"
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
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-3 py-1 rounded-lg text-xs font-medium bg-white/20 backdrop-blur-md text-white">
                {food.category}
              </span>
              {/* 品级角标 */}
              {food.gacha_tier && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white"
                  style={{ background: tierCfg?.gradient }}
                >
                  <Star className="w-3 h-3 fill-current" />
                  {tierCfg?.name} · {tierCfg?.label}
                </span>
              )}
            </div>
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

          {/* 品级信息 */}
          {food.gacha_tier && (
            <div
              className="mb-6 p-4 rounded-ios-sm"
              style={{
                border: `1.5px solid ${tierCfg?.borderColor}40`,
                background: `${tierCfg?.borderColor}08`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: tierCfg?.gradient }}
                  >
                    <Star className="w-4 h-4 text-white fill-current" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ios-text">{tierCfg?.name} · {tierCfg?.label}</p>
                    <p className="text-xs text-ios-text-secondary">抽卡品级</p>
                  </div>
                </div>
                {food.gacha_prob > 0 && (
                  <span className="text-lg font-bold text-ios-text">
                    {(food.gacha_prob * 100).toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
          )}

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

      {/* 管理员登录弹窗 */}
      <AdminLoginModal
        isOpen={showAdminModal}
        onClose={() => { setShowAdminModal(false); setPendingAction(null) }}
        onSuccess={handleAdminSuccess}
      />
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
