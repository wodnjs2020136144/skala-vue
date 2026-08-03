<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  condition: {
    type: String,
    default: 'sun', // sun | cloud | rain | snow | thunderstorm | fog
  },
  size: {
    type: String,
    default: 'lg', // sm | lg
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

// 매 프레임 그대로 재사용하는 랜덤 지연값 — 옛날 LED판 특유의 "완벽하지 않은" 깜빡임 표현용.
const JITTER = Array.from({ length: GRID * GRID }, () => Math.random() * 0.3)

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
  return Array.from({ length: GRID * GRID }, () => ({ lit: false, role: null }))
}

// 해: 중심 원(노랑) + 8방향 광선(주황→빨강 그러데이션). 이 조합은 반응이 좋아 그대로 유지한다.
function buildSun() {
  const center = GRID / 2
  const rayAngles = [0, 45, 90, 135, 180, 225, 270, 315]
  return Array.from({ length: GRID * GRID }, (_, index) => {
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
  return Array.from({ length: GRID * GRID }, (_, index) => {
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

// 비: 위는 뾰족하고 아래는 둥근 물방울 모양을 통째로 매 프레임 다시 그려서, 그 모양 그대로
// 아래로 떨어지게 한다. 방울마다 위치·속도·시작 타이밍을 랜덤하게 둬 불규칙하게 떨어지고,
// 한 칸에서 다음 칸으로 넘어갈 때 밝기를 섞어(crossfade) 매끄럽게 흐르는 느낌을 낸다.
const RAINDROP_SHAPE = [
  [0, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [-1, 2],
  [0, 2],
  [1, 2],
  [-2, 3],
  [-1, 3],
  [0, 3],
  [1, 3],
  [2, 3],
  [-2, 4],
  [-1, 4],
  [0, 4],
  [1, 4],
  [2, 4],
  [-1, 5],
  [0, 5],
  [1, 5],
]
const RAIN_DROPS = Array.from({ length: 9 }, () => ({
  x: 2 + Math.floor(Math.random() * (GRID - 4)),
  phase: Math.random() * 40,
  speed: 0.8 + Math.random() * 0.6,
}))
function buildRainFrame(frame) {
  const dots = emptyDots()
  const color = '#5b8fc7'
  const totalRows = GRID + 8
  RAIN_DROPS.forEach(({ x, phase, speed }) => {
    const exact = ((frame * speed + phase) % totalRows) - 6
    const row = Math.floor(exact)
    const frac = exact - row
    ;[
      [row, 1 - frac],
      [row + 1, frac],
    ].forEach(([cy, weight]) => {
      if (weight <= 0.02) return
      RAINDROP_SHAPE.forEach(([ox, oy]) => applyDot(dots, x + ox, cy + oy, weight, color, 'drop'))
    })
  })
  return dots
}

// 눈: 눈송이마다 속도·타이밍은 랜덤하게 두되, x 위치는 겹치지 않도록 일정 간격의 레인(lane)에
// 배정한 뒤 그 안에서만 살짝 흔들리게 해서 눈송이끼리 절대 겹치지 않게 한다.
// 팔 길이 2칸짜리 큰 "+"로 키운 만큼, 레인 수를 줄이고 간격을 넉넉히 둔다.
const SNOW_LANE_COUNT = 5
const SNOW_LANE_WIDTH = GRID / SNOW_LANE_COUNT
const SNOW_FLAKES = Array.from({ length: SNOW_LANE_COUNT }, (_, lane) => ({
  x: Math.round(SNOW_LANE_WIDTH / 2 + lane * SNOW_LANE_WIDTH),
  phase: Math.random() * 50,
  speed: 0.12 + Math.random() * 0.08,
}))
// 참고 이미지의 6~8방향 결정 눈송이처럼, 팔마다 끝에 작은 가지(flare)를 붙인 별 모양.
const SNOW_FLAKE_SHAPE = [
  [0, 0],
  // 오른쪽 팔 + 끝 가지
  [1, 0],
  [2, 0],
  [2, 1],
  [2, -1],
  // 왼쪽 팔 + 끝 가지
  [-1, 0],
  [-2, 0],
  [-2, 1],
  [-2, -1],
  // 아래쪽 팔 + 끝 가지
  [0, 1],
  [0, 2],
  [1, 2],
  [-1, 2],
  // 위쪽 팔 + 끝 가지
  [0, -1],
  [0, -2],
  [1, -2],
  [-1, -2],
  // 대각선 짧은 팔 4개
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
]
function buildSnowFrame(frame) {
  const dots = emptyDots()
  const color = '#dcf0fa'
  const totalRows = GRID + 4
  SNOW_FLAKES.forEach(({ x, phase, speed }) => {
    const exact = ((frame * speed + phase) % totalRows) - 2
    const row = Math.floor(exact)
    const frac = exact - row
    const sway = Math.sin((frame + phase * 10) * 0.02)
    const cx = x + Math.round(sway)
    ;[
      [row, 1 - frac],
      [row + 1, frac],
    ].forEach(([cy, weight]) => {
      if (weight <= 0.02) return
      SNOW_FLAKE_SHAPE.forEach(([ox, oy]) =>
        applyDot(dots, cx + ox, cy + oy, weight, color, 'flake'),
      )
    })
  })
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

// 안개: 넓고 납작한 가로 뭉치(층운) 여러 겹을 서로 다른 높이에 겹쳐 깔아, 실제 지면 안개처럼
// 화면 폭 대부분을 가로지르는 형태로 표현한다. 각 층은 서로 다른 주기로 나타났다 사라지고,
// 아주 천천히 좌우로 표류한다(모두 그 자리 그리드 칸의 밝기만 바뀌는 방식).
// 길이(rx)는 짧은 것부터 긴 것까지 제각각 랜덤하게 둬서 일정한 길이로 보이지 않게 한다.
const FOG_LAYER_ROWS = [8, 15, 22, 30]
const FOG_LAYERS = FOG_LAYER_ROWS.map((baseY, i) => {
  const ellipseCount = 1 + Math.round(Math.random())
  const ellipses = Array.from({ length: ellipseCount }, () => ({
    cx: Math.random() * GRID,
    cy: baseY + (Math.random() - 0.5) * 2,
    rx: 3 + Math.random() * 13,
    ry: 2 + Math.random() * 1.4,
  }))
  return { ellipses, phase: i * 14 + Math.random() * 8 }
})
const FOG_PERIOD = 60
function buildFogFrame(frame) {
  const dots = emptyDots()
  const color = '#a7acae'
  FOG_LAYERS.forEach((layer) => {
    const t = (frame + layer.phase) % FOG_PERIOD
    const opacity = Math.max(0, Math.sin((t / FOG_PERIOD) * Math.PI * 2))
    if (opacity <= 0.02) return
    const driftX = Math.sin((frame + layer.phase) * 0.02) * 2
    layer.ellipses.forEach((e) => {
      for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
          if (isInsideEllipse(x, y, e.cx + driftX, e.cy, e.rx, e.ry)) {
            applyDot(dots, x, y, opacity, color, 'fog')
          }
        }
      }
    })
  })
  return dots
}

const patternBuilders = {
  sun: buildSun,
  cloud: () => buildCloudBlob(),
  thunderstorm: buildThunderstorm,
}

// 비/눈/안개는 시간(frame)에 따라 그리드를 매번 다시 계산하는 방식이라 setInterval로 프레임을 흘려보낸다.
const frame = ref(0)
let timer = null
onMounted(() => {
  if (props.animated) {
    timer = setInterval(() => {
      frame.value += 1
    }, 80)
  }
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const dots = computed(() => {
  if (props.condition === 'rain') return buildRainFrame(frame.value)
  if (props.condition === 'snow') return buildSnowFrame(frame.value)
  if (props.condition === 'fog') return buildFogFrame(frame.value)
  return (patternBuilders[props.condition] ?? patternBuilders.sun)()
})
</script>

<template>
  <div
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
  width: 260px;
  height: 260px;
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
