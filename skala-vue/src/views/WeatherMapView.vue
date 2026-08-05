<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useConfigStore } from '../stores/configStore'
import { useFavoritesStore } from '../stores/favoritesStore'
import { useSearchStore } from '../stores/searchStore'
import { useDemoStore } from '../stores/demoStore'
import { CITY_LIST, fetchCurrentWeather, getDummyWeather } from '../services/weatherApi'
import { MAP_LANDMARKS } from '../services/gameRegions'
import { useDraggable } from '../composables/useDraggable'
import { useRegionGame } from '../composables/useRegionGame'
import KoreaMapDots from '../components/practices/weather/KoreaMapDots.vue'
import FavoriteHeartDots from '../components/practices/weather/FavoriteHeartDots.vue'
import WeatherStatsPanel from '../components/practices/weather/WeatherStatsPanel.vue'
import DotMatrixIcon from '../components/practices/weather/DotMatrixIcon.vue'
import PixelTempIcon from '../components/practices/weather/PixelTempIcon.vue'
import DotStatBar from '../components/practices/weather/DotStatBar.vue'
import UnitToggler from '../components/UnitToggler.vue'

const route = useRoute()
const configStore = useConfigStore()
const favoritesStore = useFavoritesStore()
const searchStore = useSearchStore()
const demoStore = useDemoStore()

const cityList = ref([])
const isLoading = ref(true)
const loadError = ref('')
const selectedId = ref(null)
const mapDotsRef = ref(null)

async function loadCities() {
  isLoading.value = true
  loadError.value = ''
  try {
    cityList.value = demoStore.useDummyData
      ? CITY_LIST.map((city) => getDummyWeather(city))
      : await Promise.all(CITY_LIST.map((city) => fetchCurrentWeather(city)))
  } catch (err) {
    loadError.value = '날씨 정보를 불러오지 못했습니다. API Key와 네트워크 상태를 확인해 주세요.'
    console.error('[WeatherMapView] 날씨 조회 실패:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadCities()
  // 상단 네비게이션의 즐겨찾기 칩에서 넘어온 경우(?city=id), 해당 도시 팝업을 자동으로 연다.
  const cityId = route.query.city
  if (cityId) {
    const city = cityList.value.find((c) => c.id === cityId)
    if (city) selectCityById(city)
  }
  window.addEventListener('resize', handleWindowResize)

  // 게임 창의 초기 위치는 오른쪽 위 — 실제 렌더 크기를 아직 모르므로 대략적인 폭(240px)으로
  // clamp해둔다. 이후 사용자가 드래그하면 그때 실측 크기로 다시 clamp된다.
  gameWindowDrag.setPosition(window.innerWidth - GAME_WINDOW_WIDTH_ESTIMATE - 16, WINDOW_TOP_OFFSET, GAME_WINDOW_WIDTH_ESTIMATE, 200)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize)
})

watch(() => demoStore.useDummyData, loadCities)

// 이미 /map에 있는 상태에서 다른 즐겨찾기의 "지도에서 보기"를 누르면 같은 라우트(쿼리만
// 다름)라 컴포넌트가 재마운트되지 않아 onMounted가 다시 실행되지 않는다 — 그 경우를
// route.query.city 변경 감시로 보완한다(최초 진입은 위 onMounted가 그대로 처리).
watch(
  () => route.query.city,
  (cityId) => {
    if (!cityId) return
    const city = cityList.value.find((c) => c.id === cityId)
    if (city) selectCityById(city)
  },
)

// 상단 검색창에 입력한 이름이 지도의 도시 이름과 정확히 일치하면 그 도시 팝업을 연다.
// 부분 일치로 하면 첫 글자만 쳐도 팝업이 열려버려서 완전 일치로 제한한다.
watch(
  () => searchStore.query,
  (query) => {
    if (!query) return
    const city = cityList.value.find((c) => c.name === query)
    if (city) selectCityById(city)
  },
)

const selectedCity = computed(() => cityList.value.find((city) => city.id === selectedId.value) ?? null)

const displayTemp = computed(() => {
  if (!selectedCity.value) return null
  return configStore.unit === 'imperial'
    ? Math.round((selectedCity.value.temp * 9) / 5 + 32)
    : selectedCity.value.temp
})

// 정보창(즐겨찾기·순위)의 온도 표시도 ℃/℉ 전환을 반영한다.
function convertTemp(celsius) {
  return configStore.unit === 'imperial' ? Math.round((celsius * 9) / 5 + 32) : celsius
}

// 즐겨찾기한 도시를 실시간 날씨(cityList)에서 찾아 보여준다.
const favoriteCitiesWithWeather = computed(() =>
  cityList.value.filter((city) => favoritesStore.isFavorite(city.id)),
)

// 온도 기준 TOP3. WeatherHomeView의 hottestCity/coldestCity와 같은 계산을 3개까지 확장한 것이다.
const hottestThree = computed(() => [...cityList.value].sort((a, b) => b.temp - a.temp).slice(0, 3))
const coldestThree = computed(() => [...cityList.value].sort((a, b) => a.temp - b.temp).slice(0, 3))

