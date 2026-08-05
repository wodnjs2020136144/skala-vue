<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import {
  computeFogFrame,
  computeRainFrame,
  computeSnowFrame,
  createFogLayers,
  createRainDrops,
  createSnowFlakes,
} from '../../../utils/pixelWeatherFrames'

const props = defineProps({
  condition: {
    type: String,
    default: 'sun', // sun | cloud | rain | snow | thunderstorm | fog
  },
  size: {
    type: String,
    default: 'lg', // sm | md | lg
  },
  animated: {
    type: Boolean,
    default: true,
  },
  colored: {
    type: Boolean,
    default: true,
  },
})

// 도트 수를 늘려(18→36) 더 둥글고 세밀한 모양을 표현할 수 있게 한다.
const GRID = 36
const CELL_COUNT = GRID * GRID

// 매 프레임 그대로 재사용하는 랜덤 지연값 — 옛날 LED판 특유의 "완벽하지 않은" 깜빡임 표현용.
const JITTER = Array.from({ length: CELL_COUNT }, () => Math.random() * 0.3)

function isInsideCircle(x, y, cx, cy, r) {
  const dx = x - cx
  const dy = y - cy
  return dx * dx + dy * dy <= r * r
}

function isInsideEllipse(x, y, cx, cy, rx, ry) {
  const dx = (x - cx) / rx
  const dy = (y - cy) / ry
  return dx * dx + dy * dy <= 1
}

function angularDiff(a, b) {
  const diff = Math.abs(a - b) % 360
  return diff > 180 ? 360 - diff : diff
}

// 점 (px,py)와 선분 (x1,y1)-(x2,y2) 사이의 최단 거리 — 두꺼운 지그재그 선(번개)을 그릴 때 쓴다.
function pointSegmentDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const lenSq = dx * dx + dy * dy
  let t = lenSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  const projX = x1 + t * dx
  const projY = y1 + t * dy
  return Math.hypot(px - projX, py - projY)
}

function emptyDots() {
  return Array.from({ length: CELL_COUNT }, () => ({ lit: false, role: null }))
}

// 해: 중심 원(노랑) + 8방향 광선(주황→빨강 그러데이션). 이 조합은 반응이 좋아 그대로 유지한다.
function buildSun() {
  const center = GRID / 2
  const rayAngles = [0, 45, 90, 135, 180, 225, 270, 315]
  return Array.from({ length: CELL_COUNT }, (_, index) => {
    const x = index % GRID
    const y = Math.floor(index / GRID)
    const dx = x - center
    const dy = y - center
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist <= 9) return { lit: true, role: 'core', color: '#ffd24a' }
    if (dist > 10 && dist <= 16.6) {
      const angle = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360
      // 광선 안쪽 끝과 바깥쪽 끝은 가늘고, 중간이 가장 굵어지도록 허용 각도를 테이퍼링한다.
      const normalizedDist = (dist - 10) / (16.6 - 10)
      const taper = Math.sin(Math.max(0, Math.min(1, normalizedDist)) * Math.PI)
      const tolerance = 1.5 + 4.5 * taper
      const onRay = rayAngles.some((a) => angularDiff(angle, a) <= tolerance)
      if (onRay) {
        const color = dist <= 13.2 ? '#ff9a3c' : '#e8432e'
        return { lit: true, role: 'ray', delay: (dist - 10) * 0.06, color }
      }
    }
    return { lit: false, role: null }
  })
}

// 구름: 참고 이미지(전형적인 픽셀아트 구름 아이콘)처럼, 옆으로 넓고 납작한 밑변 위에
// 크기가 제각각인 둥근 돌기 4개를 얹어 윗면이 뚜렷하게 울퉁불퉁한 실루엣을 만든다.
const CLOUD_BASE = { cx: 18, cy: 22, rx: 14, ry: 7 }
const CLOUD_PUFFS = [
  { cx: 8, cy: 16, r: 5.5 },
  { cx: 14, cy: 11.5, r: 6 },
  { cx: 22, cy: 10, r: 7 },
  { cx: 28, cy: 15, r: 5 },
]
function buildCloudBlob(color = '#c7d0d3') {
  return Array.from({ length: CELL_COUNT }, (_, index) => {
    const x = index % GRID
    const y = Math.floor(index / GRID)
    const inCloud =
      isInsideEllipse(x, y, CLOUD_BASE.cx, CLOUD_BASE.cy, CLOUD_BASE.rx, CLOUD_BASE.ry) ||
      CLOUD_PUFFS.some((c) => isInsideCircle(x, y, c.cx, c.cy, c.r))
    return inCloud ? { lit: true, role: 'blob', delay: x * 0.04, color } : { lit: false, role: null }
  })
}

