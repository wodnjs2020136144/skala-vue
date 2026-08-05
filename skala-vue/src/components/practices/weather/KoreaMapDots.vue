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
  // "한반도 지역 찾기" 게임 진행 중에는 도시 도트뿐 아니라 모든 칸이 클릭 가능해지고,
  // 클릭이 select-city 대신 map-pick으로 나간다(게임 중엔 날씨 팝업이 뜨면 방해된다).
  gameActive: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-city', 'map-pick'])

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

// 도트 한 칸의 픽셀 크기 — 육지·바다 전체 그리드가 이 값 하나로 통일된다. 화면을 완전히
// 채우기 위해 칸 수(cols/rows)는 항상 "컨테이너 픽셀 크기 / DOT_PX"로 동적 계산한다(화면
// 일부만 도트로 그리고 나머지를 단색으로 비우면 안 된다 — 여백도 전부 바다 픽셀이어야 함).
// 14→16으로 키운 이유: 한반도(22×41칸)는 크기가 고정이라, 도트가 커질수록 같은 칸 수가
// 차지하는 실제 픽셀 면적이 커져 화면에서 한반도가 차지하는 비중이 자연히 커진다. 동시에
// 같은 화면을 채우는 데 필요한 총 칸 수(=DOM 노드 수)는 줄어 성능에도 도움이 된다.
const DOT_PX = 16

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

// 육지·바다처럼 도시 도트의 테두리(box-shadow)도 자기 색 그대로가 아니라 살짝 어둡게 —
// 배경과 구분이 잘 안 되던 문제를 육지에 썼던 것과 같은 방식으로 해결한다.
function darken(hex, amount = 0.15) {
  const num = parseInt(hex.slice(1), 16)
  const r = Math.round(((num >> 16) & 255) * (1 - amount))
  const g = Math.round(((num >> 8) & 255) * (1 - amount))
  const b = Math.round((num & 255) * (1 - amount))
  return `rgb(${r}, ${g}, ${b})`
}
function markerBorderColor(city) {
  return darken(markerColor(city.condition))
}

const rootRef = ref(null)
const gridRef = ref(null)
const viewportRef = ref(null)
const cols = ref(0)
const rows = ref(0)
const dots = ref([])
const hoveredDot = ref(null)
// 게임이 시작되는 순간 도시 이름을 알려주는 말풍선이 남아있으면 정답을 미리 알려주는 셈이라
// 즉시 지운다(이후 mouseenter는 gameActive 동안 아예 막힌다).
watch(
  () => props.gameActive,
  (active) => {
    if (active) hoveredDot.value = null
  },
)
const tooltipPos = ref({ left: 0, top: 0 })

// 파동 계산에서 문자열 키를 쓰지 않기 위한 평면 인덱스(= dot.index) 기반 버퍼.
// landMask: 육지 여부(파동은 여기를 건너뛴다), frameScratch: 이번 프레임 강도.
let landMask = new Uint8Array(0)
let frameScratch = new Float32Array(0)
// burst(선택 폭발) 전용 버퍼 — 파동/프레스와 달리 육지·바다 구분 없이 모든 칸에 적용된다.
let burstScratch = new Float32Array(0)
// burstScratch와 나란히, 각 칸에서 현재 가장 강한 burst가 정답(correct)인지 오답(wrong)인지
// 기록한다 — 오답 burst만 빨간색(--burst-color)으로 표시하기 위함이다.
let burstVariant = []
// 한반도 매트릭스가 그리드 안에서 그려지는 오프셋 — 컨테이너 크기에 따라 buildGrid에서
// 갱신된다. 게임 모드의 mapToColRow가 이 값을 그대로 재사용해, 화면 크기가 달라져도
// city.mapX/mapY → 실제 칸 좌표 변환이 항상 buildGrid와 같은 결과를 내도록 한다.
let koreaOffsetCol = 0
let koreaOffsetRow = 0

