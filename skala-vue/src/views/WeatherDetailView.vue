<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElSkeleton } from 'element-plus'
import { useConfigStore } from '../stores/configStore'
import { findCityById, fetchCurrentWeather } from '../services/weatherApi'
import WeatherStatsPanel from '../components/practices/weather/WeatherStatsPanel.vue'
import UnitToggler from '../components/UnitToggler.vue'

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
  const { unit } = configStore
  return unit === 'imperial' ? Math.round((weather.value.temp * 9) / 5 + 32) : weather.value.temp
})
</script>

<template>
  <div class="weather-detail">
    <button class="weather-detail__back" @click="router.push({ name: 'weather-home' })">
      ← BACK
    </button>

    <ElSkeleton v-if="isLoading" :rows="4" animated />
    <p v-else-if="loadError" class="status-message status-message--error">{{ loadError }}</p>

    <div v-else class="weather-detail__card">
      <div class="weather-detail__head">
        <p class="weather-detail__name">{{ weather.name }}</p>
        <UnitToggler />
      </div>
      <p class="weather-detail__temp">{{ displayTemp }}<span>{{ configStore.unitSymbol }}</span></p>

      <WeatherStatsPanel :city="weather" />
    </div>
  </div>
</template>

<style scoped>
.weather-detail {
  max-width: 420px;
  margin: 0 auto;
  padding: 28px;
  font-family: var(--font-mono);
}

.weather-detail__back {
  border: none;
  background: none;
  color: var(--moss);
  font-family: var(--font-pixel);
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  margin-bottom: 20px;
  letter-spacing: 0.05em;
}

.weather-detail__card {
  background: var(--paper);
  border-radius: 20px;
  padding: 24px;
  text-align: center;
}

.weather-detail__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.weather-detail__name {
  margin: 0;
  /* 한글 도트 폰트는 큰 크기(제목)에만 사용해 가독성을 지킨다 */
  font-family: var(--font-pixel-kr);
  font-size: 20px;
  font-weight: 400;
  color: var(--ink);
  letter-spacing: 0.08em;
}

.weather-detail__temp {
  margin: 8px 0 20px;
  font-family: var(--font-pixel);
  font-size: 56px;
  line-height: 1;
  color: var(--ink);
}

.weather-detail__temp span {
  font-size: 22px;
  vertical-align: top;
}

.status-message {
  text-align: center;
  font-size: 13px;
  margin-top: 24px;
}

.status-message--error {
  color: var(--amber);
}
</style>
