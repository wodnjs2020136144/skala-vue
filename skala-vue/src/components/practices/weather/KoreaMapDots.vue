<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

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

// 픽셀 말풍선에 넣을 한글 라벨. city.status는 더미("맑음 (데모)")/실제 API 설명 길이가
// 들쭉날쭉해 말풍선 폭이 튀므로 쓰지 않고, condition 코드로 고정된 짧은 라벨을 쓴다.
const CONDITION_LABELS_KR = {
  sun: '맑음',
  cloud: '구름',
  rain: '비',
  snow: '눈',
  thunderstorm: '뇌우',
  fog: '안개',
}

// 도시 도트를 호버했을 때 뜨는 강조 링 색 — 마커 자체 배경색(CONDITION_COLORS)은
// 다른 화면(날씨 아이콘 등)과 값을 공유해서 건드리지 않고, 링 색만 조건을 더 뚜렷하게
// 드러내도록 채도 높은 팔레트로 따로 둔다.
const CONDITION_ACCENT_COLORS = {
  sun: '#ff9d3d',
  cloud: '#8fa6ad',
  rain: '#2f80ed',
  snow: '#8fe3f0',
  thunderstorm: '#8e5bd6',
  fog: '#6b7b80',
}
function pulseColor(city) {
  return CONDITION_ACCENT_COLORS[city.condition] ?? CONDITION_ACCENT_COLORS.sun
}

const rootRef = ref(null)
const gridRef = ref(null)
const viewportRef = ref(null)
const cols = ref(0)
const rows = ref(0)
const dots = ref([])
const hoveredDot = ref(null)
const tooltipPos = ref({ left: 0, top: 0 })

// 파동 계산에서 문자열 키를 쓰지 않기 위한 평면 인덱스(= dot.index) 기반 버퍼.
// landMask: 육지 여부(파동은 여기를 건너뛴다), frameScratch: 이번 프레임 강도.
let landMask = new Uint8Array(0)
let frameScratch = new Float32Array(0)

function buildGrid(width, height) {
  const newCols = Math.max(1, Math.round(width / DOT_PX))
  const newRows = Math.max(1, Math.round(height / DOT_PX))
  cols.value = newCols
  rows.value = newRows

  const koreaOffsetCol = Math.floor((newCols - GRID_W) / 2)
  const koreaOffsetRow = Math.floor((newRows - GRID_H) / 2)

  const cityByKey = new Map()
  props.cities.forEach((city) => {
    const localCol = Math.round(city.mapX * GRID_W - 0.5)
    const localRow = Math.round(city.mapY * GRID_H - 0.5)
    cityByKey.set(`${koreaOffsetCol + localCol},${koreaOffsetRow + localRow}`, city)
  })

  const cellCount = newCols * newRows
  const newLandMask = new Uint8Array(cellCount)
  const newDots = []

  for (let row = 0; row < newRows; row++) {
    for (let col = 0; col < newCols; col++) {
      const localCol = col - koreaOffsetCol
      const localRow = row - koreaOffsetRow
      const isKoreaLand =
        localCol >= 0 &&
        localCol < GRID_W &&
        localRow >= 0 &&
        localRow < GRID_H &&
        KOREA_MATRIX[localRow][localCol] === '1'

      const isLand = isKoreaLand
      const index = row * newCols + col
      newLandMask[index] = isLand ? 1 : 0
      newDots.push({
        col,
        row,
        index,
        isLand,
        city: cityByKey.get(`${col},${row}`) ?? null,
      })
    }
  }

  dots.value = newDots
  landMask = newLandMask
  frameScratch = new Float32Array(cellCount)
  prevTouched = []
  refreshDotElements()
}

// 데모/실제 데이터 토글 등으로 부모의 cities 배열이 통째로 교체되면 그리드를 다시 만든다.
// (buildGrid는 zoom/pan 상태를 건드리지 않으므로 다시 그려도 화면 위치는 유지된다.)
watch(
  () => props.cities,
  () => {
    if (!containerW || !containerH) return
    buildGrid(containerW, containerH)
  },
)

