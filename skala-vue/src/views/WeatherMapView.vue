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

const POPUP_WIDTH = 380
const POPUP_HEIGHT_ESTIMATE = 800
const POPUP_MARGIN = 12

// 클릭 위치 근처, 화면 밖으로 넘치지 않게 top/left를 모두 clamp한 팝업 좌표.
// 모바일 폭에서는 CSS가 중앙 고정으로 덮어쓴다.
const popupStyle = computed(() => {
  if (!popupAnchor.value) return {}
  const { left, top, bottom } = popupAnchor.value
  const maxLeft = window.innerWidth - POPUP_WIDTH - POPUP_MARGIN
  const clampedLeft = Math.max(POPUP_MARGIN, Math.min(left, maxLeft))

  const spaceBelow = window.innerHeight - bottom
  const opensUpward = spaceBelow < POPUP_HEIGHT_ESTIMATE + POPUP_MARGIN && top > POPUP_HEIGHT_ESTIMATE
  const rawTop = opensUpward ? top - POPUP_HEIGHT_ESTIMATE - 8 : bottom + 8
  const maxTop = window.innerHeight - POPUP_HEIGHT_ESTIMATE - POPUP_MARGIN
  const clampedTop = Math.max(POPUP_MARGIN, Math.min(rawTop, maxTop))

  return { left: `${clampedLeft}px`, top: `${clampedTop}px` }
})

function selectCity({ city, rect }) {
  selectedId.value = city.id
  popupAnchor.value = { left: rect.left, top: rect.top, bottom: rect.bottom }
}

function selectCityById(city) {
  selectedId.value = city.id
  const centerTop = window.innerHeight / 2 - POPUP_HEIGHT_ESTIMATE / 2
  popupAnchor.value = {
    left: window.innerWidth / 2 - POPUP_WIDTH / 2,
    top: centerTop,
    bottom: centerTop,
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
      <div class="weather-map__grid-area">
        <KoreaMapDots :cities="cityList" :selected-id="selectedId" @select-city="selectCity" />
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

            <WeatherStatsPanel :city="selectedCity" />
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

.weather-map__grid-area {
  position: relative;
  flex: 1;
  min-height: 0;
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
  width: 380px;
  max-height: min(780px, calc(100vh - 24px));
  overflow-y: auto;
  background: var(--paper);
  border-radius: 16px;
  padding: 24px;
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
  margin: 4px 0 12px;
  font-family: var(--font-pixel);
  font-size: 40px;
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
    width: min(340px, calc(100vw - 32px));
  }

  .popup-enter-from .weather-popup,
  .popup-leave-to .weather-popup {
    transform: translate(-50%, -50%) scale(0.9);
  }
}
</style>