// --- 드래그 가능한 창 3개 (정보창 · 게임창 · 도시 팝업) ---
// 창 헤더 아래에 배치될 초기 y 좌표. 이 창들은 position:fixed(뷰포트 기준)라, nav 바(약
// 57px)에 가려지지 않도록 처음엔 그 아래에서 시작한다. 사용자가 드래그하면 그 이후로는
// 자유롭게 옮길 수 있다.
const WINDOW_TOP_OFFSET = 76
const GAME_WINDOW_WIDTH_ESTIMATE = 240

const infoWindowDrag = useDraggable({ x: 16, y: WINDOW_TOP_OFFSET })
const gameWindowDrag = useDraggable({ x: 16, y: WINDOW_TOP_OFFSET })

// ≤1000px(태블릿·모바일)에서는 정보창·게임창이 드래그 창 대신 화면 하단 접이식 시트로
// 바뀐다(CSS 미디어 쿼리, 아래 style). 좁은 화면에서 둘 다 펼치면 지도를 거의 다 가리므로
// 한 번에 하나만 열리게 관리한다. 넓은 화면에서는 이 값과 무관하게 항상 둘 다 보인다.
const mobileSheet = ref(null) // null | 'info' | 'game'
function toggleMobileSheet(name) {
  mobileSheet.value = mobileSheet.value === name ? null : name
}

const POPUP_MARGIN = 12
// 실측 크기가 화면보다 커서 팝업을 통째로 축소해야 할 때, 글씨를 읽을 수 있는 최소 배율.
const MIN_FIT_SCALE = 0.7

const popupRef = ref(null)
const popupDrag = useDraggable({ x: 0, y: 0 })
const popupFitScale = ref(1)
// 창 리사이즈 중에도 같은 지점을 중심으로 다시 계산하기 위해 마지막으로 연 좌표를 기억해둔다.
let lastPopupCenter = null

// 팝업이 실제로 렌더링된 뒤 그 크기를 직접 측정해 위치를 계산한다 — 어림값을 콘텐츠가
// 바뀔 때마다 다시 맞춰야 했던 문제를 없앤다. 클릭 지점(또는 화면 중앙)을 팝업의 중심으로
// 두되, 실측 크기가 화면보다 크면 팝업 전체를 축소(fit-scale)해서 스크롤 없이 다 보이게
// 한다. offsetHeight/Width는 transform의 영향을 받지 않으므로 트랜지션·스케일과 무관하게
// 정확하다. 새로 여는 팝업은 사용자가 이전에 드래그해 옮겼던 기록(hasMoved)을 초기화해
// 다시 클릭 지점 기준으로 뜨게 한다.
async function positionPopupAt(centerX, centerY) {
  lastPopupCenter = { x: centerX, y: centerY }
  popupDrag.hasMoved.value = false
  await nextTick()
  const el = popupRef.value
  if (!el) return
  const rawH = el.offsetHeight
  const rawW = el.offsetWidth
  const availH = window.innerHeight - POPUP_MARGIN * 2
  const availW = window.innerWidth - POPUP_MARGIN * 2

  const fitScale = Math.max(MIN_FIT_SCALE, Math.min(1, availH / rawH, availW / rawW))
  popupFitScale.value = fitScale
  const h = rawH * fitScale
  const w = rawW * fitScale

  const left = Math.max(POPUP_MARGIN, Math.min(centerX - w / 2, window.innerWidth - w - POPUP_MARGIN))
  const top = Math.max(POPUP_MARGIN, Math.min(centerY - h / 2, window.innerHeight - h - POPUP_MARGIN))
  popupDrag.setPosition(left, top, w, h)
}