// v-for 렌더 순서는 dots.value(row-major)와 동일하므로, 실제 DOM 엘리먼트를
// dot.index로 바로 찾을 수 있게 한 번 수집해둔다. 파동 애니메이션이 이 배열에
// Vue 반응형을 거치지 않고 직접 style을 써서, 매 프레임 전체 그리드 재렌더를 피한다.
let dotElements = []
async function refreshDotElements() {
  await nextTick()
  if (!rootRef.value) return
  dotElements = Array.from(rootRef.value.querySelectorAll('.korea-map__dot'))
}

// --- 확대/축소 · 커서 추종 팬 ---
const MIN_SCALE = 1 // 최대 축소 = 기존 화면 그대로(가장자리 여백 없음)
const MAX_SCALE = 2.4 // 최대 확대 = 기본 진입 배율
const DEFAULT_SCALE = MAX_SCALE
const ZOOM_SENSITIVITY = 0.0015
const DRIFT_RATIO = 0.6 // 커서가 가장자리로 갈수록 팬 가용 범위의 몇 %까지 끌려가는지
const PAN_LERP = 0.12

let containerW = 0
let containerH = 0
let scale = DEFAULT_SCALE
let panX = 0
let panY = 0
let targetPanX = 0
let targetPanY = 0

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

// scale > 1일 때 콘텐츠가 컨테이너를 벗어나지 않는 pan 범위. scale === 1이면 [0,0]으로
// 잠겨 기존처럼 여백 없이 꽉 차는 상태가 그대로 유지된다.
function panRangeX() {
  return [containerW * (1 - scale), 0]
}
function panRangeY() {
  return [containerH * (1 - scale), 0]
}

function clampPan() {
  const [minX, maxX] = panRangeX()
  const [minY, maxY] = panRangeY()
  panX = clamp(panX, minX, maxX)
  panY = clamp(panY, minY, maxY)
}