function buildGrid(width, height) {
  const newCols = Math.max(1, Math.round(width / DOT_PX))
  const newRows = Math.max(1, Math.round(height / DOT_PX))
  cols.value = newCols
  rows.value = newRows

  koreaOffsetCol = Math.floor((newCols - GRID_W) / 2)
  koreaOffsetRow = Math.floor((newRows - GRID_H) / 2)

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
  burstScratch = new Float32Array(cellCount)
  burstVariant = Array.from({ length: cellCount }, () => null)
  prevTouched = []
  prevBurstTouched = []
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
const MIN_SCALE = 1 // 최대 축소 = 화면을 여백 없이 도트로 꽉 채운 기본 상태
const MAX_SCALE = 2.4 // 최대 확대
const DEFAULT_SCALE = MIN_SCALE // 처음 진입 시 바로 이 상태로 시작한다
const ZOOM_SENSITIVITY = 0.0015
// 커서가 가장자리로 갈수록 팬 가용 범위의 몇 %까지 끌려가는지. 게임 중(gameActive)에는 확대된
// 상태(zoomToKorea)에서 반대쪽 끝까지 커서 추종만으로 닿아야 하므로 훨씬 넉넉하게 둔다.
const DRIFT_RATIO_IDLE = 0.6
const DRIFT_RATIO_GAME = 0.95
const PAN_LERP = 0.12
const SCALE_LERP = 0.12

let containerW = 0
let containerH = 0
let scale = DEFAULT_SCALE
let targetScale = DEFAULT_SCALE
let panX = 0
let panY = 0
let targetPanX = 0
let targetPanY = 0

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

// scale > 1일 때 콘텐츠가 컨테이너를 벗어나지 않는 pan 범위. scale === 1이면 [0,0]으로
// 잠겨 화면을 여백 없이 도트로 꽉 채운 상태 그대로 유지된다.
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
  // transform(줌/팬)이 바뀔 때만 rect를 다시 읽는다 — mousemove마다 매번 읽던 것보다
  // 훨씬 드물게 호출된다(휠 조작 시, 그리고 커서 추종 팬이 lerp로 정착하는 동안의 매 프레임).
  refreshRects()
}

// root/grid의 bounding rect를 캐시해둔다. mousemove는 이 캐시만 읽어서, 화면이 정지해
// 있는 동안(대부분의 시간)에는 마우스를 움직여도 레이아웃을 다시 읽지 않는다.
let cachedRootRect = null
let cachedGridRect = null
function refreshRects() {
  if (rootRef.value) cachedRootRect = rootRef.value.getBoundingClientRect()
  if (gridRef.value) cachedGridRect = gridRef.value.getBoundingClientRect()
}