function selectCity({ city, rect }) {
  selectedId.value = city.id
  positionPopupAt((rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2)
}

function selectCityById(city) {
  selectedId.value = city.id
  positionPopupAt(window.innerWidth / 2, window.innerHeight / 2)
}

function closePopup() {
  selectedId.value = null
  lastPopupCenter = null
}

// 팝업이 열린 채로 창 크기가 바뀌면: 사용자가 직접 옮긴 적이 없으면 클릭 지점 기준으로
// 다시 계산하고, 이미 드래그로 옮긴 상태라면 그 위치는 존중하되 화면 밖으로 나가지 않게만
// 다시 clamp한다.
function handleWindowResize() {
  if (!selectedCity.value) return
  if (popupDrag.hasMoved.value) {
    const el = popupRef.value
    if (!el) return
    const w = el.offsetWidth * popupFitScale.value
    const h = el.offsetHeight * popupFitScale.value
    popupDrag.setPosition(popupDrag.position.value.x, popupDrag.position.value.y, w, h)
    return
  }
  if (!lastPopupCenter) return
  positionPopupAt(lastPopupCenter.x, lastPopupCenter.y)
}

// --- "한반도 지역 찾기" 미니게임 ---
const game = useRegionGame()

function startGame() {
  closePopup() // 게임 중엔 날씨 팝업이 화면을 가리지 않도록 미리 닫는다.
  mobileSheet.value = 'game' // 좁은 화면에서 게임을 시작하면 게임 시트를 자동으로 연다.
  game.startGame()
}

// 게임이 진행 중일 때만 지도가 클릭을 map-pick으로 보낸다(KoreaMapDots의 gameActive prop).
// 정답 위치에는 항상(기존 크림색 burst), 완전 오답이면 클릭한 위치에도 빨간 burst를 추가로
// 띄워 "여기가 틀렸다"를 바로 알 수 있게 한다 — 근접(near)은 감점도 없고 다른 지역과
// 겹쳤을 뿐이므로 빨간 burst 없이 정답과 같은 크림색 burst만 준다. 콤보가 2 이상이고
// 짝수일 때만(2·4·6...) 한반도 전체가 한 번 빛나는 이펙트를 띄운다 — 매번 띄우면(연속
// 정답마다) 한반도 육지 도트 수백 개에 동시에 애니메이션이 걸려 게임 중 렉의 주된 원인이
// 됐었다. 발동 빈도를 절반으로 줄여 반짝이는 손맛은 남기되 빈도 자체를 낮춘다.
function handleMapPick({ col, row }) {
  const result = game.submitGuess(
    col,
    row,
    (mapX, mapY) => mapDotsRef.value?.mapToColRow(mapX, mapY),
    (c, r) => mapDotsRef.value?.describeCell(c, r),
  )
  if (!result) return
  mapDotsRef.value?.spawnBurst(result.answer.col, result.answer.row, 'correct')
  if (result.tier === 'correct') {
    if (game.combo.value >= 2 && game.combo.value % 2 === 0) mapDotsRef.value?.flashKorea()
  } else if (result.tier === 'wrong') {
    mapDotsRef.value?.spawnBurst(result.clicked.col, result.clicked.row, 'wrong')
  }
}

// 게임 상태 전환에 맞춰 지도 줌을 함께 바꾼다: 시작하면 한반도가 화면을 크게 채우도록
// 확대하고, 끝나면(시간 종료든 문제를 다 풀었든) 한반도가 들썩이는 이펙트와 함께 원래
// 축소 상태로 되돌아온다.
watch(
  () => game.status.value,
  (status) => {
    if (status === 'playing') {
      mapDotsRef.value?.zoomToKorea()
    } else if (status === 'finished') {
      mapDotsRef.value?.shakeKorea()
      mapDotsRef.value?.resetZoom()
    }
  },
)

// 라운드 시작 후 일정 시간 답을 못 맞히면 game.hintRegion이 채워진다 — 그 위치 근처를
// 지도에서 은은하게 깜빡이게 하고, 다음 라운드로 넘어가 다시 null이 되면 지운다.
watch(
  () => game.hintRegion.value,
  (region) => {
    if (!region) {
      mapDotsRef.value?.clearHint()
      return
    }
    const pos = mapDotsRef.value?.mapToColRow(region.mapX, region.mapY)
    if (pos) mapDotsRef.value?.showHint(pos.col, pos.row)
  },
)

const formattedTimeLeft = computed(() => {
  const total = Math.max(0, game.timeLeft.value)
  const m = Math.floor(total / 60).toString().padStart(2, '0')
  const s = (total % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

// 라운드 결과에 반응하는 픽셀 마스코트 — 새 애셋을 만들지 않고 기존 날씨 아이콘을 재사용한다.
const mascotCondition = computed(() => {
  const result = game.lastResult.value
  if (!result) return 'cloud'
  if (result.tier === 'correct') return 'sun'
  if (result.tier === 'near') return 'cloud'
  return 'rain'
})

// --- 시간대 슬라이더 ---
// 실제 "지금" 대신 임의의 시각(0~24시)을 지정해 지도의 낮/밤 톤·바다색을 미리 볼 수 있게
// 한다. null이면(슬라이더를 만지지 않은 기본 상태) 지금까지처럼 항상 실제 현재 시각을 쓴다.
const timeOverrideHour = ref(null)

function hourFromUnix(unixSeconds) {
  const d = new Date(unixSeconds * 1000)
  return d.getHours() + d.getMinutes() / 60
}

const effectiveHour = computed(() => {
  if (timeOverrideHour.value != null) return timeOverrideHour.value
  const now = new Date()
  return now.getHours() + now.getMinutes() / 60
})

// 슬라이더 v-model용 get/set 프록시 — 조작 전에는 지금 시각을 그대로 보여주다가, 사용자가
// 움직이는 순간부터 timeOverrideHour가 값을 갖는다.
const sliderHour = computed({
  get: () => effectiveHour.value,
  set: (value) => {
    timeOverrideHour.value = value
  },
})

function resetTimeOverride() {
  timeOverrideHour.value = null
}

const formattedEffectiveHour = computed(() => {
  const hour = ((effectiveHour.value % 24) + 24) % 24
  const h = Math.floor(hour).toString().padStart(2, '0')
  const m = Math.round((hour - Math.floor(hour)) * 60)
    .toString()
    .padStart(2, '0')
  return `${h}:${m}`
})

// 낮/밤 지도 톤 — 대표 도시(서울)의 일출/일몰과 (슬라이더로 바꾼) 시각을 비교해 밤이면
// 지도 전체를 살짝 어둡게 낮춘다. 도시마다 일출·일몰이 조금씩 달라 정확히 "우리 동네 기준"은
// 아니지만, 전국이 한 화면에 다 보이는 지도 특성상 대표 도시 하나로 근사해도 충분하다.
const isNight = computed(() => {
  const seoul = cityList.value.find((city) => city.id === 'city_01')
  if (!seoul?.sunrise || !seoul?.sunset) return false
  if (timeOverrideHour.value == null) {
    const now = Date.now() / 1000
    return now < seoul.sunrise || now > seoul.sunset
  }
  const sunriseHour = hourFromUnix(seoul.sunrise)
  const sunsetHour = hourFromUnix(seoul.sunset)
  return effectiveHour.value < sunriseHour || effectiveHour.value > sunsetHour
})

// 시각별 바다색 — 자정 짙은 남색 → 새벽 보랏빛 주황 → 한낮 기본 --sea 색 → 노을 주황 → 다시 밤
// 순으로 선형 보간한다. 슬라이더를 안 만졌을 때도 실제 시각 기준으로 항상 계산되지만,
// 낮 시간대(9~17시)는 기존 --sea 색과 동일해 평소엔 눈에 띄는 변화가 없다.
const SEA_TONE_STOPS = [
  { hour: 0, color: [43, 58, 85] },
  { hour: 5, color: [43, 58, 85] },
  { hour: 7, color: [201, 161, 92] },
  { hour: 9, color: [92, 156, 168] },
  { hour: 17, color: [92, 156, 168] },
  { hour: 19, color: [217, 138, 74] },
  { hour: 21, color: [43, 58, 85] },
  { hour: 24, color: [43, 58, 85] },
]
function lerpColor(a, b, t) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t))
}
const seaTone = computed(() => {
  const hour = ((effectiveHour.value % 24) + 24) % 24
  for (let i = 0; i < SEA_TONE_STOPS.length - 1; i++) {
    const cur = SEA_TONE_STOPS[i]
    const next = SEA_TONE_STOPS[i + 1]
    if (hour >= cur.hour && hour <= next.hour) {
      const t = (hour - cur.hour) / (next.hour - cur.hour || 1)
      const [r, g, b] = lerpColor(cur.color, next.color, t)
      return `rgb(${r}, ${g}, ${b})`
    }
  }
  return 'rgb(92, 156, 168)'
})

// --- 지도 효과 토글: 레이더 스윕 · 두 도시 비교 ---
// 평소엔 꺼둔 상태로 시작하고, 필요할 때만 사용자가 직접 켠다.
const radarEnabled = ref(false)

const isCompareMode = ref(false)
function handleCompareModeChange(value) {
  isCompareMode.value = value
}
function toggleCompareMode() {
  mapDotsRef.value?.toggleCompareMode()
}
</script>

<template>
  <div class="weather-map" :class="{ 'is-night': isNight }" :style="{ '--sea-tone': seaTone }">
    <p v-if="isLoading" class="status-message">날씨 정보를 불러오는 중...</p>
    <p v-else-if="loadError" class="status-message status-message--error">{{ loadError }}</p>

    <template v-else>
      <div class="weather-map__body">
        <div class="weather-map__grid-area">
          <KoreaMapDots ref="mapDotsRef" :cities="cityList" :landmarks="MAP_LANDMARKS" :selected-id="selectedId"
            :game-active="game.status.value === 'playing'" :radar-enabled="radarEnabled"
            @select-city="selectCity" @map-pick="handleMapPick"
            @compare-mode-change="handleCompareModeChange" />
        </div>

        <!-- 정보창: 즐겨찾기 + 오늘의 순위 + 지도 효과 토글을 한 창에 통합. 넓은 화면에서는
             헤더를 잡고 끄는 드래그 창, ≤1000px에서는 하단 탭으로 여닫는 시트로 바뀐다(CSS). -->
        <div class="map-window map-window--info" data-draggable-window :class="{ 'is-sheet-open': mobileSheet === 'info' }"
          :style="{ '--win-x': `${infoWindowDrag.position.value.x}px`, '--win-y': `${infoWindowDrag.position.value.y}px` }">
          <div class="map-window__header" @pointerdown="infoWindowDrag.startDrag">
            <FavoriteHeartDots :active="true" :size="14" />
            <span>즐겨찾기 · 오늘의 순위</span>
          </div>
          <div class="map-window__body">
            <section class="map-window__section">
              <h3 class="map-window__section-title">지도 효과</h3>
              <label class="map-window__toggle">
                <input v-model="radarEnabled" type="checkbox" />
                레이더 스윕
              </label>
              <button class="map-window__compare-btn" :class="{ 'is-active': isCompareMode }"
                :disabled="game.status.value === 'playing'" @click="toggleCompareMode">
                {{ isCompareMode ? '두 도시 비교 종료' : '두 도시 비교' }}
              </button>
              <div class="map-window__time">
                <span class="map-window__time-label">시간대 {{ formattedEffectiveHour }}</span>
                <input v-model.number="sliderHour" type="range" min="0" max="23.9" step="0.1" class="map-window__time-slider" />
                <button v-if="timeOverrideHour !== null" class="map-window__time-reset" @click="resetTimeOverride">
                  현재 시각으로
                </button>
              </div>
            </section>

            <section class="map-window__section">
              <h3 class="map-window__section-title">즐겨찾기</h3>
              <!-- 이름+온도만 보여주던 목록을, 온도·습도·풍속을 한눈에 비교할 수 있는 표로
                   확장했다(창 폭이 220px로 좁아 헤더는 축약). -->
              <div v-if="favoriteCitiesWithWeather.length > 0" class="fav-compare">
                <div class="fav-compare__row fav-compare__row--head">
                  <span>도시</span><span>기온</span><span>습도(%)</span><span>풍속(m/s)</span>
                </div>
                <button v-for="city in favoriteCitiesWithWeather" :key="city.id" class="fav-compare__row"
                  @click="selectCityById(city)">
                  <span class="fav-compare__name">{{ city.name }}</span>
                  <span>{{ convertTemp(city.temp) }}{{ configStore.unitSymbol }}</span>
                  <span>{{ city.humidity }}</span>
                  <span>{{ city.windSpeed }}</span>
                </button>
              </div>
              <p v-else class="map-window__empty">
                즐겨찾기한 도시가 없어요
              </p>
            </section>

            <section class="map-window__section">
              <h3 class="map-window__section-title">오늘의 순위</h3>
              <p class="map-window__subtitle">
                <PixelTempIcon variant="hot" :size="14" /> 가장 더운 지역
              </p>
              <button v-for="(city, index) in hottestThree" :key="city.id" class="map-window__item"
                @click="selectCityById(city)">
                <span class="map-window__rank">{{ index + 1 }}</span>
                <span class="map-window__item-name">{{ city.name }}</span>
                <span class="map-window__item-temp">{{ convertTemp(city.temp) }}{{ configStore.unitSymbol }}</span>
              </button>
              <p class="map-window__subtitle">
                <PixelTempIcon variant="cold" :size="14" /> 가장 추운 지역
              </p>
              <button v-for="(city, index) in coldestThree" :key="city.id" class="map-window__item"
                @click="selectCityById(city)">
                <span class="map-window__rank">{{ index + 1 }}</span>
                <span class="map-window__item-name">{{ city.name }}</span>
                <span class="map-window__item-temp">{{ convertTemp(city.temp) }}{{ configStore.unitSymbol }}</span>
              </button>
            </section>
          </div>
        </div>

        <!-- 게임창: 한반도 지역 찾기. 게임 시작을 누르면 지도 자체가 게임판이 된다. -->
        <div class="map-window map-window--game" data-draggable-window :class="{ 'is-sheet-open': mobileSheet === 'game' }"
          :style="{ '--win-x': `${gameWindowDrag.position.value.x}px`, '--win-y': `${gameWindowDrag.position.value.y}px` }">
          <div class="map-window__header" @pointerdown="gameWindowDrag.startDrag">
            <span>한반도 지역 찾기</span>
          </div>
          <div class="map-window__body map-window__body--game">
            <template v-if="game.status.value === 'idle'">
              <p class="game-window__desc">
                지도에서 문제로 나온 지역을 클릭해서 맞혀보세요! (10문제 30초)
              </p>
              <p class="game-window__best">최고 기록: {{ game.bestScore.value }}점</p>
              <button class="game-window__start-btn" @pointerdown.stop @click="startGame">게임 시작</button>
            </template>

            <template v-else-if="game.status.value === 'playing'">
              <DotMatrixIcon :condition="mascotCondition" size="sm" :animated="true" />
              <p class="game-window__prompt">찾아라! <strong>{{ game.currentRegion.value?.name }}</strong></p>
              <DotStatBar label="남은 시간" :value="(game.timeLeft.value / game.timeLimit) * 100"
                :display-value="formattedTimeLeft" />
              <p class="game-window__stats">
                점수 {{ game.score.value }} · {{ game.roundIndex.value + 1 }}/{{ game.totalRounds }} · 콤보 {{
                  game.combo.value }}
              </p>
              <p v-if="game.lastResult.value" class="game-window__feedback"
                :class="{ 'is-correct': game.lastResult.value.tier === 'correct', 'is-near': game.lastResult.value.tier === 'near' }">
                {{
                  game.lastResult.value.tier === 'correct'
                    ? `정답! +${game.lastResult.value.points}`
                    : game.lastResult.value.tier === 'near'
                      ? `아깝다! 정답은 ${game.lastResult.value.region.name} · 그래도 근처라 +${game.lastResult.value.points}`
                      : `아쉬워요! 정답은 ${game.lastResult.value.region.name} · 클릭한 곳: ${game.lastResult.value.clickedRegionName} · -${game.lastResult.value.penalty}`
                }}
              </p>
            </template>

            <template v-else-if="game.status.value === 'finished'">
              <DotMatrixIcon condition="sun" size="sm" :animated="true" />
              <p class="game-window__result">최종 점수 {{ game.score.value }}점</p>
              <ol class="game-window__leaderboard">
                <li v-for="(entry, index) in game.leaderboard.value" :key="`${index}-${entry}`"
                  :class="{ 'is-current': index === game.lastRankIndex.value }">
                  {{ index + 1 }}위 · {{ entry }}점
                </li>
              </ol>
              <button class="game-window__start-btn" @pointerdown.stop @click="startGame">다시 하기</button>
            </template>
          </div>
        </div>

        <!-- ≤1000px 전용 하단 탭바 — 정보창·게임창을 시트로 여닫는다. 넓은 화면에서는 CSS로 숨긴다. -->
        <div class="mobile-sheet-tabs">
          <button class="mobile-sheet-tabs__btn" :class="{ 'is-active': mobileSheet === 'info' }"
            @click="toggleMobileSheet('info')">
            정보
          </button>
          <button class="mobile-sheet-tabs__btn" :class="{ 'is-active': mobileSheet === 'game' }"
            @click="toggleMobileSheet('game')">
            게임
          </button>
        </div>
      </div>

      <Transition name="popup">
        <div v-if="selectedCity" class="popup-backdrop" @click="closePopup">
          <div ref="popupRef" class="weather-popup" data-draggable-window :style="{
            left: `${popupDrag.position.value.x}px`,
            top: `${popupDrag.position.value.y}px`,
            '--fit-scale': popupFitScale,
          }" @click.stop>
            <div class="weather-popup__inner">
              <div class="weather-popup__head" @pointerdown="popupDrag.startDrag">
                <p class="weather-popup__name">{{ selectedCity.name }}</p>
                <div class="weather-popup__head-actions" @pointerdown.stop>
                  <UnitToggler />
                  <button class="weather-popup__fav-btn" :aria-pressed="favoritesStore.isFavorite(selectedCity.id)"
                    aria-label="즐겨찾기 추가/해제" @click="favoritesStore.toggleFavorite(selectedCity.id)">
                    <FavoriteHeartDots :active="favoritesStore.isFavorite(selectedCity.id)" :size="20" />
                  </button>
                  <button class="weather-popup__close-btn" aria-label="닫기" @click="closePopup">✕</button>
                </div>
              </div>

              <p class="weather-popup__temp">
                {{ displayTemp }}<span>{{ configStore.unitSymbol }}</span>
              </p>

              <WeatherStatsPanel :city="selectedCity" compact />
            </div>
          </div>
        </div>
      </Transition>
    </template>
  </div>
