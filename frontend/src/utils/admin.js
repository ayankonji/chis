// ============================================
// 管理员鉴权工具
// SHA-256 哈希 + sessionStorage 会话管理
// ============================================

import { fetchAdminConfig } from './api'

const ADMIN_AUTH_KEY = 'chis_admin_auth'

// SHA-256 哈希
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// 管理员登录验证
export async function adminLogin(username, password) {
  const passwordHash = await sha256(password)
  const configs = await fetchAdminConfig(username)

  if (!configs || configs.length === 0) {
    return { success: false, error: '用户名不存在' }
  }

  const config = configs[0]
  if (config.password_hash === passwordHash) {
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true')
    return { success: true }
  }

  return { success: false, error: '密码错误' }
}

// 检查当前是否已登录
export function isAdminLoggedIn() {
  return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true'
}

// 管理员登出
export function adminLogout() {
  sessionStorage.removeItem(ADMIN_AUTH_KEY)
}
