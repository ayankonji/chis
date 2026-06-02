import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload, Loader2, Camera, Flame, Candy, Thermometer } from 'lucide-react'
import { createFood, fetchFood, editFood } from '../utils/api'

const CATEGORIES = ['中餐', '西餐', '日料', '韩料', '泰料', '甜点', '饮品', '轻食', '快餐', '其他']
const TEMPERATURES = ['热', '冰', '常温']

export default function AddPage({ editMode = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [form, setForm] = useState({
    name: '',
    price: '',
    calories: '',
    sweetness: 0,
    spiciness: 0,
    temperature: '热',
    category: '中餐',
    description: '',
    image: '',
  })

  useEffect(() => {
    if (editMode && id) {
      setLoading(true)
      fetchFood(id).then(data => {
        if (data) {
          setForm({
            name: data.name || '',
            price: data.price || '',
            calories: data.calories || '',
            sweetness: data.sweetness || 0,
            spiciness: data.spiciness || 0,
            temperature: data.temperature || '热',
            category: data.category || '中餐',
            description: data.description || '',
            image: data.image || '',
          })
          setPreviewUrl(data.image || '')
        }
        setLoading(false)
      })
    }
  }, [editMode, id])

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setForm(prev => ({ ...prev, image: file }))
    }
  }

  const handleImageUrlChange = (e) => {
    const url = e.target.value
    setPreviewUrl(url)
    setForm(prev => ({ ...prev, image: url }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)

    const data = {
      name: form.name,
      price: Number(form.price) || 0,
      calories: Number(form.calories) || 0,
      sweetness: Number(form.sweetness),
      spiciness: Number(form.spiciness),
      temperature: form.temperature,
      category: form.category,
      description: form.description,
      image: typeof form.image === 'string' ? form.image : previewUrl,
    }

    if (editMode && id) {
      await editFood(id, data)
    } else {
      await createFood(data)
    }
    setSaving(false)
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 text-ios-blue animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pt-20 pb-12"
    >
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        {/* 头部 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white shadow-ios flex items-center justify-center text-ios-text hover:shadow-ios-hover transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold text-ios-text">
            {editMode ? '编辑美食' : '添加美食'}
          </h1>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* 图片上传 */}
          <div>
            <label className="block text-sm font-medium text-ios-text mb-2">美食图片</label>
            <div className="relative">
              {previewUrl ? (
                <div className="relative rounded-ios overflow-hidden aspect-video">
                  <img src={previewUrl} alt="预览" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setPreviewUrl(''); setForm(p => ({ ...p, image: '' })) }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-video rounded-ios border-2 border-dashed border-ios-gray-4 bg-ios-gray-6 cursor-pointer hover:border-ios-blue hover:bg-ios-blue/5 transition-all duration-300">
                  <Camera className="w-8 h-8 text-ios-gray mb-2" />
                  <span className="text-sm text-ios-text-secondary">点击上传图片</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
            {!previewUrl && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="或输入图片 URL"
                  value={typeof form.image === 'string' ? form.image : ''}
                  onChange={handleImageUrlChange}
                  className="ios-input text-sm"
                />
              </div>
            )}
          </div>

          {/* 名称 */}
          <div>
            <label className="block text-sm font-medium text-ios-text mb-2">美食名称 *</label>
            <input
              type="text"
              required
              placeholder="例如：红烧肉"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              className="ios-input"
            />
          </div>

          {/* 价格和热量 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ios-text mb-2">价格 (¥)</label>
              <input
                type="number"
                min="0"
                placeholder="38"
                value={form.price}
                onChange={e => handleChange('price', e.target.value)}
                className="ios-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ios-text mb-2">热量 (kcal)</label>
              <input
                type="number"
                min="0"
                placeholder="520"
                value={form.calories}
                onChange={e => handleChange('calories', e.target.value)}
                className="ios-input"
              />
            </div>
          </div>

          {/* 分类和温度 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ios-text mb-2">分类</label>
              <select
                value={form.category}
                onChange={e => handleChange('category', e.target.value)}
                className="ios-input appearance-none"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ios-text mb-2">温度</label>
              <div className="flex gap-2">
                {TEMPERATURES.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleChange('temperature', t)}
                    className={`flex-1 py-3 rounded-ios text-sm font-medium transition-all duration-300 ${
                      form.temperature === t
                        ? 'bg-ios-blue text-white shadow-ios-button'
                        : 'bg-white text-ios-text-secondary shadow-ios hover:text-ios-text'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 甜度 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-ios-text mb-2">
              <Candy className="w-4 h-4 text-ios-pink" />
              甜度
            </label>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleChange('sweetness', v)}
                  className={`flex-1 py-2.5 rounded-ios text-sm font-medium transition-all duration-300 ${
                    form.sweetness === v
                      ? 'bg-ios-pink text-white shadow-md'
                      : 'bg-white text-ios-text-secondary shadow-ios hover:text-ios-text'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* 辣度 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-ios-text mb-2">
              <Flame className="w-4 h-4 text-ios-red" />
              辣度
            </label>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleChange('spiciness', v)}
                  className={`flex-1 py-2.5 rounded-ios text-sm font-medium transition-all duration-300 ${
                    form.spiciness === v
                      ? 'bg-ios-red text-white shadow-md'
                      : 'bg-white text-ios-text-secondary shadow-ios hover:text-ios-text'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-ios-text mb-2">简介</label>
            <textarea
              rows={3}
              placeholder="简单描述一下这道美食..."
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              className="ios-input resize-none"
            />
          </div>

          {/* 提交按钮 */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={saving || !form.name.trim()}
            className="w-full ios-button py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                {editMode ? '保存修改' : '添加美食'}
              </>
            )}
          </motion.button>
        </motion.form>
      </div>
    </motion.div>
  )
}