// 커서가 중심에서 벗어난 방향으로 지도가 살짝 끌려오도록, pan의 목표값을 커서 위치에 맞춰 갱신한다.
function updateDriftTarget(cx, cy) {
  if (!containerW || !containerH) return
  const driftRatio = props.gameActive ? DRIFT_RATIO_GAME : DRIFT_RATIO_IDLE
  const nx = clamp((cx / containerW - 0.5) * 2, -1, 1)
  const ny = clamp((cy / containerH - 0.5) * 2, -1, 1)

  const [minX, maxX] = panRangeX()
  const centerX = (minX + maxX) / 2
  const rangeX = (maxX - minX) / 2
  targetPanX = centerX - nx * rangeX * driftRatio

  const [minY, maxY] = panRangeY()
  const centerY = (minY + maxY) / 2
  const rangeY = (maxY - minY) / 2
  targetPanY = centerY - ny * rangeY * driftRatio
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
  targetScale = newScale
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

// 지역 선택 시 클릭한 픽셀에서 터지는 충격파. 파동/프레스와 달리 육지·바다를 가리지 않고
// 모든 칸에 적용되며, 짧고 강하게 퍼졌다 빠르게 사그라든다.
const BURST_MAX_RADIUS = 5.5 // 칸
const BURST_DURATION = 480 // ms
const BURST_BAND = 1.4 // 링 주변 실제로 강도가 남는 두께(칸)
const MAX_BURSTS = 6

const ripples = []
const presses = []
const bursts = []
let rafId = null
let rafRunning = false
let prevTouched = [] // 지난 프레임에 강도가 반영된 인덱스 — 이번 프레임에 지울 후보
let prevBurstTouched = []
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

// variant: 'correct'(기본, 기존과 같은 크림색 느낌) | 'wrong'(빨간색 — 오답 클릭 위치 표시용)
function spawnBurst(col, row, variant = 'correct') {
  const now = performance.now()
  if (bursts.length >= MAX_BURSTS) bursts.shift()
  bursts.push({ col, row, startTime: now, variant })
  ensureTicking()
}

function ensureTicking() {
  if (rafRunning) return
  rafRunning = true
  rafId = requestAnimationFrame(tick)
}

function tick(now) {
  let needMore = false

  // 확대/축소를 목표값으로 부드럽게 보간한다(게임 시작/종료 시 zoomToKorea/resetZoom이 목표를
  // 바꾼다). scale이 바뀌면 pan의 허용 범위(panRangeX/Y)도 같이 바뀌므로 매 프레임 다시 clamp한다.
  const ds = targetScale - scale
  if (Math.abs(ds) > 0.001) {
    scale += ds * SCALE_LERP
    clampPan()
    needMore = true
  } else {
    scale = targetScale
  }

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
  for (const idx of prevBurstTouched) {
    burstScratch[idx] = 0
    burstVariant[idx] = null
    const el = dotElements[idx]
    if (el) {
      el.style.removeProperty('--burst')
      el.style.removeProperty('--burst-color')
    }
  }

  const touchedThisFrame = []
  const burstTouchedThisFrame = []

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

  for (let i = bursts.length - 1; i >= 0; i--) {
    const burst = bursts[i]
    const elapsedMs = now - burst.startTime
    const t = elapsedMs / BURST_DURATION

    if (t >= 1) {
      bursts.splice(i, 1)
      continue
    }

    // 순간적으로 강했다가 빠르게 사그라들고(envelope), 초반에 확 퍼졌다가 점점 감속하며
    // 퍼져나간다(ringRadius) — "펑" 하고 터지는 충격파 느낌.
    const envelope = (1 - t) * (1 - t)
    const ringRadius = BURST_MAX_RADIUS * Math.sqrt(t)

    const reach = ringRadius + BURST_BAND
    const minCol = Math.max(0, Math.floor(burst.col - reach))
    const maxCol = Math.min(cols.value - 1, Math.ceil(burst.col + reach))
    const minRow = Math.max(0, Math.floor(burst.row - reach))
    const maxRow = Math.min(rows.value - 1, Math.ceil(burst.row + reach))
    const bandInnerSq = Math.max(0, ringRadius - BURST_BAND) ** 2
    const bandOuterSq = reach * reach

    for (let r = minRow; r <= maxRow; r++) {
      const rowBase = r * cols.value
      const dy2 = r - burst.row
      for (let c = minCol; c <= maxCol; c++) {
        const idx = rowBase + c
        // 파동/프레스와 달리 육지·바다를 가리지 않는다 — 폭발이니까 전부 적용.
        const dx2 = c - burst.col
        const distSq = dx2 * dx2 + dy2 * dy2
        if (distSq > bandOuterSq || distSq < bandInnerSq) continue

        const distance = Math.sqrt(distSq)
        const contribution = Math.max(0, 1 - Math.abs(distance - ringRadius) / BURST_BAND) * envelope
        if (contribution <= 0.02) continue

        if (burstScratch[idx] === 0) burstTouchedThisFrame.push(idx)
        if (contribution > burstScratch[idx]) {
          burstScratch[idx] = contribution
          burstVariant[idx] = burst.variant
        }
      }
    }
  }

  for (const idx of touchedThisFrame) {
    const el = dotElements[idx]
    if (el) el.style.setProperty('--intensity', frameScratch[idx])
  }
  prevTouched = touchedThisFrame

  for (const idx of burstTouchedThisFrame) {
    const el = dotElements[idx]
    if (!el) continue
    el.style.setProperty('--burst', burstScratch[idx])
    if (burstVariant[idx] === 'wrong') el.style.setProperty('--burst-color', 'var(--danger)')
    else el.style.removeProperty('--burst-color')
  }
  prevBurstTouched = burstTouchedThisFrame

  if (ripples.length > 0 || presses.length > 0 || bursts.length > 0) needMore = true

  if (needMore) {
    rafId = requestAnimationFrame(tick)
  } else {
    rafRunning = false
  }
}

// 클릭(mousedown)했을 때, 또는 버튼을 누른 채 드래그(mousemove)하는 동안 지나가는 칸마다
// 파동(바다)/눌림(육지)을 트리거한다. 단순히 커서를 올리기만 해서는 아무 일도 일어나지
// 않는다 — 예전엔 호버만으로도 반응해 마우스를 조금만 움직여도 매 프레임 이펙트 계산이
// 돌았는데, 클릭/드래그로 조건을 좁혀 평소엔 계산 비용이 0이 되도록 했다.
let isPointerDown = false

// 화면 좌표(clientX/Y)를 그리드 칸 좌표로 변환한다. 그리드의 실제 화면 rect는 이미
// transform(줌/팬)이 반영돼 있어, 별도 역변환 없이 비율만으로 칸 좌표를 구할 수 있다.
// rect는 캐시된 값을 쓴다(줌/팬이 바뀔 때만 갱신됨).
function pointToColRow(clientX, clientY) {
  if (!cachedGridRect) return null
  const col = Math.floor(((clientX - cachedGridRect.left) / cachedGridRect.width) * cols.value)
  const row = Math.floor(((clientY - cachedGridRect.top) / cachedGridRect.height) * rows.value)
  if (col < 0 || col >= cols.value || row < 0 || row >= rows.value) return null
  return { col, row }
}

// 같은 칸 안에서는 중복 트리거하지 않는다 — lastActiveCol/Row로 "마지막으로 반응한 칸"을
// 기억해두고, 칸이 바뀔 때만(즉 드래그가 그 칸에 처음 들어온 순간에만) 반응한다.
function triggerCellEffect(col, row) {
  if (col === lastActiveCol && row === lastActiveRow) return
  lastActiveCol = col
  lastActiveRow = row
  const idx = row * cols.value + col
  // 도시 도트는 클릭 시 별도로 burst(handleCityDotClick)가 뜨므로, 여기서 프레스까지 겹치면
  // 연출이 지저분해진다 — 도시 칸은 건너뛴다.
  if (dots.value[idx]?.city) return
  if (landMask[idx]) spawnPress(col, row)
  else spawnRipple(col, row)
  ensureTicking()
}

function handleMouseDown(event) {
  if (!rootRef.value || !gridRef.value) return
  if (!cachedRootRect || !cachedGridRect) refreshRects()
  isPointerDown = true
  const cell = pointToColRow(event.clientX, event.clientY)
  if (cell) triggerCellEffect(cell.col, cell.row)
}

function handleMouseUp() {
  isPointerDown = false
  lastActiveCol = null
  lastActiveRow = null
}

function handleMouseMove(event) {
  if (!rootRef.value || !gridRef.value) return
  if (!cachedRootRect || !cachedGridRect) refreshRects()

  updateDriftTarget(event.clientX - cachedRootRect.left, event.clientY - cachedRootRect.top)

  if (isPointerDown) {
    const cell = pointToColRow(event.clientX, event.clientY)
    if (cell) triggerCellEffect(cell.col, cell.row)
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
  targetScale = DEFAULT_SCALE
  panX = containerW * (1 - scale) / 2
  panY = containerH * (1 - scale) / 2
  targetPanX = panX
  targetPanY = panY
  applyTransform()

  resizeObserver = new ResizeObserver(handleResize)
  resizeObserver.observe(rootRef.value)
  rootRef.value.addEventListener('wheel', handleWheel, { passive: false })
  // 버튼을 지도 바깥에서 떼는 경우까지 잡기 위해 mouseup은 window에 건다(mousedown/move는
  // 지도 안에서만 의미가 있어 템플릿에 직접 바인딩한다).
  window.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  rootRef.value?.removeEventListener('wheel', handleWheel)
  window.removeEventListener('mouseup', handleMouseUp)
  if (rafId) cancelAnimationFrame(rafId)
  clearTimeout(comboFlashTimeoutId)
  clearTimeout(shakeTimeoutId)
})

function handleCityDotClick(dot, event) {
  spawnBurst(dot.col, dot.row)
  emit('select-city', { city: dot.city, rect: event.currentTarget.getBoundingClientRect() })
}

// 게임 진행 중에는 도시 여부와 무관하게 모든 칸 클릭이 map-pick으로 나가고, 날씨 팝업은
// 뜨지 않는다(게임 중 팝업이 뜨면 방해된다). 게임이 꺼져 있을 때는 기존처럼 도시 도트는
// 팝업을 연다. 바다/육지 클릭의 파동·눌림 이펙트는 handleMouseDown이 이미 처리한다(클릭도
// mousedown을 거치므로 여기서 또 트리거할 필요가 없다).
function handleDotClick(dot, event) {
  if (props.gameActive) {
    emit('map-pick', { col: dot.col, row: dot.row })
    return
  }
  if (dot.city) {
    handleCityDotClick(dot, event)
  }
}

// city.mapX/mapY(0~1 상대 좌표) → 실제 그리드 칸(col,row). buildGrid가 도시 배치에 쓰는
// 것과 완전히 같은 공식이며, koreaOffsetCol/Row는 컨테이너 크기가 바뀔 때마다 buildGrid가
// 갱신해두므로 게임 쪽에서 별도로 계산하지 않아도 항상 화면과 일치한다.
function mapToColRow(mapX, mapY) {
  const localCol = Math.round(mapX * GRID_W - 0.5)
  const localRow = Math.round(mapY * GRID_H - 0.5)
  return { col: koreaOffsetCol + localCol, row: koreaOffsetRow + localRow }
}

// --- 게임 줌: 시작하면 한반도가 화면을 크게 채우고, 끝나면 원래대로 돌아온다 ---
// scale/panX/panY는 tick()에서 targetScale/targetPanX/Y를 향해 매 프레임 보간되므로,
// 여기서는 목표값만 세팅하고 ensureTicking()으로 보간을 깨우면 된다.
function zoomToKorea() {
  // 한반도 세로(GRID_H칸)의 절반이 화면(rows.value칸)을 꽉 채우도록 확대한다.
  targetScale = clamp(rows.value / (GRID_H / 2), MIN_SCALE, MAX_SCALE)
  // 화면 중앙이 한반도 중앙에 오도록 pan을 계산한다 — buildGrid가 항상 koreaOffsetCol/Row를
  // 그리드 중앙에 맞추므로, "그리드 자체의 중앙"(scale=1일 때 좌표로 containerW/2,
  // containerH/2)이 곧 한반도 중앙이다. screen = pan + scale * local 공식(handleWheel과 동일)을
  // 그 점에 대해 풀면 아래 식이 된다.
  targetPanX = (containerW / 2) * (1 - targetScale)
  targetPanY = (containerH / 2) * (1 - targetScale)
  ensureTicking()
}

function resetZoom() {
  targetScale = MIN_SCALE
  targetPanX = (containerW * (1 - MIN_SCALE)) / 2
  targetPanY = (containerH * (1 - MIN_SCALE)) / 2
  ensureTicking()
}

// --- 게임 채점 보조: 클릭한 칸이 어떤 종류인지 알려준다(정답 근처 지역이 없을 때, "여기가
// 어디였는지"를 좀 더 구체적으로 알려주기 위함) ---
// 북한/남한 경계는 실제 휴전선(서쪽이 더 남쪽으로 내려오는 사선)을 그대로 반영하지 않고,
// KOREA_MATRIX 위의 가로선 하나로 근사한다. 문제 지역 중 최북단인 속초가 localRow 18이라,
// 그보다 위(localRow <= 17)의 육지는 전부 북한으로 본다.
const NORTH_KOREA_ROW_BOUNDARY = 17
function describeCell(col, row) {
  const localCol = col - koreaOffsetCol
  const localRow = row - koreaOffsetRow
  const isLand =
    localCol >= 0 && localCol < GRID_W && localRow >= 0 && localRow < GRID_H && KOREA_MATRIX[localRow][localCol] === '1'
  if (!isLand) return 'sea'
  return localRow <= NORTH_KOREA_ROW_BOUNDARY ? 'north' : 'land'
}

// --- 콤보 이펙트: 연속으로 맞히면 한반도 전체가 한 번 빛난다 ---
const isComboFlashing = ref(false)
let comboFlashTimeoutId = null
function flashKorea() {
  isComboFlashing.value = true
  clearTimeout(comboFlashTimeoutId)
  comboFlashTimeoutId = setTimeout(() => {
    isComboFlashing.value = false
  }, 650)
}

// --- 게임 종료 이펙트: 한반도 전체가 들썩인다 ---
const isGameOverShaking = ref(false)
let shakeTimeoutId = null
function shakeKorea() {
  // 칸마다 살짝 다른 타이밍으로 흔들리도록 매번 무작위 지연을 다시 부여한다 — 전부 똑같이
  // 움직이면 "들썩인다"는 느낌보다 기계적인 느낌이 난다.
  for (const dot of dots.value) {
    if (!dot.isLand) continue
    const el = dotElements[dot.index]
    if (el) el.style.setProperty('--shake-delay', `${(Math.random() * 0.4).toFixed(2)}s`)
  }
  isGameOverShaking.value = true
  clearTimeout(shakeTimeoutId)
  shakeTimeoutId = setTimeout(() => {
    isGameOverShaking.value = false
  }, 1500)
}

// --- 힌트: 라운드 시작 후 일정 시간 못 맞히면 정답 근처 픽셀이 은은하게 깜빡인다 ---
const HINT_RADIUS = 3
let hintedIndices = []
function clearHint() {
  for (const idx of hintedIndices) {
    dotElements[idx]?.classList.remove('is-hint')
  }
  hintedIndices = []
}
function showHint(col, row) {
  clearHint()
  const radiusSq = HINT_RADIUS * HINT_RADIUS
  const minCol = Math.max(0, Math.floor(col - HINT_RADIUS))
  const maxCol = Math.min(cols.value - 1, Math.ceil(col + HINT_RADIUS))
  const minRow = Math.max(0, Math.floor(row - HINT_RADIUS))
  const maxRow = Math.min(rows.value - 1, Math.ceil(row + HINT_RADIUS))
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const dr = r - row
      const dc = c - col
      if (dr * dr + dc * dc > radiusSq) continue
      const idx = r * cols.value + c
      const el = dotElements[idx]
      if (el) {
        el.classList.add('is-hint')
        hintedIndices.push(idx)
      }
    }
  }
}