</template>

<style scoped>
.weather-map {
  display: flex;
  flex-direction: column;
  /* --nav-h는 App.vue가 nav 실제 높이를 ResizeObserver로 재서 넣어준다(모바일에서 nav가
     줄바꿈돼 높이가 늘어나도 이 값을 그대로 따라간다). 57px는 그 값이 아직 안 잡혔을 때의
     대체값(초기 nav 높이와 동일). 100dvh로 모바일 주소창에 따른 높이 변화도 반영한다. */
  min-height: calc(100dvh - var(--nav-h, 57px));
  margin: 0;
  padding: 0;
  /* --sea-tone은 시간대 슬라이더(seaTone computed)가 매번 계산해 내려주는 값 — 낮 시간대는
     기존 --sea와 같은 색이라 슬라이더를 안 만지면 눈에 띄는 변화가 없다. */
  background-color: var(--sea-tone, var(--sea));
  animation: sea-shimmer 6s ease-in-out infinite;
  will-change: filter;
  transition: background-color 0.4s ease;
}

/* 낮/밤 톤 — sea-shimmer가 이미 filter를 계속 애니메이션하고 있어(찰랑이는 효과), 별도
   static filter를 얹으면 애니메이션에 가려 아무 효과가 없다. 그래서 밤에는 애니메이션
   이름 자체를 더 어둡게 시작하는 변형(sea-shimmer-night)으로 바꿔치기한다 — 도트 색상
   대비는 유지하면서 과하지 않게 살짝만 어둡게. */