// 프레임마다 그리드를 새로 계산하는 조건(비/눈/안개) 공통 헬퍼 — 특정 칸의 밝기를
// 다른 요소가 이미 더 밝게 켜놨다면 덮어쓰지 않고 더 밝은 값을 유지한다.
function applyDot(dots, x, y, opacity, color, role) {
  if (x < 0 || x >= GRID || y < 0 || y >= GRID || opacity <= 0.02) return
  const index = y * GRID + x
  if (!dots[index].lit || opacity > dots[index].opacity) {
    dots[index] = { lit: true, role, color, opacity }
  }
}

// 비/눈/안개 프레임 계산 자체(RAINDROP_SHAPE 등 포함)는 utils/pixelWeatherFrames.js로 뺐다
// — 지도의 날씨 파티클 오버레이(KoreaMapDots.vue)가 같은 계산을 재사용한다. 입자 배열
// (RAIN_DROPS 등)은 인스턴스마다 새로 만들어서, 아이콘 여러 개가 동시에 떠 있어도 서로
// 다른 타이밍으로 움직이던 기존 동작을 유지한다.
const RAIN_DROPS = createRainDrops()
function buildRainFrame(frame) {
  const dots = emptyDots()
  computeRainFrame(frame, (x, y, opacity, color) => applyDot(dots, x, y, opacity, color, 'drop'), RAIN_DROPS)
  return dots
}

const SNOW_FLAKES = createSnowFlakes()
function buildSnowFrame(frame) {
  const dots = emptyDots()
  computeSnowFrame(frame, (x, y, opacity, color) => applyDot(dots, x, y, opacity, color, 'flake'), SNOW_FLAKES)
  return dots
}

// 뇌우: 굵고 큰 지그재그 번개 하나가 화면 대부분을 가로지르며, 위→아래 순서로 그어지듯
// 번쩍인 뒤 길게 어두워진다. 양 끝은 가늘고 가운데로 갈수록 굵어지는 창(槍) 모양으로 만든다.
const BOLT_POINTS = [
  [21, 3],
  [15, 17],
  [22, 18],
  [12, 33],
]
const BOLT_SEG_LENGTHS = BOLT_POINTS.slice(0, -1).map(([x1, y1], i) => {
  const [x2, y2] = BOLT_POINTS[i + 1]
  return Math.hypot(x2 - x1, y2 - y1)
})
const BOLT_TOTAL_LENGTH = BOLT_SEG_LENGTHS.reduce((sum, len) => sum + len, 0)
const BOLT_MIN_HALF_WIDTH = 0.5
const BOLT_MAX_HALF_WIDTH = 2.3
function buildThunderstorm() {
  const dots = emptyDots()
  const color = '#fff3c0'
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      let bestDist = Infinity
      let bestPos = 0
      let cumLength = 0
      BOLT_POINTS.slice(0, -1).forEach(([x1, y1], i) => {
        const [x2, y2] = BOLT_POINTS[i + 1]
        const segLen = BOLT_SEG_LENGTHS[i]
        const dist = pointSegmentDistance(x, y, x1, y1, x2, y2)
        if (dist < bestDist) {
          const dx = x2 - x1
          const dy = y2 - y1
          const t = segLen === 0 ? 0 : ((x - x1) * dx + (y - y1) * dy) / (segLen * segLen)
          bestDist = dist
          bestPos = cumLength + Math.max(0, Math.min(1, t)) * segLen
        }
        cumLength += segLen
      })
      const normalizedPos = bestPos / BOLT_TOTAL_LENGTH
      const taper = Math.sin(normalizedPos * Math.PI)
      const halfWidth = BOLT_MIN_HALF_WIDTH + (BOLT_MAX_HALF_WIDTH - BOLT_MIN_HALF_WIDTH) * taper
      if (bestDist <= halfWidth) {
        dots[y * GRID + x] = { lit: true, role: 'bolt', color, delay: y * 0.012 }
      }
    }
  }
  return dots
}

