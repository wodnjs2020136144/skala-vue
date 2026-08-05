// DotMatrixIcon.vue가 쓰던 비/눈/안개 프레임 계산 로직을 별도 모듈로 뺐다 — 지도의 날씨
// 파티클 오버레이(KoreaMapDots.vue)가 같은 계산을 그대로 재사용하기 위함이다. 좌표는
// PATTERN_GRID(36) 기준 상대 좌표로 나오므로, 호출 측이 자신의 좌표계로 변환해서 쓴다.
// 각 조건의 입자 배열(drops/flakes/layers)은 인스턴스마다 다른 랜덤 패턴을 갖도록 팩토리
// 함수(createRainDrops 등)로 분리했다 — DotMatrixIcon 여러 개가 동시에 떠 있어도 서로
// 다른 타이밍으로 움직이던 기존 동작을 그대로 유지한다.

export const PATTERN_GRID = 36

export const RAIN_COLOR = '#5b8fc7'
export const SNOW_COLOR = '#dcf0fa'
export const FOG_COLOR = '#a7acae'

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

export function createRainDrops(count = 9) {
  return Array.from({ length: count }, () => ({
    x: 2 + Math.floor(Math.random() * (PATTERN_GRID - 4)),
    phase: Math.random() * 40,
    speed: 0.8 + Math.random() * 0.6,
  }))
}

export function computeRainFrame(frame, apply, drops) {
  const totalRows = PATTERN_GRID + 8
  drops.forEach(({ x, phase, speed }) => {
    const exact = ((frame * speed + phase) % totalRows) - 6
    const row = Math.floor(exact)
    const frac = exact - row
    ;[
      [row, 1 - frac],
      [row + 1, frac],
    ].forEach(([cy, weight]) => {
      if (weight <= 0.02) return
      RAINDROP_SHAPE.forEach(([ox, oy]) => apply(x + ox, cy + oy, weight, RAIN_COLOR))
    })
  })
}

const SNOW_LANE_COUNT = 5
const SNOW_LANE_WIDTH = PATTERN_GRID / SNOW_LANE_COUNT
const SNOW_FLAKE_SHAPE = [
  [0, 0],
  [1, 0],
  [2, 0],
  [2, 1],
  [2, -1],
  [-1, 0],
  [-2, 0],
  [-2, 1],
  [-2, -1],
  [0, 1],
  [0, 2],
  [1, 2],
  [-1, 2],
  [0, -1],
  [0, -2],
  [1, -2],
  [-1, -2],
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
]

export function createSnowFlakes() {
  return Array.from({ length: SNOW_LANE_COUNT }, (_, lane) => ({
    x: Math.round(SNOW_LANE_WIDTH / 2 + lane * SNOW_LANE_WIDTH),
    phase: Math.random() * 50,
    speed: 0.12 + Math.random() * 0.08,
  }))
}

export function computeSnowFrame(frame, apply, flakes) {
  const totalRows = PATTERN_GRID + 4
  flakes.forEach(({ x, phase, speed }) => {
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
      SNOW_FLAKE_SHAPE.forEach(([ox, oy]) => apply(cx + ox, cy + oy, weight, SNOW_COLOR))
    })
  })
}

function isInsideEllipse(x, y, cx, cy, rx, ry) {
  const dx = (x - cx) / rx
  const dy = (y - cy) / ry
  return dx * dx + dy * dy <= 1
}

const FOG_LAYER_ROWS = [8, 15, 22, 30]
const FOG_PERIOD = 60

export function createFogLayers() {
  return FOG_LAYER_ROWS.map((baseY, i) => {
    const ellipseCount = 1 + Math.round(Math.random())
    const ellipses = Array.from({ length: ellipseCount }, () => ({
      cx: Math.random() * PATTERN_GRID,
      cy: baseY + (Math.random() - 0.5) * 2,
      rx: 3 + Math.random() * 13,
      ry: 2 + Math.random() * 1.4,
    }))
    return { ellipses, phase: i * 14 + Math.random() * 8 }
  })
}

export function computeFogFrame(frame, apply, layers) {
  layers.forEach((layer) => {
    const t = (frame + layer.phase) % FOG_PERIOD
    const opacity = Math.max(0, Math.sin((t / FOG_PERIOD) * Math.PI * 2))
    if (opacity <= 0.02) return
    const driftX = Math.sin((frame + layer.phase) * 0.02) * 2
    layer.ellipses.forEach((e) => {
      for (let y = 0; y < PATTERN_GRID; y++) {
        for (let x = 0; x < PATTERN_GRID; x++) {
          if (isInsideEllipse(x, y, e.cx + driftX, e.cy, e.rx, e.ry)) {
            apply(x, y, opacity, FOG_COLOR)
          }
        }
      }
    })
  })
}
