// ============================================
// 设备ID + 设备昵称管理
// ============================================

const DEVICE_ID_KEY = 'chis_device_id'
const DEVICE_NAME_KEY = 'chis_device_name'

// 获取或生成设备ID
export function getDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY)
  if (!deviceId) {
    deviceId = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
  }
  return deviceId
}

// 获取设备昵称（首次返回空字符串，需用户设置）
export function getDeviceName() {
  return localStorage.getItem(DEVICE_NAME_KEY) || ''
}

// 设置设备昵称
export function setDeviceName(name) {
  localStorage.setItem(DEVICE_NAME_KEY, name)
}
