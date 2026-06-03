import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload, Loader2, Flame, Candy, Thermometer, AlertCircle } from 'lucide-react'
import { createFood, fetchFood, editFood } from '../utils/api'
import { calculateGachaDistribution } from '../utils/gacha'

const CATEGORIES = ['中餐', '西餐', '日料', '韩料', '泰料', '甜点', '饮品', '轻食', '快餐', '其他']
const TEMPERATURES = ['热', '冷', '常温']

const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png']

export default function AddPage({ editMode = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [errors, setErrors] = useState({})
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
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next })
    }
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // 格式校验
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: '仅支持 JPG 和 PNG 格式的图片' }))
      e.target.value = ''
      return
    }

    // 大小校验
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      setErrors(prev => ({ ...prev, image: `图片大小 ${sizeMB}MB 超过限制，最大允许 15MB` }))
      e.target.value = ''
      return
    }

    // 清除错误
    if (errors.image) {
      setErrors(prev => { const next = { ...prev }; delete next.image; return next })
    }

    try {
      const base64 = await fileToBase64(file)
      setPreviewUrl(base64)
      setForm(prev => ({ ...prev, image: base64 }))
    } catch {
      setErrors(prev => ({ ...prev, image: '图片读取失败，请重试' }))
    }
  }

  // 表单校验
  const validate = () => {
    const newErrors = {}

    if (!form.name.trim()) {
      newErrors.name = '请输入美食名称'
    }

    const price = Number(form.price)
    if (!form.price && form.price !== 0) {
      newErrors.price = '请输入售价'
    } else if (isNaN(price) || price <= 0) {
      newErrors.price = '售价必须为正数'
    }

    const calories = Number(form.calories)
    if (form.calories && (isNaN(calories) || calories < 0)) {
      newErrors.calories = '卡路里不能为负数'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)

    const data = {
      name: form.name.trim(),
      price: Number(form.price) || 0,
      calories: Number(form.calories) || 0,
      sweetness: Number(form.sweetness),
      spiciness: Number(form.spiciness),
      temperature: form.temperature,
      category: form.category,
      description: form.description,
      image: form.image || previewUrl || '',
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
        <Loader2 className="w-8 h-8 text-warm-orange animate-spin" />
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
                <div className="relative rounded-ios overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="预览"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl('')
                      setForm(prev => ({ ...prev, image: '' }))
                    }}
                    className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/50 text-white text-xs backdrop-blur-md"
                  >
                    更换
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-ios-gray-4 rounded-ios cursor-pointer hover:border-warm-orange transition-colors">
                  <Upload className="w-8 h-8 text-ios-text-secondary mb-2" />
                  <span className="text-sm text-ios-text-secondary">点击上传图片</span>
                  <span className="text-xs text-ios-text-secondary mt-1">支持 JPG / PNG，最大 15MB</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
              {/* 已有图片时的文件选择 */}
              {previewUrl && (
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  id="image-replace"
                  onChange={handleImageChange}
                />
              )}
            </div>
            {errors.image && (
              <p className="flex items-center gap-1 mt-2 text-sm text-ios-red">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errors.image}
              </p>
            )}
          </div>

          {/* 名称 */}
          <div>
            <label className="block text-sm font-medium text-ios-text mb-2">美食名称</label>
            <input
              type="text"
              placeholder="红烧肉"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              className={`ios-input ${errors.name ? 'border-ios-red' : ''}`}
            />
            {errors.name && (
              <p className="flex items-center gap-1 mt-1.5 text-sm text-ios-red">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errors.name}
              </p>
            )}
          </div>

          {/* 价格和卡路里 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ios-text mb-2">售价 (¥)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="38"
                value={form.price}
                onChange={e => handleChange('price', e.target.value)}
                className={`ios-input ${errors.price ? 'border-ios-red' : ''}`}
              />
              {errors.price && (
                <p className="flex items-center gap-1 mt-1.5 text-xs text-ios-red">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  {errors.price}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-ios-text mb-2">热量 (kcal)</label>
              <input
                type="number"
                min="0"
                placeholder="520"
                value={form.calories}
                onChange={e => handleChange('calories', e.target.value)}
                className={`ios-input ${errors.calories ? 'border-ios-red' : ''}`}
              />
              {errors.calories && (
                <p className="flex items-center gap-1 mt-1.5 text-xs text-ios-red">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  {errors.calories}
                </p>
              )}
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
                        ? 'bg-warm-orange text-white shadow-md'
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
              <Candy className="w-4 h-4 text-warm-orange" />
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
                      ? 'bg-warm-orange text-white shadow-md'
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
              <Flame className="w-4 h-4 text-brick-red" />
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
                      ? 'bg-brick-red text-white shadow-md'
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
              placeholder="简单描述一下这道美食.."
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              className="ios-input resize-none"
            />
          </div>

          {/* 提交按钮 */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={saving}
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