const FOG_LAYERS = createFogLayers()
function buildFogFrame(frame) {
  const dots = emptyDots()
  computeFogFrame(frame, (x, y, opacity, color) => applyDot(dots, x, y, opacity, color, 'fog'), FOG_LAYERS)
  return dots
}

const patternBuilders = {
  sun: buildSun,
  cloud: () => buildCloudBlob(),
  thunderstorm: buildThunderstorm,
}
// 프레임에 따라 매번 다시 계산해야 하는 조건 — 이 셋만 아래 imperative 애니메이션 루프의 대상이다.
const FRAME_DRIVEN_CONDITIONS = new Set(['rain', 'snow', 'fog'])

// dots는 이제 condition에만 의존한다(frame에는 의존하지 않는다) — 비/눈/안개도 항상 프레임 0
// 기준의 "초기 정적 렌더"만 만들고, 실제 애니메이션은 아래 imperative 루프가 DOM에 직접
// 써서 처리한다. 그 결과 setInterval이 돌아도 이 computed가 다시 실행되는 일이 아예 없다
// (KoreaMapDots.vue에서 이미 검증한 것과 같은 최적화: 수백~천 개 넘는 요소를 Vue 반응형으로
// 매 프레임 다시 diff하는 대신, 실제로 바뀌는 요소만 DOM에 직접 쓴다).
const dots = computed(() => {
  if (props.condition === 'rain') return buildRainFrame(0)
  if (props.condition === 'snow') return buildSnowFrame(0)
  if (props.condition === 'fog') return buildFogFrame(0)
  return (patternBuilders[props.condition] ?? patternBuilders.sun)()
})

// --- 애니메이션 imperative 루프 (비/눈/안개 + animated=true일 때만) ---
const rootRef = ref(null)
let dotElements = []
async function refreshDotElements() {
  await nextTick()
  if (!rootRef.value) return
  dotElements = Array.from(rootRef.value.querySelectorAll('.dot-matrix__dot'))
}

let frameCount = 0
let timer = null
let scratchOpacity = new Float32Array(0)
let scratchColor = []
let prevTouched = []

function clearTouched() {
  for (const idx of prevTouched) {
    scratchOpacity[idx] = 0
    const el = dotElements[idx]
    if (el) {
      el.classList.remove('is-lit')
      el.style.removeProperty('opacity')
      el.style.removeProperty('--dot-color')
    }
  }
  prevTouched = []
}

function tickFrame() {
  frameCount += 1
  clearTouched()

  const touchedThisFrame = []
  const apply = (x, y, opacity, color) => {
    if (x < 0 || x >= GRID || y < 0 || y >= GRID || opacity <= 0.02) return
    const idx = y * GRID + x
    if (scratchOpacity[idx] === 0) touchedThisFrame.push(idx)
    if (opacity > scratchOpacity[idx]) {
      scratchOpacity[idx] = opacity
      scratchColor[idx] = color
    }
  }

  if (props.condition === 'rain') computeRainFrame(frameCount, apply, RAIN_DROPS)
  else if (props.condition === 'snow') computeSnowFrame(frameCount, apply, SNOW_FLAKES)
  else if (props.condition === 'fog') computeFogFrame(frameCount, apply, FOG_LAYERS)

  for (const idx of touchedThisFrame) {
    const el = dotElements[idx]
    if (!el) continue
    el.classList.add('is-lit')
    el.style.setProperty('--dot-color', props.colored ? scratchColor[idx] : '')
    el.style.opacity = scratchOpacity[idx]
  }
  prevTouched = touchedThisFrame
}

function stopAnimationLoop() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  clearTouched()
  scratchOpacity = new Float32Array(0)
  scratchColor = []
}

async function startAnimationLoopIfNeeded() {
  stopAnimationLoop()
  if (!props.animated || !FRAME_DRIVEN_CONDITIONS.has(props.condition)) return

  await refreshDotElements()
  frameCount = 0
  scratchOpacity = new Float32Array(CELL_COUNT)
  scratchColor = Array.from({ length: CELL_COUNT }, () => null)
  prevTouched = []
  timer = setInterval(tickFrame, 80)
}

