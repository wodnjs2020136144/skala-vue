<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseDashboardCard from '../components/practices/weather/BaseDashboardCard.vue'
import SearchBar from '../components/practices/weather/SearchBar.vue'
import WeatherCard from '../components/practices/weather/WeatherCard.vue'
import { useConfigStore } from '../stores/configStore'
import { useSearchStore } from '../stores/searchStore'
import { useFavoritesStore } from '../stores/favoritesStore'
import { useDemoStore } from '../stores/demoStore'
import { CITY_LIST, fetchCurrentWeather, getDummyWeather } from '../services/weatherApi'

const router = useRouter()
const configStore = useConfigStore()
const searchStore = useSearchStore()
const favoritesStore = useFavoritesStore()
const demoStore = useDemoStore()

// 반응형 상태 (day2에서 이어짐) — weatherList는 이제 Axios로 받아온 실데이터로 채워진다.
// 검색어는 상단 네비게이션의 전역 검색창(searchStore)을 그대로 읽는다.
const weatherList = ref([])
const selectedCityInfo = ref(null)
// 정렬 기준: 강사 힌트("정렬 기준이 바뀔 때만 재계산되는 computed", "v-model로 선택 UI") 반영.
const sortBy = ref('name') // 'name' | 'temp'

const isLoading = ref(true)
const loadError = ref('')

