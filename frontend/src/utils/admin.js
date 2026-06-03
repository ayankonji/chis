// ============================================
// 管理员鉴权工具（明文密码比对）
// ============================================

import { fetchAdminConfig } from './api'

const ADMIN_AUTH_KEY = 'chis_admin_auth'

// 管理员登录验证（明文比对，不加密）
export async function adminLogin(username, password) {
  const configs = await fetchAdminConfig(username)

  if (!configs || configs.length === 0) {
    return { success: false, error: '用户名不存在' }
  }

  const config = configs[0]
  if (config.password === password) {
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