.weather-map.is-night {
  animation-name: sea-shimmer-night;
}

.weather-map__body {
  position: relative;
  flex: 1;
  min-height: 0;
}

.weather-map__grid-area {
  position: absolute;
  inset: 0;
}

/* 드래그 가능한 창의 공통 뼈대 — 정보창·게임창이 함께 쓴다. position:fixed로 둬서
   드래그 좌표(뷰포트 기준 clientX/clientY 델타)와 좌표계가 일치한다. 팝업(z-index:50)
   보다는 낮게 둬서 팝업이 항상 그 위에 보인다. */
.map-window {
  position: fixed;
  left: var(--win-x);
  top: var(--win-y);
  z-index: 10;
  width: 220px;
  max-height: calc(100dvh - 32px);
  display: flex;
  flex-direction: column;
  background: var(--paper);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.map-window__header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: var(--ink);
  color: var(--paper);
  font-family: var(--font-pixel-kr);
  font-size: 13px;
  letter-spacing: 0.05em;
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.map-window__header:active {
  cursor: grabbing;
}

.map-window__body {
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.map-window__section+.map-window__section {
  margin-top: 12px;
}

.map-window__section-title {
  margin: 0 0 8px;
  font-family: var(--font-pixel-kr);
  font-size: 13px;
  color: var(--ink);
}

.map-window__toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 6px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink);
  cursor: pointer;
}

