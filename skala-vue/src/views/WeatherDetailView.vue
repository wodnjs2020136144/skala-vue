<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore } from '../stores/configStore'
import { findCityById, fetchCurrentWeather } from '../services/weatherApi'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const configStore = useConfigStore()

const weather = ref(null)
const isLoading = ref(true)
const loadError = ref('')

async function loadDetail() {
  const city = findCityById(props.id)
  if (!city) {
    loadError.value = '존재하지 않는 도시입니다.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  loadError.value = ''
  try {
    weather.value = await fetchCurrentWeather(city)
  } catch (err) {
    loadError.value = '날씨 정보를 불러오지 못했습니다. API Key와 네트워크 상태를 확인해 주세요.'
    console.error('[WeatherDetailView] 날씨 조회 실패:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadDetail)
// 목록 → 다른 도시 상세로 바로 이동할 때(같은 컴포넌트 재사용)도 다시 불러오도록 id 변경을 감시
watch(() => props.id, loadDetail)

// 요구사항 스펙: Math.round((rawTemp * 9) / 5 + 32)
const displayTemp = computed(() => {
  if (!weather.value) return null
  return configStore.unit === 'imperial'
    ? Math.round((weather.value.temp * 9) / 5 + 32)
    : weather.value.temp
})
</script>

<template>
  <div class="weather-detail">
    <button class="weather-detail__back" @click="router.push({ name: 'weather-home' })">
      ← 목록으로
    </button>

    <p v-if="isLoading" class="status-message">날씨 정보를 불러오는 중...</p>
    <p v-else-if="loadError" class="status-message status-message--error">{{ loadError }}</p>
    <div v-else class="weather-detail__card">
      <h2 class="weather-detail__name">{{ weather.name }}</h2>
      <p class="weather-detail__temp">{{ displayTemp }}{{ configStore.unitSymbol }}</p>
      <p class="weather-detail__status">{{ weather.status }}</p>
    </div>
  </div>
</template>

<style scoped>
.weather-detail {
  max-width: 420px;
  margin: 0 auto;
  padding: 28px;
}

.weather-detail__back {
  border: none;
  background: none;
  color: #6e97a6;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  margin-bottom: 16px;
}

.weather-detail__card {
  background: #ffffff;
  border-radius: 16px;
  padding: 28px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(20, 20, 30, 0.05);
}

.weather-detail__name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2e3238;
}

.weather-detail__temp {
  margin: 12px 0 0;
  font-size: 40px;
  font-weight: 700;
  color: #2e3238;
}

.weather-detail__status {
  margin: 4px 0 0;
  font-size: 14px;
  color: #9ba1a8;
}

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