// condition이 바뀌면 dots(computed)가 새 구조로 다시 렌더되므로, DOM 참조도 다시 캐시하고
// 루프를 재시작해야 한다. animated가 꺼지면(예: 홈 카드) 루프를 멈추고 정적 프레임만 보여준다.
// immediate:true라 setup 단계(마운트 전)에 한 번 동기 호출되지만, 이 함수는 async라
// refreshDotElements() 내부의 await nextTick()에서 잠깐 양보한 뒤 재개되므로, 실제 DOM
// 갱신(및 마운트)이 끝난 뒤에 dotElements를 캐시하게 된다 — KoreaMapDots.vue의
// refreshDotElements와 같은 패턴.
watch([() => props.condition, () => props.animated], startAnimationLoopIfNeeded, { immediate: true })

onUnmounted(() => {
  stopAnimationLoop()
})
</script>

<template>
  <div
    ref="rootRef"
    class="dot-matrix"
    :class="[`dot-matrix--${size}`, { 'dot-matrix--animated': animated }]"
    :style="{ gridTemplateColumns: `repeat(${GRID}, 1fr)` }"
  >
    <span
      v-for="(dot, index) in dots"
      :key="index"
      class="dot-matrix__dot"
      :class="[dot.lit && 'is-lit', dot.role && `dot-matrix__dot--${dot.role}`]"
      :style="
        dot.lit
          ? {
              '--dot-color': colored ? dot.color : undefined,
              opacity: dot.opacity ?? 1,
              animationDelay: dot.delay != null ? `${dot.delay + JITTER[index]}s` : undefined,
              animationDuration: dot.duration ? `${dot.duration}s` : undefined,
            }
          : {}
      "
    />
  </div>
</template>

<style scoped>
.dot-matrix {
  display: grid;
  gap: 1px;
  background: var(--panel);
  border-radius: 20px;
  padding: 14px;
  background-image: radial-gradient(circle, var(--dot-off) 30%, transparent 30%);
  background-size: 8px 8px;
  overflow: hidden;
}

.dot-matrix--lg {
  /* 컨테이너가 260px보다 좁으면(좁은 화면의 상세 페이지 등) 정사각형을 유지하며 줄어든다. */
  width: min(260px, 100%);
  aspect-ratio: 1;
  height: auto;
}

.dot-matrix--md {
  width: 150px;
  height: 150px;
  padding: 10px;
}

.dot-matrix--sm {
  width: 44px;
  height: 44px;
  gap: 0.5px;
  padding: 4px;
  border-radius: 10px;
}

.dot-matrix__dot {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--dot-off);
}

.dot-matrix__dot.is-lit {
  background: var(--dot-color, var(--dot-lit));
  box-shadow: 0 0 3px var(--dot-color, var(--dot-lit));
}

/* 해: 중심부 은은한 발광 + 광선이 중심에서 바깥으로 뻗어나가듯 순차 반짝임 (유지) */
.dot-matrix--animated .dot-matrix__dot--core.is-lit {
  animation: dot-breathe 2.2s ease-in-out infinite;
}
.dot-matrix--animated .dot-matrix__dot--ray.is-lit {
  animation: dot-shimmer 1.3s ease-in-out infinite;
}

/* 구름: 좌→우로 은은한 밝기 웨이브 */
.dot-matrix--animated .dot-matrix__dot--blob.is-lit {
  animation: dot-breathe 2.6s ease-in-out infinite;
}

/* 뇌우: 위→아래 순서로 짧게 그어지듯 번쩍인 뒤 길게 어두워짐 (구름 없음) */
.dot-matrix--animated .dot-matrix__dot--bolt.is-lit {
  animation: dot-strike 3s ease-out infinite;
}

@keyframes dot-breathe {
  0%,
  100% {
    opacity: 0.7;
    box-shadow: 0 0 2px var(--dot-color, var(--dot-lit));
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 8px var(--dot-color, var(--dot-lit));
  }
}

@keyframes dot-shimmer {
  0%,
  100% {
    opacity: 0.3;
    box-shadow: none;
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 10px var(--dot-color, var(--dot-lit));
  }
}

@keyframes dot-strike {
  0% {
    opacity: 0;
  }
  3% {
    opacity: 1;
    box-shadow: 0 0 12px var(--dot-color, var(--dot-lit));
  }
  6% {
    opacity: 0.2;
  }
  9% {
    opacity: 1;
    box-shadow: 0 0 14px var(--dot-color, var(--dot-lit));
  }
  16% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}
</style>