async function loadWeatherList() {
  isLoading.value = true
  loadError.value = ''
  try {
    weatherList.value = demoStore.useDummyData
      ? CITY_LIST.map((city, index) => getDummyWeather(city, index))
      : await Promise.all(CITY_LIST.map((city) => fetchCurrentWeather(city)))
  } catch (err) {
    loadError.value = '날씨 정보를 불러오지 못했습니다. API Key와 네트워크 상태를 확인해 주세요.'
    console.error('[WeatherHomeView] 날씨 조회 실패:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadWeatherList)
watch(() => demoStore.useDummyData, loadWeatherList)

// 검색어가 비면 원본 전체, 일치하면 필터링된 결과가 자연히 반환됨. 공백만 입력했을 때도
// 빈 검색어와 같이 취급하도록 trim한다.
const filteredWeatherList = computed(() =>
  weatherList.value.filter((city) => city.name.includes(searchStore.query.trim())),
)

// 섭씨 원본 → 현재 선택된 단위(℃/℉)로 변환. 도시 카드뿐 아니라 아래 요약줄(평균/최고/최저)도
// 이 함수를 공유해, ℉로 전환했을 때 카드 숫자와 요약줄 숫자가 서로 어긋나지 않게 한다.
function convertTemp(celsius) {
  return configStore.unit === 'imperial' ? Math.round((celsius * 9) / 5 + 32) : celsius
}

// 화면 표시용 온도만 단위에 맞춰 변환하고, 더움/선선함 판정은 항상 섭씨 원본(city.temp) 기준으로 유지한다.
const displayWeatherList = computed(() =>
  filteredWeatherList.value.map((city) => ({
    ...city,
    displayTemp: convertTemp(city.temp),
    unitSymbol: configStore.unitSymbol,
  })),
)

// 권역순 정렬에서 권역이 항상 같은 순서(수도권→강원→충청→호남→영남→제주, 대략 북→남)로
// 묶여 보이도록 고정 순서를 둔다 — localeCompare로는 이 순서가 보장되지 않는다.
const REGION_ORDER = ['수도권', '강원', '충청', '호남', '영남', '제주']

// 정렬 기준이 바뀔 때만 다시 정렬된다(displayWeatherList/sortBy 둘 다 안 바뀌면 재계산 없음).
const sortedWeatherList = computed(() => {
  const list = [...displayWeatherList.value]
  if (sortBy.value === 'temp') {
    return list.sort((a, b) => b.temp - a.temp)
  }
  if (sortBy.value === 'region') {
    return list.sort((a, b) => {
      const regionDiff = REGION_ORDER.indexOf(a.region) - REGION_ORDER.indexOf(b.region)
      return regionDiff !== 0 ? regionDiff : a.name.localeCompare(b.name, 'ko')
    })
  }
  return list.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
})

// 즐겨찾기 개수·검색 결과 개수·평균 기온·최고/최저 기온 도시 — 전부 목록이 바뀔 때만 재계산되는 computed.
const favoriteCount = computed(
  () => weatherList.value.filter((city) => favoritesStore.isFavorite(city.id)).length,
)
const filteredCount = computed(() => filteredWeatherList.value.length)
const averageTemp = computed(() => {
  if (weatherList.value.length === 0) return null
  const sum = weatherList.value.reduce((acc, city) => acc + city.temp, 0)
  return Math.round(sum / weatherList.value.length)
})
const hottestCity = computed(() =>
  weatherList.value.length === 0
    ? null
    : weatherList.value.reduce((max, city) => (city.temp > max.temp ? city : max)),
)
const coldestCity = computed(() =>
  weatherList.value.length === 0
    ? null
    : weatherList.value.reduce((min, city) => (city.temp < min.temp ? city : min)),
)

watch(selectedCityInfo, (newVal) => {
  console.log('[watch] 선택된 도시:', newVal)
})

watch(sortBy, (newVal) => {
  console.log('[watch] 정렬 기준 변경:', newVal)
})

watchEffect(() => {
  console.log('[watchEffect] 검색어 변경:', searchStore.query)
})

function handleSelectCard(city) {
  selectedCityInfo.value = city
}
function handleClickDetail(city) {
  router.push({ name: 'weather-detail', params: { id: city.id } })
}
</script>

<template>
  <div class="weather-parent">
    <h2 class="weather-parent__title">오늘의 날씨</h2>

    <BaseDashboardCard>
      <template #search>
        <SearchBar :query="searchStore.query" @update-query="searchStore.setQuery" />
      </template>
      <template #list>
        <p v-if="isLoading" class="status-message">날씨 정보를 불러오는 중...</p>
        <p v-else-if="loadError" class="status-message status-message--error">{{ loadError }}</p>
        <template v-else>
          <p v-if="selectedCityInfo" class="weather-parent__selected">
            선택된 도시: {{ selectedCityInfo.name }}
          </p>

          <div class="weather-parent__toolbar">
            <label class="weather-parent__sort">
              정렬
              <select v-model="sortBy">
                <option value="name">이름순</option>
                <option value="temp">기온순</option>
                <option value="region">권역순</option>
              </select>
            </label>
          </div>

          <p v-if="averageTemp !== null" class="weather-parent__summary">
            즐겨찾기 {{ favoriteCount }}개 · 검색 결과 {{ filteredCount }}개 · 평균 {{ convertTemp(averageTemp) }}{{ configStore.unitSymbol }}
            · 최고 {{ hottestCity?.name }}({{ convertTemp(hottestCity?.temp) }}{{ configStore.unitSymbol }}) · 최저 {{ coldestCity?.name }}({{
              convertTemp(coldestCity?.temp)
            }}{{ configStore.unitSymbol }})
            <br /><span class="weather-parent__summary-note">(평균·최고·최저는 검색과 무관하게 전체 도시 기준)</span>
          </p>

          <ul v-if="sortedWeatherList.length > 0" class="city-list">
            <WeatherCard v-for="city in sortedWeatherList" :key="city.id" :city="city" @select-card="handleSelectCard"
              @click-detail="handleClickDetail" />
          </ul>
          <p v-else class="empty-state">검색 결과가 없습니다.</p>
        </template>
      </template>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.weather-parent__title {
  max-width: 420px;
  margin: 0 auto 12px;
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 600;
  color: var(--moss);
  letter-spacing: 0.2px;
}

.weather-parent__selected {
  margin: 0 0 12px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--moss);
  font-weight: 500;
}

.weather-parent__toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.weather-parent__sort {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--moss);
}

.weather-parent__sort select {
  font-family: var(--font-mono);
  font-size: 12px;
  border: 1px solid var(--moss);
  border-radius: 6px;
  padding: 2px 6px;
  background: var(--paper);
  color: var(--ink);
}

.weather-parent__summary {
  margin: 0 0 16px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--moss);
  line-height: 1.5;
}

.weather-parent__summary-note {
  opacity: 0.75;
}

/* 17개 시·도로 늘어난 뒤 1열 세로 목록은 스크롤이 너무 길어져, BaseDashboardCard의 고정
   폭(420px, 패딩 제외 364px) 안에서 자동으로 열 수를 맞추는 그리드로 바꿨다 — 이 폭에서는
   실질적으로 2열이 된다. WeatherCard.vue는 원래 가로 한 줄(아이콘+이름+온도+버튼) 레이아웃을
   그대로 쓰는데, minmax 하한(150px)에서도 줄바꿈 없이 들어가는 걸 확인해 카드 자체는
   건드리지 않았다. */
.city-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.empty-state,
.status-message {
  text-align: center;
  font-family: var(--font-mono);
  color: var(--moss);
  font-size: 13px;
  margin-top: 24px;
}

.status-message--error {
  color: var(--amber);
}
</style>
