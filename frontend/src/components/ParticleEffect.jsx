import { useEffect, useRef } from 'react'

// 粒子特效组件 - 根据品级渲染不同颜色的粒子
export default function ParticleEffect({ tier = 'bronze', active = false, className = '' }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    if (!active || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.parentElement.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // 品级配色
    const colorMap = {
      gold: ['#FFD700', '#FFA500', '#FFEC8B', '#FFF8DC'],
      silver: ['#C0C0C0', '#E8E8E8', '#A8A8A8', '#F5F5F5'],
      bronze: ['#CD7F32', '#E8A862', '#8B5A2B', '#D2B48C'],
    }
    const colors = colorMap[tier] || colorMap.bronze

    // 粒子数量：金卡最多
    const countMap = { gold: 40, silver: 25, bronze: 15 }
    const count = countMap[tier] || 15

    // 粒子数组
    const particles = Array.from({ length: count }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.6,
      y: canvas.height / 2 + (Math.random() - 0.5) * canvas.height * 0.3,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 3 - 1,
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: 0.008 + Math.random() * 0.012,
      shape: Math.random() > 0.5 ? 'circle' : 'star',
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
    }))

    function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, rotation) {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rotation)
      ctx.beginPath()
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const angle = (i * Math.PI) / spikes - Math.PI / 2
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.restore()
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      let aliveCount = 0
      for (const p of particles) {
        if (p.alpha <= 0) continue
        aliveCount++

        p.x += p.vx
        p.y += p.vy
        p.vy += 0.02 // 微弱重力
        p.alpha -= p.decay
        p.rotation += p.rotationSpeed

        ctx.globalAlpha = Math.max(0, p.alpha)

        if (p.shape === 'star') {
          drawStar(ctx, p.x, p.y, 4, p.size, p.size * 0.5, p.rotation)
          ctx.fillStyle = p.color
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.fill()
        }

        // 发光效果
        if (tier === 'gold' && p.alpha > 0.3) {
          ctx.globalAlpha = p.alpha * 0.3
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.fill()
        }
      }

      ctx.globalAlpha = 1

      if (aliveCount > 0) {
        animRef.current = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [active, tier])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-20 ${className}`}
    />
  )
}