.map-window__compare-btn {
  width: 100%;
  margin: 4px 0 10px;
  border: 1px solid var(--moss);
  background: none;
  border-radius: 8px;
  padding: 6px 8px;
  font-family: var(--font-pixel-kr);
  font-size: 12px;
  color: var(--ink);
  cursor: pointer;
}

.map-window__compare-btn.is-active {
  background: var(--amber);
  border-color: var(--amber);
}

.map-window__compare-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.map-window__time {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.map-window__time-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--moss);
}

.map-window__time-slider {
  width: 100%;
  accent-color: var(--amber);
}

.map-window__time-reset {
  align-self: flex-start;
  border: none;
  background: none;
  padding: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--amber);
  text-decoration: underline;
  cursor: pointer;
}

.map-window__subtitle {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 12px 0 4px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--moss);
}

.map-window__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  border: none;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  padding: 6px 8px;
  cursor: pointer;
  text-align: left;
}

.map-window__item:hover {
  background: rgba(0, 0, 0, 0.08);
}

.map-window__rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--amber);
  color: var(--ink);
  font-family: var(--font-pixel);
  font-size: 10px;
}

.map-window__item-name {
  flex: 1;
  font-family: var(--font-pixel-kr);
  font-size: 12px;
  color: var(--ink);
}

