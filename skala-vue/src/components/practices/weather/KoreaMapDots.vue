<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  cities: {
    type: Array,
    required: true, // { id, name, mapX, mapY, condition, windDeg, windSpeed }
  },
  selectedId: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['select-city'])

// 참고 이미지(한반도 도트 아트)를 픽셀 단위로 분석해 그대로 옮긴 매트릭스.
// 22x41 배열이며, 1이 육지다. 울릉도/독도/제주 등도 포함돼 있다.
const GRID_W = 22
const GRID_H = 41
const KOREA_MATRIX = [
  '0000000000000000011000',
  '0000000000000000011100',
  '0000000000000001111100',
  '0000000000000001111100',
  '0000000000011111110000',
  '0000000110001111110000',
  '0000000111111111110000',
  '0000001111111111110000',
  '0000001111111111110000',
  '0000111111111111110000',
  '0011111111111110000000',
  '0111111111111100000000',
  '1111111111111000000000',
  '1111111111100000000000',
  '0111111111100000000000',
  '0001111111100000000000',
  '0011111111100000000000',
  '0011111111110000000000',
  '0111111111111000000000',
  '0111111111111000000000',
  '1111111111111110000000',
  '1111111111111110000000',
  '0011001111111110000000',
  '0000000111111111001000',
  '0000000111111111000001',
  '0000011111111111000000',
  '0000011111111111000000',
  '0000001111111111000000',
  '0000000111111111000000',
  '0000000111111111100000',
  '0000001111111111100000',
  '0000001111111111000000',
  '0000011111111111000000',
  '0000011111111110000000',
  '0000011111111100000000',
  '0000011111100000000000',
  '0000011110000000000000',
  '0000000000000000000000',
  '0000000000000000000000',
  '0000001110000000000000',
  '0000011100000000000000',
]

// 도트 한 칸의 픽셀 크기 — 육지·바다 전체 그리드가 이 값 하나로 통일된다.
const DOT_PX = 14

// 날씨 조건별 마커 색상.
const CONDITION_COLORS = {
  sun: '#ffd24a',
  cloud: '#c7d0d3',
  rain: '#5b8fc7',
  snow: '#dcf0fa',
  thunderstorm: '#fff3c0',
  fog: '#a7acae',
}
function markerColor(condition) {
  return CONDITION_COLORS[condition] ?? CONDITION_COLORS.sun
}

const rootRef = ref(null)
const cols = ref(0)
const rows = ref(0)
const cellW = ref(DOT_PX)
const cellH = ref(DOT_PX)
const dots = ref([])
const hoveredDot = ref(null)

// col,row 키 -> dot 객체. 파동 계산 때마다 매번 배열을 훑지 않고 바로 찾기 위한 인덱스.
let dotsByKey = new Map()

function buildGrid(width, height) {
  const newCols = Math.max(1, Math.round(width / DOT_PX))
  const newRows = Math.max(1, Math.round(height / DOT_PX))
  cols.value = newCols
  rows.value = newRows
  // grid-template이 1fr 기반이라 실제 셀 크기가 DOT_PX와 살짝 다를 수 있어, 실측값을 보관해둔다.
  cellW.value = width / newCols
  cellH.value = height / newRows

  const koreaOffsetCol = Math.floor((newCols - GRID_W) / 2)
  const koreaOffsetRow = Math.floor((newRows - GRID_H) / 2)

  const cityByKey = new Map()
  props.cities.forEach((city) => {
    const localCol = Math.round(city.mapX * GRID_W - 0.5)
    const localRow = Math.round(city.mapY * GRID_H - 0.5)
    cityByKey.set(`${koreaOffsetCol + localCol},${koreaOffsetRow + localRow}`, city)
  })

  const newDots = []
  const newDotsByKey = new Map()

  for (let row = 0; row < newRows; row++) {
    for (let col = 0; col < newCols; col++) {
      const localCol = col - koreaOffsetCol
      const localRow = row - koreaOffsetRow
      const isLand =
        localCol >= 0 &&
        localCol < GRID_W &&
        localRow >= 0 &&
        localRow < GRID_H &&
        KOREA_MATRIX[localRow][localCol] === '1'

      const key = `${col},${row}`
      const dot = {
        col,
        row,
        index: row * newCols + col,
        isLand,
        city: cityByKey.get(key) ?? null,
      }
      newDots.push(dot)
      newDotsByKey.set(key, dot)
    }
  }

  dots.value = newDots
  dotsByKey = newDotsByKey
  refreshDotElements()
}

