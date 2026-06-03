import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import { adminLogin } from '../utils/admin'

export default function AdminLoginModal({ isOpen, onClose, onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await adminLogin(username.trim(), password)
      if (res.success) {
        setUsername('')
        setPassword('')
        onSuccess?.()
      } else {
        setError(res.error || '登录失败')
      }
    } catch {
      setError('网络错误，请重试')
    }
    setLoading(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          onClick={onClose}
        >
          {/* 遮罩 */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* 弹窗 */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-sm bg-white rounded-ios-lg shadow-2xl overflow-hidden"
          >
            {/* 顶部装饰 */}
            <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #FFD700, #FF7F32, #FFD700)' }} />

            <div className="p-6">
              {/* 关闭按钮 */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-ios-gray-6 flex items-center justify-center hover:bg-ios-gray-5 transition-colors"
              >
                <X className="w-4 h-4 text-ios-text-secondary" />
              </button>

              {/* 标题 */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}
                >
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-ios-text">管理员验证</h2>
                <p className="text-sm text-ios-text-secondary mt-1">编辑或删除美食需要管理员权限</p>
              </div>

              {/* 表单 */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ios-text mb-1.5">用户名</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="请输入管理员用户名"
                    className="ios-input"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ios-text mb-1.5">密码</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="请输入密码"
                      className="ios-input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ios-text-secondary hover:text-ios-text"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-ios-red text-center"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full ios-button py-3 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    '验证身份'
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
