import { useEffect, useRef } from 'react'

const COLORS = ['#00f5ff', '#39ff14', '#ff00ff', '#ffe000', '#ffffff', '#ff6600']

export default function StarField() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.2,
      speed: Math.random() * 0.35 + 0.04,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      phase: Math.random() * Math.PI * 2,
    }))

    let raf
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const t = performance.now() / 1000
      for (const s of stars) {
        const alpha = 0.3 + 0.7 * Math.abs(Math.sin(t * 0.7 + s.phase))
        ctx.globalAlpha = alpha
        ctx.shadowBlur = 4
        ctx.shadowColor = s.color
        ctx.fillStyle = s.color
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
        s.y += s.speed
        if (s.y > canvas.height) {
          s.y = -2
          s.x = Math.random() * canvas.width
        }
      }
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
