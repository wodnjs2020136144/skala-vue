<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseDashboardCard from '../components/practices/weather/BaseDashboardCard.vue'
import SearchBar from '../components/practices/weather/SearchBar.vue'
import WeatherCard from '../components/practices/weather/WeatherCard.vue'
import { useConfigStore } from '../stores/configStore'
import { CITY_LIST, fetchCurrentWeather } from '../services/weatherApi'

const router = useRouter()
const configStore = useConfigStore()

// 반응형 상태 3종 (day2에서 이어짐) — weatherList는 이제 Axios로 받아온 실데이터로 채워진다.
const weatherList = ref([])
const searchQuery = ref('')
const selectedCityInfo = ref(null)

const isLoading = ref(true)
const loadError = ref('')

async function loadWeatherList() {
  isLoading.value = true
  loadError.value = ''
  try {
    weatherList.value = await Promise.all(CITY_LIST.map((city) => fetchCurrentWeather(city)))
  } catch (err) {
    loadError.value = '날씨 정보를 불러오지 못했습니다. API Key와 네트워크 상태를 확인해 주세요.'
    console.error('[WeatherHomeView] 날씨 조회 실패:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadWeatherList)

// 검색어가 비면 원본 전체, 일치하면 필터링된 결과가 자연히 반환됨
const filteredWeatherList = computed(() =>
  weatherList.value.filter((city) => city.name.includes(searchQuery.value)),
)

// 화면 표시용 온도만 단위에 맞춰 변환하고, 더움/선선함 판정은 항상 섭씨 원본(city.temp) 기준으로 유지한다.
const displayWeatherList = computed(() =>
  filteredWeatherList.value.map((city) => ({
    ...city,
    displayTemp: configStore.unit === 'imperial' ? Math.round((city.temp * 9) / 5 + 32) : city.temp,
    unitSymbol: configStore.unitSymbol,
  })),
)

watch(selectedCityInfo, (newVal) => {
  console.log('[watch] 선택된 도시:', newVal)
})

watchEffect(() => {
  console.log('[watchEffect] 검색어 변경:', searchQuery.value)
})

function handleUpdateQuery(value) {
  searchQuery.value = value
}
function handleSelectCard(city) {
  selectedCityInfo.value = city
}
function handleClickDetail(city) {
  router.push({ name: 'weather-detail', params: { id: city.id } })
}
</script>

<template>
  <div class="weather-parent">
    <h2 class="weather-parent__title">날씨 대시보드 — Day 3 (Router · Pinia · Axios)</h2>

    <BaseDashboardCard>
      <template #search>
        <SearchBar :query="searchQuery" @update-query="handleUpdateQuery" />
      </template>
      <template #list>
        <p v-if="isLoading" class="status-message">날씨 정보를 불러오는 중...</p>
        <p v-else-if="loadError" class="status-message status-message--error">{{ loadError }}</p>
        <template v-else>
          <p v-if="selectedCityInfo" class="weather-parent__selected">
            선택된 도시: {{ selectedCityInfo.name }}
          </p>
          <ul v-if="displayWeatherList.length > 0" class="city-list">
            <WeatherCard
              v-for="city in displayWeatherList"
              :key="city.id"
              :city="city"
              @select-card="handleSelectCard"
              @click-detail="handleClickDetail"
            />
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
  font-size: 15px;
  font-weight: 600;
  color: #8a8f98;
  letter-spacing: 0.2px;
}

.weather-parent__selected {
  margin: 0 0 12px;
  font-size: 13px;
  color: #6e97a6;
  font-weight: 500;
}

.city-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state,
.status-message {
  text-align: center;
  color: #9ba1a8;
  font-size: 13px;
  margin-top: 24px;
}

.status-message--error {
  color: #c97b4a;
}
</style>
