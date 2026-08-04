<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useConfigStore } from '../stores/configStore'
import { useFavoritesStore } from '../stores/favoritesStore'
import { useSearchStore } from '../stores/searchStore'
import { useDemoStore } from '../stores/demoStore'
import { CITY_LIST, fetchCurrentWeather, getDummyWeather } from '../services/weatherApi'
import KoreaMapDots from '../components/practices/weather/KoreaMapDots.vue'
import FavoriteHeartDots from '../components/practices/weather/FavoriteHeartDots.vue'
import WeatherStatsPanel from '../components/practices/weather/WeatherStatsPanel.vue'
import DotMatrixIcon from '../components/practices/weather/DotMatrixIcon.vue'
import PixelTempIcon from '../components/practices/weather/PixelTempIcon.vue'
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

async function loadCities() {
  isLoading.value = true
  loadError.value = ''
  try {
    cityList.value = demoStore.useDummyData
      ? CITY_LIST.map((city, index) => getDummyWeather(city, index))
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

// 사이드 패널(즐겨찾기·순위)의 온도 표시도 ℃/℉ 전환을 반영한다.
function convertTemp(celsius) {
  return configStore.unit === 'imperial' ? Math.round((celsius * 9) / 5 + 32) : celsius
}

// 왼쪽 패널 — 즐겨찾기한 도시를 실시간 날씨(cityList)에서 찾아 보여준다.
const favoriteCitiesWithWeather = computed(() =>
  cityList.value.filter((city) => favoritesStore.isFavorite(city.id)),
)

// 오른쪽 패널 — 온도 기준 TOP3. WeatherHomeView의 hottestCity/coldestCity와 같은 계산을
// 3개까지 확장한 것이다.
const hottestThree = computed(() => [...cityList.value].sort((a, b) => b.temp - a.temp).slice(0, 3))
const coldestThree = computed(() => [...cityList.value].sort((a, b) => a.temp - b.temp).slice(0, 3))

const POPUP_MARGIN = 12
// 실측 크기가 화면보다 커서 팝업을 통째로 축소해야 할 때, 글씨를 읽을 수 있는 최소 배율.
const MIN_FIT_SCALE = 0.7

const popupRef = ref(null)
const popupPosition = ref({ left: '0px', top: '0px' })
// 창 리사이즈 중에도 같은 지점을 중심으로 다시 계산하기 위해 마지막으로 연 좌표를 기억해둔다.
let lastPopupCenter = null

// 팝업이 실제로 렌더링된 뒤 그 크기를 직접 측정해 위치를 계산한다 — 어림값을 콘텐츠가
// 바뀔 때마다 다시 맞춰야 했던 문제를 없앤다. 클릭 지점(또는 화면 중앙)을 팝업의 중심으로
// 두되, 실측 크기가 화면보다 크면 팝업 전체를 축소(fit-scale)해서 스크롤 없이 다 보이게
// 한다. offsetHeight/Width는 transform의 영향을 받지 않으므로 트랜지션·스케일과 무관하게
// 정확하다.
async function positionPopupAt(centerX, centerY) {
  lastPopupCenter = { x: centerX, y: centerY }
  await nextTick()
  const el = popupRef.value
  if (!el) return
  const rawH = el.offsetHeight
  const rawW = el.offsetWidth
  const availH = window.innerHeight - POPUP_MARGIN * 2
  const availW = window.innerWidth - POPUP_MARGIN * 2

  const fitScale = Math.max(MIN_FIT_SCALE, Math.min(1, availH / rawH, availW / rawW))
  const h = rawH * fitScale
  const w = rawW * fitScale

  const left = Math.max(POPUP_MARGIN, Math.min(centerX - w / 2, window.innerWidth - w - POPUP_MARGIN))
  const top = Math.max(POPUP_MARGIN, Math.min(centerY - h / 2, window.innerHeight - h - POPUP_MARGIN))
  popupPosition.value = { left: `${left}px`, top: `${top}px`, '--fit-scale': fitScale }
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

// 팝업이 열린 채로 창 크기가 바뀌면 같은 중심 좌표로 위치·fit-scale을 다시 계산한다.
function handleWindowResize() {
  if (!lastPopupCenter) return
  positionPopupAt(lastPopupCenter.x, lastPopupCenter.y)
}

</script>

<template>
  <div class="weather-map">
    <p v-if="isLoading" class="status-message">날씨 정보를 불러오는 중...</p>
    <p v-else-if="loadError" class="status-message status-message--error">{{ loadError }}</p>

    <template v-else>
      <div class="weather-map__body">
        <aside class="weather-map__side weather-map__side--left">
          <h2 class="weather-map__side-title">
            <FavoriteHeartDots :active="true" :size="14" /> 즐겨찾기
          </h2>
          <button
            v-for="city in favoriteCitiesWithWeather"
            :key="city.id"
            class="weather-map__side-item"
            @click="selectCityById(city)"
          >
            <DotMatrixIcon :condition="city.condition" size="sm" :animated="false" />
            <span class="weather-map__side-name">{{ city.name }}</span>
            <span class="weather-map__side-temp">{{ convertTemp(city.temp) }}°</span>
          </button>
          <p v-if="favoriteCitiesWithWeather.length === 0" class="weather-map__side-empty">
            즐겨찾기한 도시가 없어요
          </p>
        </aside>

        <div class="weather-map__grid-area">
          <KoreaMapDots :cities="cityList" :selected-id="selectedId" @select-city="selectCity" />
        </div>

        <aside class="weather-map__side weather-map__side--right">
          <h2 class="weather-map__side-title">오늘의 순위</h2>
          <p class="weather-map__side-subtitle">
            <PixelTempIcon variant="hot" :size="14" /> 가장 더운 지역
          </p>
          <button
            v-for="(city, index) in hottestThree"
            :key="city.id"
            class="weather-map__side-item"
            @click="selectCityById(city)"
          >
            <span class="weather-map__side-rank">{{ index + 1 }}</span>
            <span class="weather-map__side-name">{{ city.name }}</span>
            <span class="weather-map__side-temp">{{ convertTemp(city.temp) }}°</span>
          </button>
          <p class="weather-map__side-subtitle">
            <PixelTempIcon variant="cold" :size="14" /> 가장 추운 지역
          </p>
          <button
            v-for="(city, index) in coldestThree"
            :key="city.id"
            class="weather-map__side-item"
            @click="selectCityById(city)"
          >
            <span class="weather-map__side-rank">{{ index + 1 }}</span>
            <span class="weather-map__side-name">{{ city.name }}</span>
            <span class="weather-map__side-temp">{{ convertTemp(city.temp) }}°</span>
          </button>
        </aside>
      </div>

      <Transition name="popup">
        <div v-if="selectedCity" class="popup-backdrop" @click="closePopup">
          <div ref="popupRef" class="weather-popup" :style="popupPosition" @click.stop>
            <div class="weather-popup__inner">
              <div class="weather-popup__head">
                <p class="weather-popup__name">{{ selectedCity.name }}</p>
                <div class="weather-popup__head-actions">
                  <UnitToggler />
                  <button
                    class="weather-popup__fav-btn"
                    @click="favoritesStore.toggleFavorite(selectedCity.id)"
                  >
                    <FavoriteHeartDots :active="favoritesStore.isFavorite(selectedCity.id)" :size="20" />
                  </button>
                  <button class="weather-popup__close-btn" @click="closePopup">✕</button>
                </div>
              </div>

              <p class="weather-popup__temp">
                {{ displayTemp }}<span>°{{ configStore.unitSymbol }}</span>
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
  min-height: calc(100vh - 57px);
  margin: 0;
  padding: 0;
  background-color: var(--sea);
  animation: sea-shimmer 6s ease-in-out infinite;
  will-change: filter;
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

/* 좌우 사이드 패널 — 즐겨찾기 / 온도 TOP3 순위. 지도 폭을 줄이는 고정 컬럼이 아니라,
   바다 배경 위에 뜨는 게임 배너/이벤트창처럼 지도 위를 덮어 띄운다. 팝업(z-index:50)
   보다는 낮게 둬서 팝업이 항상 그 위에 보인다. */
.weather-map__side {
  position: absolute;
  top: 16px;
  bottom: 16px;
  width: 220px;
  z-index: 10;
  padding: 16px 12px;
  background: var(--paper);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.weather-map__side--left {
  left: 16px;
}

.weather-map__side--right {
  right: 16px;
}

.weather-map__side-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 8px;
  font-family: var(--font-pixel-kr);
  font-size: 14px;
  color: var(--ink);
  letter-spacing: 0.05em;
}

.weather-map__side-subtitle {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 12px 0 4px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--moss);
}

.weather-map__side-item {
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  padding: 6px 8px;
  cursor: pointer;
  text-align: left;
}

.weather-map__side-item:hover {
  background: rgba(0, 0, 0, 0.08);
}

.weather-map__side-rank {
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

.weather-map__side-name {
  flex: 1;
  font-family: var(--font-pixel-kr);
  font-size: 12px;
  color: var(--ink);
}

.weather-map__side-temp {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--amber);
}

.weather-map__side-empty {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--moss);
}

/* 좁은 화면에서는 지도가 눌리지 않도록 사이드 패널을 숨긴다 */
@media (max-width: 1000px) {
  .weather-map__side {
    display: none;
  }
}

@keyframes sea-shimmer {
  0%, 100% {
    filter: brightness(1) saturate(1);
  }
  50% {
    filter: brightness(1.05) saturate(1.08);
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
}

.weather-popup__head-actions {
  display: flex;
  align-items: center;
  gap: 12px;
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