function applyTransform() {
  if (!viewportRef.value) return
  viewportRef.value.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`
}

// 커서가 중심에서 벗어난 방향으로 지도가 살짝 끌려오도록, pan의 목표값을 커서 위치에 맞춰 갱신한다.
function updateDriftTarget(cx, cy) {
  if (!containerW || !containerH) return
  const nx = clamp((cx / containerW - 0.5) * 2, -1, 1)
  const ny = clamp((cy / containerH - 0.5) * 2, -1, 1)

  const [minX, maxX] = panRangeX()
  const centerX = (minX + maxX) / 2
  const rangeX = (maxX - minX) / 2
  targetPanX = centerX - nx * rangeX * DRIFT_RATIO

  const [minY, maxY] = panRangeY()
  const centerY = (minY + maxY) / 2
  const rangeY = (maxY - minY) / 2
  targetPanY = centerY - ny * rangeY * DRIFT_RATIO
}

function handleWheel(event) {
  event.preventDefault()
  if (!rootRef.value) return
  const rect = rootRef.value.getBoundingClientRect()
  const cx = event.clientX - rect.left
  const cy = event.clientY - rect.top

  const factor = Math.exp(-event.deltaY * ZOOM_SENSITIVITY)
  const newScale = clamp(scale * factor, MIN_SCALE, MAX_SCALE)
  if (newScale === scale) return

  // 커서 아래 지점이 확대/축소 후에도 그 자리에 그대로 머물도록 pan을 보정한다.
  panX = cx - (cx - panX) * (newScale / scale)
  panY = cy - (cy - panY) * (newScale / scale)
  scale = newScale
  clampPan()
  targetPanX = panX
  targetPanY = panY
  applyTransform()
}

// --- 커서 눌림 파동(바다) · 프레스(육지) ---
// 커서가 새로운 칸에 들어올 때마다 그 칸이 바다면 파동을, 육지면 "눌림(프레스)"을 하나
// 등록한다. 같은 칸 안에서 커서가 미세하게 움직이는 것만으로는 아무것도 새로 생기지
// 않는다 — lastActiveCol/Row로 "마지막으로 반응한 칸"을 기억해두고, 칸이 바뀔 때만
// 트리거한다(handleMouseMove 참고).
// 매 프레임 그 효과가 어떻게 번지고 사그라드는지 계산해 실제 DOM 도트에 반영한다.
// 성능: Vue 반응형을 거치면 도트 하나만 바뀌어도 ~수천 개 v-for 전체가 다시 diff되어
// 렉이 심했다. 그래서 이 경로는 dotElements를 통해 style.setProperty로 직접 쓴다.
const WAVE_MAX_RADIUS = 6 // 파동이 도달할 수 있는 최대 반경(칸)
const WAVE_TAU = 0.35 // 반경이 최대치에 가까워지는 속도(초) — 감속하며 퍼지는 느낌
const DURATION = 900 // ms, 파동 하나의 전체 수명
const RING_WIDTH_K = 1.1
const BAND = 1.6 // 링 주변, 실제로 강도가 남는 두께(칸) — 이 폭만 스캔해 계산량을 줄인다
const SECONDARY_OFFSET = 1.4 // 뒤따르는 2차 마루의 위상차(칸) — 파도가 다발로 보이게
const SECONDARY_AMPLITUDE = 0.35
const MAX_RIPPLES = 10 // 동시 파동 상한 — 프레임 비용의 천장을 고정한다

// 육지 프레스: 파동처럼 퍼지지 않고 고정 반경 안에서 빠르게 강해졌다가 서서히 풀린다.
const PRESS_RADIUS = 2.2 // 칸 — 퍼지지 않는 고정 크기
const PRESS_DURATION = 550 // ms
const MAX_PRESSES = 10

const ripples = []
const presses = []
let rafId = null
let rafRunning = false
let prevTouched = [] // 지난 프레임에 강도가 반영된 인덱스 — 이번 프레임에 지울 후보
let lastActiveCol = null
let lastActiveRow = null // 마지막으로 파동/프레스를 발생시킨 칸 — 같은 칸이면 재발생하지 않는다

function spawnRipple(col, row) {
  const now = performance.now()
  if (ripples.length >= MAX_RIPPLES) ripples.shift()
  ripples.push({ col, row, startTime: now })
}

function spawnPress(col, row) {
  const now = performance.now()
  if (presses.length >= MAX_PRESSES) presses.shift()
  presses.push({ col, row, startTime: now })
}

function ensureTicking() {
  if (rafRunning) return
  rafRunning = true
  rafId = requestAnimationFrame(tick)
}

function tick(now) {
  let needMore = false

  // 커서 추종 팬을 목표값으로 부드럽게 보간한다.
  const dx = targetPanX - panX
  const dy = targetPanY - panY
  if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
    panX += dx * PAN_LERP
    panY += dy * PAN_LERP
    needMore = true
  } else {
    panX = targetPanX
    panY = targetPanY
  }
  applyTransform()

  // 지난 프레임에 건드린 셀만 먼저 지운다 — 매 프레임 전체 버퍼를 훑지 않는다.
  for (const idx of prevTouched) {
    frameScratch[idx] = 0
    const el = dotElements[idx]
    if (el) el.style.removeProperty('--intensity')
  }

  const touchedThisFrame = []

  for (let i = ripples.length - 1; i >= 0; i--) {
    const ripple = ripples[i]
    const elapsedMs = now - ripple.startTime
    const envelopeLinear = Math.max(0, 1 - elapsedMs / DURATION)
    const envelope = envelopeLinear * envelopeLinear // 제곱 감쇠 — 끝맺음이 부드럽다

    if (envelope <= 0.001) {
      ripples.splice(i, 1)
      continue
    }

    // 등속이 아닌 감속으로 퍼져나가 "물결이 퍼지다 잦아드는" 느낌을 준다.
    const t = elapsedMs / 1000
    const ringRadius = WAVE_MAX_RADIUS * (1 - Math.exp(-t / WAVE_TAU))

    const reach = ringRadius + BAND
    const minCol = Math.max(0, Math.floor(ripple.col - reach))
    const maxCol = Math.min(cols.value - 1, Math.ceil(ripple.col + reach))
    const minRow = Math.max(0, Math.floor(ripple.row - reach))
    const maxRow = Math.min(rows.value - 1, Math.ceil(ripple.row + reach))
    const bandInnerSq = Math.max(0, ringRadius - BAND) ** 2
    const bandOuterSq = reach * reach

    for (let r = minRow; r <= maxRow; r++) {
      const rowBase = r * cols.value
      const dy2 = r - ripple.row
      for (let c = minCol; c <= maxCol; c++) {
        const idx = rowBase + c
        if (landMask[idx]) continue // 육지는 파동 계산에서 완전히 제외

        const dx2 = c - ripple.col
        const distSq = dx2 * dx2 + dy2 * dy2
        if (distSq > bandOuterSq || distSq < bandInnerSq) continue

        const distance = Math.sqrt(distSq)
        const primary = Math.max(0, Math.cos((distance - ringRadius) * RING_WIDTH_K))
        const secondary =
          Math.max(0, Math.cos((distance - ringRadius + SECONDARY_OFFSET) * RING_WIDTH_K)) *
          SECONDARY_AMPLITUDE
        const contribution = Math.min(1, primary + secondary) * envelope
        if (contribution <= 0.02) continue

        if (frameScratch[idx] === 0) touchedThisFrame.push(idx)
        if (contribution > frameScratch[idx]) frameScratch[idx] = contribution
      }
    }
  }

  for (let i = presses.length - 1; i >= 0; i--) {
    const press = presses[i]
    const elapsedMs = now - press.startTime
    const t = elapsedMs / PRESS_DURATION

    if (t >= 1) {
      presses.splice(i, 1)
      continue
    }

    // 빠르게 강해졌다가(처음 15%) 서서히 풀리는(나머지 85%) 곡선 — 무거운 게 눌렀다 떼는 느낌.
    const envelope = t < 0.15 ? t / 0.15 : Math.pow(1 - (t - 0.15) / 0.85, 1.6)

    const minCol = Math.max(0, Math.floor(press.col - PRESS_RADIUS))
    const maxCol = Math.min(cols.value - 1, Math.ceil(press.col + PRESS_RADIUS))
    const minRow = Math.max(0, Math.floor(press.row - PRESS_RADIUS))
    const maxRow = Math.min(rows.value - 1, Math.ceil(press.row + PRESS_RADIUS))
    const radiusSq = PRESS_RADIUS * PRESS_RADIUS

    for (let r = minRow; r <= maxRow; r++) {
      const rowBase = r * cols.value
      const dy2 = r - press.row
      for (let c = minCol; c <= maxCol; c++) {
        const idx = rowBase + c
        if (!landMask[idx]) continue // 바다는 프레스 계산에서 제외

        const dx2 = c - press.col
        const distSq = dx2 * dx2 + dy2 * dy2
        if (distSq > radiusSq) continue

        const distance = Math.sqrt(distSq)
        const contribution = (1 - distance / PRESS_RADIUS) * envelope
        if (contribution <= 0.02) continue

        if (frameScratch[idx] === 0) touchedThisFrame.push(idx)
        if (contribution > frameScratch[idx]) frameScratch[idx] = contribution
      }
    }
  }

  for (const idx of touchedThisFrame) {
    const el = dotElements[idx]
    if (el) el.style.setProperty('--intensity', frameScratch[idx])
  }
  prevTouched = touchedThisFrame

  if (ripples.length > 0 || presses.length > 0) needMore = true

  if (needMore) {
    rafId = requestAnimationFrame(tick)
  } else {
    rafRunning = false
  }
}

function handleMouseMove(event) {
  if (!rootRef.value || !gridRef.value) return

  const rootRect = rootRef.value.getBoundingClientRect()
  updateDriftTarget(event.clientX - rootRect.left, event.clientY - rootRect.top)

  // 그리드의 실제 화면 rect는 이미 transform(줌/팬)이 반영돼 있어, 별도 역변환 없이
  // 비율만으로 칸 좌표를 구할 수 있다.
  const gridRect = gridRef.value.getBoundingClientRect()
  const col = Math.floor(((event.clientX - gridRect.left) / gridRect.width) * cols.value)
  const row = Math.floor(((event.clientY - gridRect.top) / gridRect.height) * rows.value)

  if (col >= 0 && col < cols.value && row >= 0 && row < rows.value) {
    // 같은 칸에 머무는 동안은 아무 것도 새로 만들지 않는다 — 칸이 바뀔 때만 1회 반응한다.
    if (col !== lastActiveCol || row !== lastActiveRow) {
      lastActiveCol = col
      lastActiveRow = row
      const idx = row * cols.value + col
      if (landMask[idx]) spawnPress(col, row)
      else spawnRipple(col, row)
    }
  }

  ensureTicking()
}

function handleMouseLeave() {
  lastActiveCol = null
  lastActiveRow = null
}

let resizeObserver = null
function handleResize(entries) {
  const entry = entries[0]
  if (!entry) return
  containerW = entry.contentRect.width
  containerH = entry.contentRect.height
  buildGrid(containerW, containerH)
  clampPan()
  applyTransform()
}

onMounted(() => {
  if (!rootRef.value) return
  containerW = rootRef.value.clientWidth
  containerH = rootRef.value.clientHeight
  buildGrid(containerW, containerH)

  scale = DEFAULT_SCALE
  panX = containerW * (1 - scale) / 2
  panY = containerH * (1 - scale) / 2
  targetPanX = panX
  targetPanY = panY
  applyTransform()

  resizeObserver = new ResizeObserver(handleResize)
  resizeObserver.observe(rootRef.value)
  rootRef.value.addEventListener('wheel', handleWheel, { passive: false })
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  rootRef.value?.removeEventListener('wheel', handleWheel)
  if (rafId) cancelAnimationFrame(rafId)
})

function handleCityDotClick(city, event) {
  emit('select-city', { city, rect: event.currentTarget.getBoundingClientRect() })
}

function handleCityHover(dot, event) {
  hoveredDot.value = dot
  if (!rootRef.value) return
  const rootRect = rootRef.value.getBoundingClientRect()
  const dotRect = event.currentTarget.getBoundingClientRect()
  tooltipPos.value = {
    left: dotRect.left - rootRect.left + dotRect.width / 2,
    top: dotRect.top - rootRect.top,
  }
}
</script>

<template>
  <div ref="rootRef" class="korea-map" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
    <div ref="viewportRef" class="korea-map__viewport">
      <div
        ref="gridRef"
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
            [`is-condition-${dot.city?.condition}`]: !!dot.city,
          }"
          :style="
            dot.city
              ? { background: markerColor(dot.city.condition), '--pulse-color': pulseColor(dot.city) }
              : undefined
          "
          @mouseenter="dot.city && handleCityHover(dot, $event)"
          @mouseleave="hoveredDot = null"
          @click="dot.city && handleCityDotClick(dot.city, $event)"
        />
      </div>
    </div>

    <div v-if="hoveredDot?.city" class="korea-map__bubble" :style="{ left: `${tooltipPos.left}px`, top: `${tooltipPos.top}px` }">
      {{ hoveredDot.city.name }} {{ CONDITION_LABELS_KR[hoveredDot.city.condition] ?? '' }}
    </div>
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

.korea-map__viewport {
  position: absolute;
  inset: 0;
  transform-origin: 0 0;
  will-change: transform;
}

.korea-map__grid {
  position: relative;
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
  /* 파동과 달리 밝아지는 게 아니라 어두워지고 살짝 오그라들어 "눌리는" 느낌을 낸다. */
  filter: brightness(calc(1 - var(--intensity, 0) * 0.4));
  transform: scale(calc(1 - var(--intensity, 0) * 0.12));
  /* 배경(바다) 원색과 구분되도록, 육지색보다 약 14% 어둡게 계산한 색으로 칸 사이 간격까지
     둘러 인접한 육지 칸끼리 하나의 영역처럼 이어붙게 한다. */
  box-shadow: 0 0 0 2px #d1cabb;
}

.korea-map__dot.is-city {
  position: relative;
  z-index: 1;
  cursor: pointer;
  transition: transform 0.15s ease;
  /* is-land와 동시에 걸리는 경우(도시는 대부분 육지 위)가 많아, 평상시엔 지형 도트와
     완전히 동일하게 보이도록 육지의 영역 구분 box-shadow를 여기서 지운다. */
  box-shadow: none;
}

/* 평상시엔 주변 지형 도트와 완전히 같은 크기 — 확대·글로우·펄스는 호버했을 때만 나타난다. */
.korea-map__dot.is-city:hover {
  transform: scale(1.9);
  z-index: 5;
  box-shadow: 0 0 0 3px var(--pulse-color, var(--amber));
}

.korea-map__dot.is-city.is-selected {
  box-shadow: 0 0 0 2px var(--amber);
}

.korea-map__dot.is-city.is-selected:hover {
  box-shadow: 0 0 0 3px var(--pulse-color, var(--amber));
}

/* 조건별 강조 링 — 호버했을 때만 재생되어 평소엔 리페인트 비용이 전혀 없다. */
.korea-map__dot.is-city::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid var(--pulse-color, var(--amber));
  opacity: 0;
  pointer-events: none;
}

.korea-map__dot.is-city.is-condition-sun:hover::after {
  animation: dot-pulse-ring 1.1s ease-out infinite;
}
.korea-map__dot.is-city.is-condition-cloud:hover::after {
  animation: dot-pulse-ring 1.8s ease-out infinite;
}
.korea-map__dot.is-city.is-condition-rain:hover::after {
  animation: dot-pulse-ring 0.8s ease-out infinite;
}
.korea-map__dot.is-city.is-condition-snow:hover::after {
  animation: dot-blink 1.3s ease-in-out infinite;
}
.korea-map__dot.is-city.is-condition-thunderstorm:hover::after {
  animation: dot-flicker 0.9s steps(1) infinite;
}
.korea-map__dot.is-city.is-condition-fog:hover::after {
  animation: dot-blink 2s ease-in-out infinite;
  opacity: 0.25;
}

.korea-map__dot.is-city.is-condition-rain:hover::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 100%;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--pulse-color, #5b8fc7);
  transform: translateX(-50%);
  animation: dot-raindrop 0.6s linear infinite;
}

@keyframes dot-pulse-ring {
  0% {
    transform: scale(0.6);
    opacity: 0.7;
  }
  100% {
    transform: scale(1.9);
    opacity: 0;
  }
}

@keyframes dot-blink {
  0%,
  100% {
    opacity: 0.15;
    transform: scale(1);
  }
  50% {
    opacity: 0.55;
    transform: scale(1.3);
  }
}

@keyframes dot-flicker {
  0%,
  100% {
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  15% {
    opacity: 0.1;
  }
  25% {
    opacity: 0.9;
  }
  30% {
    opacity: 0;
  }
}

@keyframes dot-raindrop {
  0% {
    opacity: 0;
    transform: translate(-50%, 0);
  }
  20% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, 10px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .korea-map__dot.is-city::after,
  .korea-map__dot.is-condition-rain::before {
    animation: none !important;
    opacity: 0 !important;
  }
}

/* 픽셀 말풍선 — 줌 뷰포트 바깥(korea-map 직계)에 둬서 배율과 무관하게 크기가 고정된다. */
.korea-map__bubble {
  position: absolute;
  transform: translate(-50%, calc(-100% - 12px));
  background: var(--paper);
  border: 3px solid var(--ink);
  padding: 6px 10px 8px;
  font-family: var(--font-pixel-kr);
  font-size: 12px;
  color: var(--ink);
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  clip-path: polygon(4px 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px), 0 4px);
}

.korea-map__bubble::before,
.korea-map__bubble::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.korea-map__bubble::before {
  bottom: -9px;
  width: 12px;
  height: 9px;
  background: var(--ink);
}

.korea-map__bubble::after {
  bottom: -6px;
  width: 6px;
  height: 6px;
  background: var(--paper);
}
</style>