defineExpose({ spawnBurst, mapToColRow, flashKorea, shakeKorea, showHint, clearHint, zoomToKorea, resetZoom, describeCell })

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
  <div
    ref="rootRef"
    class="korea-map"
    :class="{
      'is-game-active': gameActive,
      'is-combo-flashing': isComboFlashing,
      'is-game-over-shaking': isGameOverShaking,
    }"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
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
            'is-city': dot.city && !gameActive,
            'is-selected': dot.city?.id === selectedId && !gameActive,
            [`is-condition-${dot.city?.condition}`]: !!dot.city && !gameActive,
          }"
          :style="
            dot.city && !gameActive
              ? {
                  background: markerColor(dot.city.condition),
                  '--pulse-color': pulseColor(dot.city),
                  '--marker-border-color': markerBorderColor(dot.city),
                }
              : undefined
          "
          @mouseenter="dot.city && !gameActive && handleCityHover(dot, $event)"
          @mouseleave="hoveredDot = null"
          @click="handleDotClick(dot, $event)"
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

/* "한반도 지역 찾기" 게임 진행 중에는 지도 전체가 클릭 가능한 게임판임을 커서로 알린다. */
.korea-map.is-game-active .korea-map__dot {
  cursor: crosshair;
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
  /* 완전히 평평한 단색 도트. 파동이 지나갈 때는 단순히 밝아지는 게 아니라 육지 픽셀에 쓰는
     크림 화이트(--dot-lit)와 섞여, 물결이 반짝이는 "윤슬"처럼 보이게 한다. burst(선택
     이펙트)는 한 겹 더 --burst-color(기본값 크림 화이트, 오답이면 빨간색)로 섞는다. */
  background: #7cc0cb; /* color-mix 미지원 환경 폴백 */
  background-color: color-mix(
    in srgb,
    var(--burst-color, var(--dot-lit)) calc(var(--burst, 0) * 100%),
    color-mix(in srgb, var(--dot-lit) calc(var(--intensity, 0) * 100%), #7cc0cb)
  );
  transform: scale(calc(1 + var(--burst, 0) * 0.8));
  filter: brightness(calc(1 + var(--burst, 0) * 1.2));
  /* 자기 배경색보다 약 15% 어둡게 계산한 box-shadow로 칸 사이 격자 간격을 메워, 바다가
     빈틈없이 꽉 찬 하나의 면처럼 보이게 한다(육지의 영역 구분 기법과 같은 원리). 배경과
     완전히 같은 색이면 테두리가 안 보여서, 육지처럼 한 단계 진하게 뒀다. */
  box-shadow: 0 0 0 2px #69a3ad;
}

.korea-map__dot.is-land {
  /* 평소엔 그대로 육지색, burst가 있으면 --burst-color(기본 크림 화이트, 오답이면 빨간색)로 섞인다. */
  background-color: color-mix(in srgb, var(--burst-color, var(--dot-lit)) calc(var(--burst, 0) * 100%), var(--dot-lit));
  /* 프레스는 어두워지고 오그라들고, burst(선택 이펙트)는 반대로 밝아지며 부풀어 오른다 —
     둘 다 같은 도트에서 동시에 일어날 수 있어 한 식에서 합성한다. */
  filter: brightness(calc(1 - var(--intensity, 0) * 0.4 + var(--burst, 0) * 1.2));
  transform: scale(calc(1 - var(--intensity, 0) * 0.12 + var(--burst, 0) * 0.8));
  /* 배경(바다) 원색과 구분되도록, 육지색보다 약 14% 어둡게 계산한 색으로 칸 사이 간격까지
     둘러 인접한 육지 칸끼리 하나의 영역처럼 이어붙게 한다. */
  box-shadow: 0 0 0 2px #d1cabb;
}

.korea-map__dot.is-city {
  /* 평소엔 z-index를 두지 않는다 — 주변 육지·바다 도트와 같은 자연스러운 쌓임 순서(DOM 순서)를
     따라야 서로의 box-shadow가 이어붙는 "꽉 찬 영역" 느낌이 유지된다. is-city만 z-index로
     들떠 있으면 주변 도트들이 그 테두리를 덮지 못해 마치 다른 레이어에 붙어있는 스티커처럼
     보인다 — 호버·선택처럼 실제로 도드라져야 할 때만 아래에서 position/z-index를 준다. */
  cursor: pointer;
  transition: transform 0.15s ease;
  /* 육지·바다처럼 도시도 꽉 찬 느낌을 내되, 자기 색 그대로면 배경과 구분이 안 돼 마커색을
     15% 어둡게 계산한 --marker-border-color를 쓴다. 두께는 바다(2px)·육지(2px)와 통일했다.
     is-land와 동시에 걸리는 경우(도시는 대부분 육지 위)가 많아, 같은 특이도의 이 규칙이
     스타일시트 순서상 나중이라 자동으로 우선 적용된다. */
  box-shadow: 0 0 0 2px var(--marker-border-color, var(--amber));
}

/* 평상시엔 주변 지형 도트와 완전히 같은 크기 — 확대·글로우·펄스는 호버했을 때만 나타난다.
   이때만 position/z-index를 줘서 이웃 도트 위로 자연스럽게 튀어나오게 한다. */
.korea-map__dot.is-city:hover {
  position: relative;
  z-index: 5;
  transform: scale(1.9);
  box-shadow: 0 0 0 3px var(--pulse-color, var(--amber));
}

.korea-map__dot.is-city.is-selected {
  position: relative;
  z-index: 2;
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

/* 콤보 이펙트 — 연속 정답 시 한반도 육지 전체가 한 번 밝게 빛난다. */
.korea-map.is-combo-flashing .korea-map__dot.is-land {
  animation: korea-combo-flash 0.6s ease-out;
}

@keyframes korea-combo-flash {
  0% {
    filter: brightness(1);
  }
  35% {
    filter: brightness(2);
  }
  100% {
    filter: brightness(1);
  }
}

/* 게임 종료 이펙트 — 한반도 육지 전체가 살짝 들썩인다. 칸마다 다른 --shake-delay(JS가
   매번 무작위로 부여)를 둬서 전부 똑같이 움직이지 않고 물결치듯 어긋나 보이게 한다. */
.korea-map.is-game-over-shaking .korea-map__dot.is-land {
  animation: korea-game-over-shake 1.2s ease-in-out;
  animation-delay: var(--shake-delay, 0s);
}

@keyframes korea-game-over-shake {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  25% {
    transform: translateY(-3px) scale(1.05);
  }
  50% {
    transform: translateY(1px) scale(0.97);
  }
  75% {
    transform: translateY(-1px) scale(1.02);
  }
}

/* 힌트 — 5초 안에 못 맞히면 정답 근처 픽셀이 은은하게 깜빡인다. */
.korea-map__dot.is-hint {
  animation: korea-hint-pulse 1.2s ease-in-out infinite;
}

@keyframes korea-hint-pulse {
  0%,
  100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.6);
  }
}

@media (prefers-reduced-motion: reduce) {
  .korea-map__dot.is-city::after,
  .korea-map__dot.is-condition-rain::before {
    animation: none !important;
    opacity: 0 !important;
  }

  .korea-map__dot,
  .korea-map__dot.is-land,
  .korea-map__dot.is-hint {
    animation: none !important;
    transform: none !important;
    filter: none !important;
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
