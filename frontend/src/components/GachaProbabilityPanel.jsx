import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, ChevronUp, Star, Info, RotateCcw, User, History } from 'lucide-react'
import { TIER_CONFIG, generateProbabilityReport, calculateGachaDistribution } from '../utils/gacha'
import { fetchFoods, fetchPity, fetchDrawLogs } from '../utils/api'
import { getDeviceId, getDeviceName, setDeviceName } from '../utils/device'

export default function GachaProbabilityPanel({ isOpen, onClose }) {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedFormula, setExpandedFormula] = useState(false)
  const [expandedFoods, setExpandedFoods] = useState(false)
  const [expandedLogs, setExpandedLogs] = useState(false)
  const [drawLogs, setDrawLogs] = useState([])
  const [name, setName] = useState(getDeviceName())
  const [nameSaved, setNameSaved] = useState(!!getDeviceName())

  const loadReport = useCallback(async () => {
    setLoading(true)
    try {
      const deviceId = getDeviceId()
      const [foods, pityData, logs] = await Promise.all([
        fetchFoods(),
        fetchPity(deviceId),
        fetchDrawLogs(deviceId),
      ])
      const foodsWithDist = calculateGachaDistribution(foods)
      const r = generateProbabilityReport(foodsWithDist, pityData)
      setReport(r)
      setDrawLogs(logs)
    } catch (e) {
      console.error('加载概率数据失败:', e)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadReport()
      setName(getDeviceName())
      setNameSaved(!!getDeviceName())
    }
  }, [isOpen, loadReport])

  const handleSaveName = () => {
    if (name.trim()) {
      setDeviceName(name.trim())
      setNameSaved(true)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-lg max-h-[85vh] bg-white rounded-t-ios-lg sm:rounded-ios-lg shadow-2xl overflow-hidden flex flex-col"
        >
          {/* 顶部装饰 */}
          <div className="h-1.5 flex-shrink-0" style={{ background: 'linear-gradient(90deg, #FFD700, #C0C0C0, #CD7F32)' }} />

          {/* 头部 */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-ios-gray-6 flex-shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-ios-text">概率公示</h2>
              <p className="text-xs text-ios-text-secondary mt-0.5">抽卡系统透明公开</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={loadReport} className="w-8 h-8 rounded-full bg-ios-gray-6 flex items-center justify-center hover:bg-ios-gray-5 transition-colors" title="刷新数据">
                <RotateCcw className="w-4 h-4 text-ios-text-secondary" />
              </button>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-ios-gray-6 flex items-center justify-center hover:bg-ios-gray-5 transition-colors">
                <X className="w-4 h-4 text-ios-text-secondary" />
              </button>
            </div>
          </div>

          {/* 内容 */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-warm-orange border-t-transparent rounded-full animate-spin" />
              </div>
            ) : report ? (
              <>
                {/* 用户昵称设置 */}
                <section className="bg-ios-gray-6 rounded-ios-sm p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-ios-text-secondary" />
                    <span className="text-sm font-medium text-ios-text">你的昵称</span>
                    <span className="text-[10px] text-ios-text-secondary">（用于区分保底计数）</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={e => { setName(e.target.value); setNameSaved(false) }}
                      placeholder="输入你的昵称"
                      className="ios-input flex-1 text-sm py-2"
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={nameSaved || !name.trim()}
                      className={`px-3 py-2 rounded-ios text-sm font-medium transition-all ${
                        nameSaved ? 'bg-ios-green text-white' : 'bg-warm-orange text-white hover:bg-warm-orange-dark'
                      }`}
                    >
                      {nameSaved ? '已保存' : '保存'}
                    </button>
                  </div>
                </section>

                {/* 品级概率分布 */}
                <section>
                  <h3 className="text-sm font-semibold text-ios-text mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-warm-orange" />
                    品级概率分布
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {['gold', 'silver', 'bronze'].map(tier => {
                      const cfg = TIER_CONFIG[tier]
                      const stat = report.tierStats[tier]
                      return (
                        <div key={tier} className="rounded-ios-sm p-3 text-center" style={{ border: `1.5px solid ${cfg.borderColor}40`, background: `${cfg.borderColor}08` }}>
                          <div className="text-xs font-medium mb-1" style={{ color: cfg.borderColor }}>{cfg.name} · {cfg.label}</div>
                          <div className="text-lg font-bold text-ios-text">{(stat.totalProb * 100).toFixed(1)}%</div>
                          <div className="text-[10px] text-ios-text-secondary mt-0.5">{stat.foods.length} 道菜</div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3 p-3 bg-ios-gray-6 rounded-ios-xs text-xs text-ios-text-secondary space-y-1">
                    <p><span style={{ color: '#FFD700' }}>●</span> 金卡(SSR)：概率 {report.tierRanges.gold}（稀有）</p>
                    <p><span style={{ color: '#C0C0C0' }}>●</span> 银卡(SR)：概率 {report.tierRanges.silver}（普通稀有）</p>
                    <p><span style={{ color: '#CD7F32' }}>●</span> 铜卡(R)：概率 {report.tierRanges.bronze}（常见）</p>
                  </div>
                </section>

                {/* 保底状态 */}
                <section>
                  <h3 className="text-sm font-semibold text-ios-text mb-3">保底计数状态</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-ios-gray-6 rounded-ios-sm p-3">
                      <p className="text-xs text-ios-text-secondary mb-1">距银卡保底</p>
                      <p className="text-xl font-bold text-ios-text">{Math.max(0, 10 - report.pity.pulls_since_last_4star)} <span className="text-xs font-normal text-ios-text-secondary">抽</span></p>
                      <p className="text-[10px] text-ios-text-secondary">10抽内必出银卡+</p>
                    </div>
                    <div className="bg-ios-gray-6 rounded-ios-sm p-3">
                      <p className="text-xs text-ios-text-secondary mb-1">距金卡保底</p>
                      <p className="text-xl font-bold text-ios-text">{Math.max(0, 50 - report.pity.pulls_since_last_5star)} <span className="text-xs font-normal text-ios-text-secondary">抽</span></p>
                      <p className="text-[10px] text-ios-text-secondary">50抽内必出金卡</p>
                    </div>
                  </div>
                  <p className="text-xs text-ios-text-secondary mt-2 text-center">累计抽取 <span className="font-medium text-ios-text">{report.pity.total_pulls}</span> 次</p>
                </section>

                {/* 公式说明 */}
                <section>
                  <button onClick={() => setExpandedFormula(!expandedFormula)} className="w-full flex items-center justify-between py-2 text-sm font-semibold text-ios-text">
                    <span className="flex items-center gap-2"><Info className="w-4 h-4 text-warm-orange" />概率计算公式</span>
                    {expandedFormula ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <AnimatePresence>
                    {expandedFormula && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="bg-ios-gray-6 rounded-ios-xs p-3 text-xs text-ios-text-secondary space-y-2">
                          <p className="font-medium text-ios-text">{report.formula.description}</p>
                          {report.formula.steps.map((step, i) => <p key={i}>{step}</p>)}
                          <div className="pt-2 border-t border-ios-gray-5">
                            <p>温度参数 T = {report.formula.temperature}</p>
                            <p>特征权重：价格({report.formula.weights.price})、热量({report.formula.weights.calories})、甜度({report.formula.weights.sweetness})、辣度({report.formula.weights.spiciness})、稀有度({report.formula.weights.rarity})</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>

                {/* 全部美食概率明细 */}
                <section>
                  <button onClick={() => setExpandedFoods(!expandedFoods)} className="w-full flex items-center justify-between py-2 text-sm font-semibold text-ios-text">
                    <span>全部美食概率明细</span>
                    {expandedFoods ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <AnimatePresence>
                    {expandedFoods && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {report.foods.map((food, i) => {
                            const cfg = TIER_CONFIG[food.gacha_tier]
                            return (
                              <div key={food.id || i} className="flex items-center gap-3 p-2 rounded-ios-xs bg-ios-gray-6">
                                <span className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: cfg.gradient }}>
                                  <Star className="w-3 h-3 text-white fill-current" />
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-ios-text truncate">{food.name}</p>
                                  <p className="text-[10px] text-ios-text-secondary">{cfg.name} · {cfg.label}</p>
                                </div>
                                <span className="text-xs font-mono font-medium text-ios-text">{(food.gacha_prob * 100).toFixed(2)}%</span>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>

                {/* 抽卡历史记录 */}
                <section>
                  <button onClick={() => setExpandedLogs(!expandedLogs)} className="w-full flex items-center justify-between py-2 text-sm font-semibold text-ios-text">
                    <span className="flex items-center gap-2"><History className="w-4 h-4 text-ios-text-secondary" />我的抽卡记录</span>
                    {expandedLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <AnimatePresence>
                    {expandedLogs && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        {drawLogs.length === 0 ? (
                          <p className="text-xs text-ios-text-secondary py-3 text-center">暂无抽卡记录</p>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {drawLogs.map((log, i) => {
                              const cfg = TIER_CONFIG[log.tier] || TIER_CONFIG.bronze
                              const time = new Date(log.drawn_at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                              return (
                                <div key={log.id || i} className="flex items-center gap-3 p-2 rounded-ios-xs bg-ios-gray-6">
                                  <span className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: cfg.gradient }}>
                                    <Star className="w-2.5 h-2.5 text-white fill-current" />
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-ios-text truncate">{log.food_name}</p>
                                    <p className="text-[10px] text-ios-text-secondary">{cfg.name} · {cfg.label}</p>
                                  </div>
                                  <span className="text-[10px] text-ios-text-secondary flex-shrink-0">{time}</span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              </>
            ) : (
              <p className="text-center text-ios-text-secondary py-8">暂无数据</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