.map-window__item-temp {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--amber);
}

.map-window__empty {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--moss);
}

/* 즐겨찾기 비교표 — 도시/기온/습도/풍속 4열. 이름 열만 넓게(1fr), 나머지는 숫자 폭에 맞춰
   고정폭으로 좁게 둬 220px짜리 좁은 창 안에서도 잘리지 않게 한다. */
.fav-compare {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fav-compare__row {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) repeat(3, minmax(30px, 0.7fr));
  align-items: center;
  gap: 4px;
  border: none;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  padding: 6px 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink);
  text-align: right;
  cursor: pointer;
}

/* 헤더/값 모든 칸이 좁은 창 폭에서 넘칠 수 있어(예: "3.5" 뒤 단위는 헤더로 뺐지만, 두 자리
   습도·풍속 값도 여유가 빠듯하다) 넘치면 잘라내고 줄바꿈은 절대 하지 않게 방어한다. */
.fav-compare__row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fav-compare__row:hover {
  background: rgba(0, 0, 0, 0.08);
}

.fav-compare__row--head {
  background: none;
  color: var(--moss);
  cursor: default;
  padding: 0 8px;
}

.fav-compare__name {
  font-family: var(--font-pixel-kr);
  text-align: left;
}

/* 게임창 내부 — 아이콘/문구/게이지가 세로로 쌓이고 가운데 정렬된다. */
.map-window__body--game {
  align-items: center;
  text-align: center;
  gap: 8px;
}

.game-window__desc {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink);
  line-height: 1.5;
}

.game-window__best {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--moss);
}

.game-window__start-btn {
  margin-top: 4px;
  border: none;
  border-radius: 10px;
  background: var(--amber);
  color: var(--ink);
  font-family: var(--font-pixel-kr);
  font-size: 13px;
  padding: 10px 20px;
  cursor: pointer;
}

.game-window__prompt {
  margin: 0;
  width: 100%;
  font-family: var(--font-pixel-kr);
  font-size: 14px;
  color: var(--ink);
}

.game-window__stats {
  margin: 0;
  width: 100%;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--moss);
}

.game-window__feedback {
  margin: 0;
  font-family: var(--font-pixel-kr);
  font-size: 13px;
  color: var(--amber);
}

.game-window__feedback.is-correct {
  color: var(--moss);
}

.game-window__feedback.is-near {
  color: var(--sea);
}

.game-window__result {
  margin: 0;
  font-family: var(--font-pixel-kr);
  font-size: 16px;
  color: var(--ink);
}

.game-window__leaderboard {
  width: 100%;
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 180px;
  overflow-y: auto;
}

.game-window__leaderboard li {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--moss);
  text-align: left;
  padding: 2px 6px;
  border-radius: 6px;
}

