<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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
const popupAnchor = ref(null)

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

const POPUP_WIDTH = 320
const POPUP_HEIGHT_ESTIMATE = 480
const POPUP_MARGIN = 12

// 클릭 지점(또는 화면 중앙)을 팝업의 세로 중심으로 두고, 화면 안에 완전히 들어오도록
// top/left를 모두 clamp한다. 도시 도트 대부분이 한반도 지형상 화면 중하단에 몰려 있어
// "아래로 열고 공간 없으면 위로 뒤집는" 방식은 거의 항상 아래쪽에 붙어 보이는 문제가
// 있었다 — 중심 기준으로 잡으면 클릭 위치와 무관하게 항상 화면 안에 고르게 들어온다.
// 모바일 폭에서는 CSS가 중앙 고정으로 덮어쓴다.
const popupStyle = computed(() => {
  if (!popupAnchor.value) return {}
  const { left, centerY } = popupAnchor.value
  const maxLeft = window.innerWidth - POPUP_WIDTH - POPUP_MARGIN
  const clampedLeft = Math.max(POPUP_MARGIN, Math.min(left, maxLeft))

  const rawTop = centerY - POPUP_HEIGHT_ESTIMATE / 2
  const maxTop = window.innerHeight - POPUP_HEIGHT_ESTIMATE - POPUP_MARGIN
  const clampedTop = Math.max(POPUP_MARGIN, Math.min(rawTop, maxTop))

  return { left: `${clampedLeft}px`, top: `${clampedTop}px` }
})

function selectCity({ city, rect }) {
  selectedId.value = city.id
  popupAnchor.value = { left: rect.left, centerY: (rect.top + rect.bottom) / 2 }
}

function selectCityById(city) {
  selectedId.value = city.id
  popupAnchor.value = {
    left: window.innerWidth / 2 - POPUP_WIDTH / 2,
    centerY: window.innerHeight / 2,
  }
}

function closePopup() {
  selectedId.value = null
  popupAnchor.value = null
}

</script>

<template>
  <div class="weather-map">
    <p v-if="isLoading" class="status-message">날씨 정보를 불러오는 중...</p>
    <p v-else-if="loadError" class="status-message status-message--error">{{ loadError }}</p>

    <template v-else>
      <div class="weather-map__body">
        <aside class="weather-map__side">
          <h2 class="weather-map__side-title">⭐ 즐겨찾기</h2>
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

        <aside class="weather-map__side">
          <h2 class="weather-map__side-title">오늘의 순위</h2>
          <p class="weather-map__side-subtitle">🔥 가장 더운 지역</p>
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
          <p class="weather-map__side-subtitle">🧊 가장 추운 지역</p>
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
          <div class="weather-popup" :style="popupStyle" @click.stop>
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
  display: flex;
  flex: 1;
  min-height: 0;
}

.weather-map__grid-area {
  position: relative;
  flex: 1;
  min-height: 0;
}

/* 좌우 사이드 패널 — 즐겨찾기 / 온도 TOP3 순위 */
.weather-map__side {
  flex: 0 0 220px;
  width: 220px;
  padding: 16px 12px;
  background: var(--ink);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.weather-map__side-title {
  margin: 0 0 8px;
  font-family: var(--font-pixel-kr);
  font-size: 14px;
  color: var(--amber);
  letter-spacing: 0.05em;
}

.weather-map__side-subtitle {
  margin: 12px 0 4px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--paper);
  opacity: 0.7;
}

.weather-map__side-item {
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 6px 8px;
  cursor: pointer;
  text-align: left;
}

.weather-map__side-item:hover {
  background: rgba(255, 255, 255, 0.1);
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
  color: var(--paper);
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
  color: var(--paper);
  opacity: 0.6;
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

.weather-popup {
  position: fixed;
  width: 320px;
  max-height: min(520px, calc(100vh - 24px));
  overflow-y: auto;
  background: var(--paper);
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.popup-enter-active .weather-popup,
.popup-leave-active .weather-popup {
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;
}

.popup-enter-from .weather-popup,
.popup-leave-to .weather-popup {
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
    transform: translate(-50%, -50%);
    width: min(300px, calc(100vw - 32px));
  }

  .popup-enter-from .weather-popup,
  .popup-leave-to .weather-popup {
    transform: translate(-50%, -50%) scale(0.9);
  }
}
</style>
