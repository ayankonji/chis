// ============================================
// 图片压缩工具
// 将上传的图片压缩到目标大小（默认500KB）
// 保持宽高比，最大边限制1200px
// ============================================

const MAX_EDGE = 1200 // 最大边长（px）

/**
 * 压缩图片到目标大小
 * @param {File} file - 原始图片文件
 * @param {number} maxSizeKB - 目标大小（KB），默认500
 * @returns {Promise<Blob>} 压缩后的图片Blob
 */
export async function compressImage(file, maxSizeKB = 500) {
  const maxSizeBytes = maxSizeKB * 1024

  // 1. 加载图片
  const bitmap = await createImageBitmap(file)

  // 2. 计算缩放尺寸（保持宽高比，最大边限制）
  let { width, height } = bitmap
  if (width > MAX_EDGE || height > MAX_EDGE) {
    const ratio = Math.min(MAX_EDGE / width, MAX_EDGE / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  // 3. 绘制到 Canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close() // 释放内存

  // 4. 二分法寻找合适的 quality
  let low = 0.1
  let high = 0.95
  let bestBlob = null

  // 先尝试最高质量
  bestBlob = await canvasToBlob(canvas, high)
  if (bestBlob.size <= maxSizeBytes) {
    return bestBlob
  }

  // 最低质量也超过目标，直接返回
  bestBlob = await canvasToBlob(canvas, low)
  if (bestBlob.size > maxSizeBytes) {
    return bestBlob
  }

  // 二分法迭代
  for (let i = 0; i < 8; i++) {
    const mid = (low + high) / 2
    const blob = await canvasToBlob(canvas, mid)
    if (blob.size <= maxSizeBytes) {
      bestBlob = blob
      low = mid
    } else {
      high = mid
    }
  }

  return bestBlob
}

/**
 * Canvas 转 Blob（Promise 封装）
 */
function canvasToBlob(canvas, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      'image/jpeg',
      quality
    )
  })
}

/**
 * Blob 转 Base64（Promise 封装）
 */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
