/**
 * Canvas Gradient Background
 * - Theme aware (html[theme-mode])
 * - High DPI safe
 * - Auto resize
 * - Safe destroy
 */

const DPR = window.devicePixelRatio || 1
const TAU = Math.PI * 2

/* ===================== Theme ===================== */

const THEMES = {
  light: {
    bubbles: ['#E9E0F3', '#E4F9F8'],
    main: '#ffffff',
    alpha: 1,
    composite: 'source-over'
  },
  dark: {
    bubbles: ['#0d2a50', '#001450'],
    main: '#212e5c',
    alpha: 0.4,
    composite: 'screen'
  }
}

function getThemeMode() {
  return document.documentElement.getAttribute('theme-mode') || 'light'
}

/* ===================== Base Canvas ===================== */

class CanvasBase {
  constructor(container) {
    if (!container) throw new Error('GradientBackground: container is required')

    this.container = container
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')

    this.container.appendChild(this.canvas)

    this.handleResize = this.handleResize.bind(this)
    window.addEventListener('resize', this.handleResize)

    this.handleResize()
  }

  handleResize() {
    this.blurPadding = 360  // blur(60px) × 2，建议 >= blur × 2

    this.width = window.innerWidth + this.blurPadding
    this.height = window.innerHeight + this.blurPadding

    this.canvas.style.width = this.width + 'px'
    this.canvas.style.height = this.height + 'px'
    this.canvas.style.transform = `translate(${-this.blurPadding / 2}px, ${-this.blurPadding / 2}px)`

    this.canvas.width = this.width * DPR
    this.canvas.height = this.height * DPR
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  destroy() {
    window.removeEventListener('resize', this.handleResize)
    this.canvas.remove()
  }
}

/* ===================== Bubble ===================== */

let uid = 0

class Bubble {
  constructor(isMain = false) {
    this.id = ++uid
    this.isMain = isMain

    this.initGeometry()
    this.applyTheme()
  }

  initGeometry() {
    const w = window.innerWidth * DPR
    const h = window.innerHeight * DPR
    const max = Math.max(w, h)

    this.x0 = Math.random() * w
    this.y0 = Math.random() * h
    this.radius = this.isMain
      ? max / 8
      : Math.random() * max / 10 + max / 8

    this.orbit = Math.random() * max / 2
    this.angle = Math.random() * 360
    this.speed =
      (Math.random() * 0.3 + 0.05) *
      (Math.random() > 0.5 ? 1 : -1)
  }

  applyTheme() {
    const theme = THEMES[getThemeMode()]
    this.color = this.isMain
      ? theme.main
      : theme.bubbles[this.id % theme.bubbles.length]
  }

  update() {
    const rad = (this.angle * Math.PI) / 180
    this.x = this.x0 + Math.cos(rad) * this.orbit
    this.y = this.y0 + Math.sin(rad) * this.orbit
    this.angle += this.speed
  }

  draw(ctx) {
    this.update()
    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.arc(this.x, this.y, this.radius, 0, TAU)
    ctx.fill()
  }
}

/* ===================== Gradient Background ===================== */

export class GradientBackground extends CanvasBase {
  constructor(container, count = 30) {
    super(container)

    this.bubbles = []
    this.running = true

    for (let i = 0; i < count; i++) {
      this.bubbles.push(new Bubble(false))
    }
    this.bubbles.push(new Bubble(true))

    this.animate = this.animate.bind(this)

    this.setupThemeObserver()
    requestAnimationFrame(this.animate)
  }

  setupThemeObserver() {
    this.observer = new MutationObserver(() => {
      this.onThemeChange()
    })

    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['theme-mode']
    })
  }

  onThemeChange() {
    this.bubbles.forEach(b => b.applyTheme())
  }

  animate() {
    // if (!this.running) return
    //
    // const theme = THEMES[getThemeMode()]
    // const ctx = this.ctx
    //
    // ctx.save()
    // ctx.globalAlpha = theme.alpha
    // ctx.globalCompositeOperation = theme.composite
    //
    // this.clear()
    // this.bubbles.forEach(b => b.draw(ctx))
    //
    // ctx.restore()
    //
    // requestAnimationFrame(this.animate)
    if (!this.running) return

    const ctx = this.ctx
    const theme = THEMES[getThemeMode()]

    this.clear()

    ctx.save()

    // ⭐ 关键：Canvas 内部模糊，而不是 CSS
    ctx.filter = getThemeMode() === 'dark'
      ? 'blur(80px)'
      : 'blur(60px)'

    ctx.globalAlpha = theme.alpha
    ctx.globalCompositeOperation = theme.composite

    this.bubbles.forEach(b => b.draw(ctx))

    ctx.restore()

    requestAnimationFrame(this.animate)
  }

  stop() {
    this.running = false
    this.observer?.disconnect()
    this.destroy()
  }
}
