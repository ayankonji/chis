// ============================================
// 设备ID管理 - 用于保底计数追踪
// 首次访问生成随机UUID存入localStorage，同一浏览器持久化
// ============================================

const DEVICE_ID_KEY = 'chis_device_id'

export function getDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY)
  if (!deviceId) {
    deviceId = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
  }
  return deviceId
}