// v-for 렌더 순서는 dots.value(row-major)와 동일하므로, 실제 DOM 엘리먼트를
// dot.index로 바로 찾을 수 있게 한 번 수집해둔다. 파동 애니메이션이 이 배열에
// Vue 반응형을 거치지 않고 직접 style을 써서, 매 프레임 전체 그리드 재렌더를 피한다.
let dotElements = []
async function refreshDotElements() {
  await nextTick()
  if (!rootRef.value) return
  dotElements = Array.from(rootRef.value.querySelectorAll('.korea-map__dot'))
}

let resizeObserver = null
function handleResize(entries) {
  const entry = entries[0]
  if (!entry) return
  buildGrid(entry.contentRect.width, entry.contentRect.height)
}

// --- 커서 눌림 파동 ---
// 커서가 지나간 자리마다 "파동"을 하나씩 등록하고, 매 프레임 그 파동이 링 모양으로
// 퍼져나가며 감쇠하는 강도를 계산해 실제 DOM 도트에 반영한다.
// 성능: Vue 반응형을 거치면 도트 하나만 바뀌어도 ~수천 개 v-for 전체가 다시 diff되어
// 렉이 심했다. 그래서 이 경로는 dotElements를 통해 style.setProperty로 직접 쓴다.
const WAVE_SPEED = 10 // 초당 몇 칸씩 링이 퍼져나가는지
const MAX_RADIUS = 5
const DURATION = 900 // ms, 파동 하나의 전체 수명
const RING_WIDTH_K = 1.2
const RIPPLE_MIN_INTERVAL = 50 // ms, 너무 잦은 파동 생성 방지

const ripples = []
let lastRippleTime = 0
let rafId = null
let rafRunning = false
let touchedLastFrame = new Set()

function spawnRipple(col, row) {
  const now = performance.now()
  if (now - lastRippleTime < RIPPLE_MIN_INTERVAL) return
  lastRippleTime = now
  ripples.push({ col, row, startTime: now })
  ensureTicking()
}

function ensureTicking() {
  if (rafRunning) return
  rafRunning = true
  rafId = requestAnimationFrame(tickRipples)
}

function tickRipples() {
  const now = performance.now()
  const frameIntensity = new Map()

  for (let i = ripples.length - 1; i >= 0; i--) {
    const ripple = ripples[i]
    const elapsedMs = now - ripple.startTime
    const ringRadius = (elapsedMs / 1000) * WAVE_SPEED
    const envelope = Math.max(0, 1 - elapsedMs / DURATION)

    if (ringRadius > MAX_RADIUS || envelope <= 0) {
      ripples.splice(i, 1)
      continue
    }

    const minCol = Math.max(0, Math.floor(ripple.col - MAX_RADIUS))
    const maxCol = Math.min(cols.value - 1, Math.ceil(ripple.col + MAX_RADIUS))
    const minRow = Math.max(0, Math.floor(ripple.row - MAX_RADIUS))
    const maxRow = Math.min(rows.value - 1, Math.ceil(ripple.row + MAX_RADIUS))

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const distance = Math.hypot(c - ripple.col, r - ripple.row)
        const ring = Math.cos((distance - ringRadius) * RING_WIDTH_K)
        const contribution = Math.max(0, ring) * envelope
        if (contribution <= 0.02) continue

        const key = `${c},${r}`
        const prev = frameIntensity.get(key) ?? 0
        if (contribution > prev) frameIntensity.set(key, contribution)
      }
    }
  }

  frameIntensity.forEach((intensity, key) => {
    const dot = dotsByKey.get(key)
    const el = dot && dotElements[dot.index]
    if (el) el.style.setProperty('--intensity', intensity)
  })

  touchedLastFrame.forEach((key) => {
    if (!frameIntensity.has(key)) {
      const dot = dotsByKey.get(key)
      const el = dot && dotElements[dot.index]
      if (el) el.style.removeProperty('--intensity')
    }
  })
  touchedLastFrame = new Set(frameIntensity.keys())

  if (ripples.length === 0 && touchedLastFrame.size === 0) {
    rafRunning = false
    return
  }
  rafId = requestAnimationFrame(tickRipples)
}

