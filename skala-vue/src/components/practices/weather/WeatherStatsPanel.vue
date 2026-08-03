<script setup>
import { computed } from 'vue'
import { useConfigStore } from '../../../stores/configStore'
import DotMatrixIcon from './DotMatrixIcon.vue'
import DotStatBar from './DotStatBar.vue'

const props = defineProps({
  city: {
    type: Object,
    required: true, // fetchCurrentWeather()/getDummyWeather() 반환 형태
  },
})

const configStore = useConfigStore()

// 체감/최저/최고 온도도 현재 선택된 단위(℃/℉)에 맞춰 함께 변환한다.
function convertTemp(celsius) {
  return configStore.unit === 'imperial' ? Math.round((celsius * 9) / 5 + 32) : celsius
}
const displayFeelsLike = computed(() => convertTemp(props.city.feelsLike))
const displayTempMin = computed(() => convertTemp(props.city.tempMin))
const displayTempMax = computed(() => convertTemp(props.city.tempMax))

const visibilityKm = computed(() => (props.city.visibility / 1000).toFixed(1))

// 일출~일몰 사이 현재 시각의 진행률(%). 밤이면 0 또는 100으로 고정.
const dayProgress = computed(() => {
  const city = props.city
  if (!city?.sunrise || !city?.sunset) return 0
  const now = Date.now() / 1000
  if (now <= city.sunrise) return 0
  if (now >= city.sunset) return 100
  return Math.round(((now - city.sunrise) / (city.sunset - city.sunrise)) * 100)
})

function formatTime(unixSeconds) {
  if (!unixSeconds) return '-'
  return new Date(unixSeconds * 1000).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="weather-stats-panel">
    <div class="weather-stats-panel__screen">
      <DotMatrixIcon :condition="city.condition" size="lg" :animated="true" />
    </div>
    <p class="weather-stats-panel__status">{{ city.status }}</p>

    <div class="weather-stats-panel__stats">
      <DotStatBar label="습도" :value="city.humidity" :display-value="`${city.humidity}%`" />
      <DotStatBar
        label="구름량"
        :value="city.cloudiness"
        :display-value="`${city.cloudiness}%`"
      />
      <DotStatBar
        label="가시거리"
        :value="(city.visibility / 10000) * 100"
        :display-value="`${visibilityKm}km`"
      />
      <DotStatBar
        label="기압"
        :value="((city.pressure - 950) / 100) * 100"
        :display-value="`${city.pressure}hPa`"
      />
      <DotStatBar
        label="낮 진행률"
        :value="dayProgress"
        :display-value="`${formatTime(city.sunrise)} ~ ${formatTime(city.sunset)}`"
      />
    </div>

    <p class="weather-stats-panel__extra">
      체감 {{ displayFeelsLike }}° · 최저 {{ displayTempMin }}° · 최고
      {{ displayTempMax }}° · 풍속 {{ city.windSpeed }}m/s
    </p>
  </div>
</template>

<style scoped>
.weather-stats-panel__screen {
  display: flex;
  justify-content: center;
  margin: 0 auto 8px;
}

.weather-stats-panel__status {
  text-align: center;
  margin: 0 0 20px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--moss);
}

.weather-stats-panel__stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.weather-stats-panel__extra {
  margin: 16px 0 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--moss);
}
</style>
