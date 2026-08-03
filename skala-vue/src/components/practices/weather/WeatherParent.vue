<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'

// 반응형 상태 3종 (day2 체크리스트 스펙)
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
])
const searchQuery = ref('')
const selectedCityInfo = ref(null)

// 검색어가 비면 원본 전체, 일치하면 필터링된 결과가 자연히 반환됨
const filteredWeatherList = computed(() =>
  weatherList.value.filter((city) => city.name.includes(searchQuery.value)),
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
  window.alert(`${city.name}: ${city.status}, ${city.temp}도`)
}
</script>

<template>
  <div class="weather-parent">
    <h2 class="weather-parent__title">날씨 (컴포지션 + 컴포넌트 분리) — Day 2</h2>

    <BaseDashboardCard>
      <template #search>
        <SearchBar :query="searchQuery" @update-query="handleUpdateQuery" />
      </template>
      <template #list>
        <p v-if="selectedCityInfo" class="weather-parent__selected">
          선택된 도시: {{ selectedCityInfo.name }}
        </p>
        <ul v-if="filteredWeatherList.length > 0" class="city-list">
          <WeatherCard
            v-for="city in filteredWeatherList"
            :key="city.id"
            :city="city"
            @select-card="handleSelectCard"
            @click-detail="handleClickDetail"
          />
        </ul>
        <p v-else class="empty-state">검색 결과가 없습니다.</p>
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

.empty-state {
  text-align: center;
  color: #9ba1a8;
  font-size: 13px;
  margin-top: 24px;
}
</style>