.game-window__leaderboard li.is-current {
  background: rgba(0, 0, 0, 0.06);
  color: var(--ink);
  font-weight: 600;
}

.mobile-sheet-tabs {
  display: none;
}

/* ≤1000px(태블릿·모바일): 정보창·게임창을 드래그 창 대신 화면 하단 접이식 시트로 바꾼다.
   position은 그대로 fixed지만 좌표를 JS 드래그 값(--win-x/--win-y) 대신 이 미디어 쿼리가
   직접 지정해 화면 폭에 맞춘다 — 인라인 style이 아니라 CSS 변수를 거치게 해둔 덕에
   여기서 자연스럽게 override된다. 시트는 한 번에 하나만(.is-sheet-open) 펼쳐진다. */
@media (max-width: 1000px) {
  .map-window--info,
  .map-window--game {
    left: 0;
    top: auto;
    right: 0;
    bottom: 56px;
    width: 100%;
    max-width: 100%;
    max-height: 55dvh;
    border-radius: 16px 16px 0 0;
    transform: translateY(100%);
    transition: transform 0.25s ease;
    z-index: 15;
  }

  .map-window--info.is-sheet-open,
  .map-window--game.is-sheet-open {
    transform: translateY(0);
  }

  /* 시트 상태에서는 드래그로 옮길 수 없으므로 손잡이 커서를 보통 헤더처럼 되돌린다. */
  .map-window--info .map-window__header,
  .map-window--game .map-window__header {
    cursor: default;
  }

  .weather-map__body {
    /* 하단 탭바(56px)만큼 지도 아래 여백을 둬 제주 등 남쪽 도트가 탭바에 가리지 않게 한다. */
    padding-bottom: 56px;
  }

  .mobile-sheet-tabs {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 16;
    display: flex;
    height: 56px;
    background: var(--ink);
    border-top: 2px solid var(--amber);
  }

  .mobile-sheet-tabs__btn {
    flex: 1;
    border: none;
    background: none;
    color: var(--paper);
    font-family: var(--font-pixel-kr);
    font-size: 13px;
    letter-spacing: 0.05em;
    cursor: pointer;
  }

  .mobile-sheet-tabs__btn.is-active {
    color: var(--amber);
  }
}

@keyframes sea-shimmer {

  0%,
  100% {
    filter: brightness(1) saturate(1);
  }

  50% {
    filter: brightness(1.05) saturate(1.08);
  }
}

@keyframes sea-shimmer-night {

  0%,
  100% {
    filter: brightness(0.82) saturate(0.9);
  }

  50% {
    filter: brightness(0.87) saturate(0.96);
  }
}

.status-message {
  text-align: center;
  font-family: var(--font-mono);
  color: var(--paper);
  font-size: 13px;
  margin-top: 24px;
}

.status-message--error {
  color: var(--amber);
}

/* 팝업 */
.popup-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
}

/* 위치 + fit-scale 전담. 트랜지션의 scale(0.9)와 겹치면 offsetHeight 실측이 흔들리므로
   등장/퇴장 애니메이션은 안쪽 .weather-popup__inner에서 따로 처리한다. */
.weather-popup {
  position: fixed;
  width: 320px;
  transform: scale(var(--fit-scale, 1));
  transform-origin: top left;
  /* MIN_FIT_SCALE(0.7)에도 화면에 안 들어가는 극단적인 경우를 위한 최후의 안전장치 */
  max-height: calc(100vh - 24px);
  overflow-y: auto;
}

.weather-popup__inner {
  background: var(--paper);
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.popup-enter-active .weather-popup__inner,
.popup-leave-active .weather-popup__inner {
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;
}

.popup-enter-from .weather-popup__inner,
.popup-leave-to .weather-popup__inner {
  transform: scale(0.9);
  opacity: 0;
}

.weather-popup__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.weather-popup__head:active {
  cursor: grabbing;
}

.weather-popup__head-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: default;
}

.weather-popup__name {
  margin: 0;
  font-family: var(--font-pixel-kr);
  font-size: 18px;
  color: var(--ink);
}

.weather-popup__fav-btn,
.weather-popup__close-btn {
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.weather-popup__close-btn {
  font-size: 18px;
  color: var(--moss);
}

.weather-popup__temp {
  margin: 4px 0 10px;
  font-family: var(--font-pixel);
  font-size: 32px;
  color: var(--ink);
  line-height: 1;
}

.weather-popup__temp span {
  font-size: 16px;
  vertical-align: top;
  color: var(--moss);
}

/* 모바일: 팝업을 화면 중앙에 고정 */
@media (max-width: 640px) {
  .weather-popup {
    left: 50% !important;
    top: 50% !important;
    bottom: auto !important;
    transform: translate(-50%, -50%) scale(var(--fit-scale, 1));
    transform-origin: center;
    width: min(300px, calc(100vw - 32px));
  }

  .popup-enter-from .weather-popup__inner,
  .popup-leave-to .weather-popup__inner {
    transform: scale(0.9);
  }
}
</style>