function handleMouseMove(event) {
  if (!rootRef.value) return
  const rect = rootRef.value.getBoundingClientRect()
  const col = Math.floor((event.clientX - rect.left) / cellW.value)
  const row = Math.floor((event.clientY - rect.top) / cellH.value)
  spawnRipple(col, row)
}

onMounted(() => {
  if (!rootRef.value) return
  buildGrid(rootRef.value.clientWidth, rootRef.value.clientHeight)
  resizeObserver = new ResizeObserver(handleResize)
  resizeObserver.observe(rootRef.value)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  if (rafId) cancelAnimationFrame(rafId)
})

function handleCityDotClick(city, event) {
  emit('select-city', { city, rect: event.currentTarget.getBoundingClientRect() })
}

const tooltipStyle = () => {
  if (!hoveredDot.value) return {}
  return {
    left: `${(hoveredDot.value.col + 0.5) * cellW.value}px`,
    top: `${hoveredDot.value.row * cellH.value}px`,
  }
}
</script>

<template>
  <div ref="rootRef" class="korea-map" @mousemove="handleMouseMove">
    <div
      class="korea-map__grid"
      :style="{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }"
    >
      <span
        v-for="dot in dots"
        :key="`${dot.col}-${dot.row}`"
        class="korea-map__dot"
        :class="{
          'is-land': dot.isLand,
          'is-city': dot.city,
          'is-selected': dot.city?.id === selectedId,
        }"
        :style="dot.city ? { background: markerColor(dot.city.condition) } : undefined"
        @mouseenter="dot.city && (hoveredDot = dot)"
        @mouseleave="hoveredDot = null"
        @click="dot.city && handleCityDotClick(dot.city, $event)"
      />
    </div>

    <span v-if="hoveredDot?.city" class="korea-map__tooltip" :style="tooltipStyle()">
      {{ hoveredDot.city.name }}
    </span>
  </div>
</template>

<style scoped>
.korea-map {
  /* flex 아이템(.weather-map__grid-area) 안에서 height:100%는 flex-basis:0 특성 때문에
     신뢰할 수 없이 계산될 때가 있어, absolute+inset으로 부모 박스를 직접 채운다. */
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.korea-map__grid {
  display: grid;
  gap: 1px;
  width: 100%;
  height: 100%;
}

.korea-map__dot {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  /* 완전히 평평한 단색 도트. 파동이 지나갈 때만 밝기(filter)로 색이 밝아진다 — 그림자/그러데이션 없음. */
  background: #7cc0cb;
  filter: brightness(calc(1 + var(--intensity, 0) * 0.9));
}

.korea-map__dot.is-land {
  background: var(--dot-lit);
  filter: brightness(calc(1 + var(--intensity, 0) * 0.5));
}

.korea-map__dot.is-city {
  position: relative;
  z-index: 1;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.korea-map__dot.is-city:hover {
  transform: scale(1.9);
  z-index: 5;
}

.korea-map__dot.is-city.is-selected {
  box-shadow: 0 0 0 2px var(--amber);
}

.korea-map__tooltip {
  position: absolute;
  transform: translate(-50%, calc(-100% - 8px));
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
  font-weight: 500;
}
</style>
