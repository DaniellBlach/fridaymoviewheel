<template>
  <div class="movie-wheel-wrap">
    <div class="wheel-stage">
      <div class="wheel-rotor" :style="rotorStyle">
        <div class="wheel" :style="wheelBgStyle" role="img" aria-label="Movie wheel"></div>

        <div class="labels">
                  <div class="label" v-for="(m,i) in movies" :key="m.id" :style="labelStyle(i)">
                    <span class="labelText" :style="labelInnerStyle(i)">{{ displayedTitle(i) }}</span>
                  </div>
                </div>
      </div>

      <div class="marker">▼</div>
    </div>

    <div class="controls">
      <button class="pill-btn" @click="spin" :disabled="spinning">
              <span class="pill-label">Losuj film</span>
      </button>

    </div>

    <MovieModal v-model:open="modalOpen" :title="selected?.title" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import fetchMovies from './movieService'
import '../assets/movie-wheel.css'
import MovieModal from './MovieModal.vue'

const movies = ref(fetchMovies())
const spinning = ref(false)
const rotation = ref(0)
const selected = ref<{id:string;title:string} | null>(null)
const minSpin = 3000
const maxSpin = 15000
const currentDuration = ref(minSpin)
// keep rotation speed roughly same as before (~1.43 turns/sec)
const spinsPerSec = 1.4285714286

// modal state
const modalOpen = ref(false)

watch(modalOpen, (open) => {
  // lock body scroll when modal is open
  try { document.body.style.overflow = open ? 'hidden' : '' } catch (e) {}
})

onUnmounted(() => { try { document.body.style.overflow = '' } catch(e){} })

const sliceAngle = computed(() => (movies.value.length ? 360 / movies.value.length : 360))

function randInt(max: number) {
  return Math.floor(Math.random() * max)
}

function spin() {
  if (spinning.value || movies.value.length === 0) return
  const idx = randInt(movies.value.length)

  // pick random duration between minSpin and maxSpin
  const duration = Math.floor(Math.random() * (maxSpin - minSpin + 1)) + minSpin
  currentDuration.value = duration

  // compute turns so speed is roughly constant (turns/sec = spinsPerSec)
  const turns = spinsPerSec * (duration / 1000)

  const offset = (sliceAngle.value / 2)
  const randomOffset = (Math.random() - 0.5) * (sliceAngle.value * 0.6)

  rotation.value = turns * 360 + (idx * sliceAngle.value) + offset + randomOffset
  spinning.value = true
  selected.value = null
  setTimeout(() => {
    spinning.value = false
    // determine which slice is actually under the marker (top) after rotation
    const rot = ((rotation.value % 360) + 360) % 360
    const anglePer = sliceAngle.value || 360
    let bestIdx = 0
    let bestDist = 1e9
    for (let i = 0; i < movies.value.length; i++) {
      const mid = (i * anglePer + anglePer / 2) % 360
      let diff = Math.abs(((mid + rot) % 360 + 360) % 360)
      if (diff > 180) diff = 360 - diff
      if (diff < bestDist) { bestDist = diff; bestIdx = i }
    }
    const chosen = movies.value[bestIdx] ?? movies.value[0]
    if (chosen) {
      selected.value = chosen
      modalOpen.value = true
    }
  }, duration)
}
//const colors = ['#F4E409','#F1CF0A','#EEBA0B','#D9950A','#C36F09','#B55608','#A63C06','#8C1E03','#710000']
const colors = ['#F44336','#E91E63','#9C27B0','#3F51B5','#2196F3','#009688','#4CAF50','#FF9800','#FFC107','#795548']
const gradient = computed(() => {
  if (!movies.value.length) return '#ddd'
  return `conic-gradient(${movies.value.map((m, i) => `${colors[i % colors.length]} ${i * sliceAngle.value}deg ${(i + 1) * sliceAngle.value}deg`).join(',')})`
})

const rotorStyle = computed(() => ({
  transform: `rotate(${rotation.value}deg)`,
  transition: spinning.value ? `transform ${currentDuration.value}ms cubic-bezier(.1,.9,.2,1)` : 'none'
}))

const wheelBgStyle = computed(() => ({
  background: gradient.value,
  borderRadius: '50%'
}))

function labelStyle(index:number) {
  const angle = index * sliceAngle.value + sliceAngle.value / 2
  return {
    transform: `translate(-50%,-50%) rotate(${angle}deg) translateY(calc(-1 * var(--label-r) + 10px))`
  }
}

function labelInnerStyle(index:number) {
  const angle = index * sliceAngle.value + sliceAngle.value / 2
  const rotorRotation = (rotation.value % 360 + 360) % 360
  const abs = (angle + rotorRotation) % 360
  // rotate text so it runs along the slice; flip when upside-down for readability
  const textRot = (abs > 90 && abs < 270) ? -90 : 90
  return {
    transform: `rotate(${textRot}deg)`,
    display: 'inline-block'
  }
}

// Truncation helpers
let measureCtx: CanvasRenderingContext2D | null = null
function getMeasureCtx() {
  if (measureCtx) return measureCtx
  const c = document.createElement('canvas')
  measureCtx = c.getContext('2d')
  return measureCtx
}

function measureText(text:string, fontPx:number) {
  const ctx = getMeasureCtx()
  if (!ctx) return text.length * fontPx * 0.6
  ctx.font = `${fontPx}px system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial`
  return ctx.measureText(text).width
}

function availableLabelPx() {
  // compute label width from the slice chord, but leave enough room so long titles are not chopped to 3 chars
  try {
    const el = document.querySelector('.wheel-stage') as HTMLElement | null
    if (!el) return 120

    const st = getComputedStyle(el)
    const css = st.getPropertyValue('--label-r') || ''
    let r = null
    if (css.includes('px')) r = parseFloat(css)
    else r = el.clientWidth / 2 - 56

    const angle = sliceAngle.value || 360
    const half = (angle / 2) * Math.PI / 180
    const chord = 2 * r * Math.sin(half)
    return Math.max(90, Math.min(180, chord * 1.3))
  } catch (e) {
    return 120
  }
}

function truncateToWidth(text:string, maxPx:number, fontPx:number) {
  if (measureText(text, fontPx) <= maxPx) return text
  const ell = '…'
  let lo = 0, hi = text.length
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    const candidate = text.slice(0, mid) + ell
    if (measureText(candidate, fontPx) <= maxPx) lo = mid
    else hi = mid - 1
  }
  return text.slice(0, lo) + ell
}

function displayedTitle(index:number) {
  return movies.value[index]?.title || ''
}

</script>

