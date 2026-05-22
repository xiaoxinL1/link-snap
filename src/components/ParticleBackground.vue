<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId = 0
let ctx: CanvasRenderingContext2D | null = null
let particles: Particle[] = []

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  alphaDir: number
  hue: number
}

const PARTICLE_COUNT = 55
const CONNECTION_DIST = 100

function createParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    radius: Math.random() * 2.5 + 1,
    alpha: Math.random() * 0.5 + 0.15,
    alphaDir: Math.random() > 0.5 ? 0.003 : -0.003,
    hue: Math.random() * 40 + 260 + (Math.random() > 0.5 ? 0 : 160),
  }
}

function initParticles(w: number, h: number) {
  particles = Array.from({ length: PARTICLE_COUNT }, () => createParticle(w, h))
}

function draw(timestamp: number) {
  if (!ctx || !canvasRef.value) return
  const canvas = canvasRef.value
  const w = canvas.width
  const h = canvas.height

  ctx.clearRect(0, 0, w, h)

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]

    p.x += p.vx
    p.y += p.vy
    p.alpha += p.alphaDir

    if (p.alpha <= 0.1 || p.alpha >= 0.65) {
      p.alphaDir *= -1
    }

    if (p.x < -20) p.x = w + 20
    if (p.x > w + 20) p.x = -20
    if (p.y < -20) p.y = h + 20
    if (p.y > h + 20) p.y = -20

    const hue = p.hue + Math.sin(timestamp * 0.0003 + i) * 15

    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${hue}, 60%, 72%, ${p.alpha})`
    ctx.fill()

    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3)
    glow.addColorStop(0, `hsla(${hue}, 70%, 75%, ${p.alpha * 0.4})`)
    glow.addColorStop(1, 'transparent')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2)
    ctx.fill()

    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j]
      const dx = p.x - q.x
      const dy = p.y - q.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < CONNECTION_DIST) {
        const lineAlpha = (1 - dist / CONNECTION_DIST) * 0.08 * (p.alpha + q.alpha)
        const lineHue = (p.hue + q.hue) / 2
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(q.x, q.y)
        ctx.strokeStyle = `hsla(${lineHue}, 50%, 70%, ${lineAlpha})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
    }
  }

  animationId = requestAnimationFrame(draw)
}

function resize() {
  if (!canvasRef.value) return
  canvasRef.value.width = window.innerWidth
  canvasRef.value.height = window.innerHeight
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  resize()
  initParticles(canvas.width, canvas.height)
  animationId = requestAnimationFrame(draw)
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <canvas ref="canvasRef" class="particle-canvas" />
</template>

<style scoped>
.particle-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
</style>
