<script setup>
import { computed } from 'vue'
import { useConfigStore } from '../../../stores/configStore'
import DotMatrixIcon from './DotMatrixIcon.vue'
import DotStatBar from './DotStatBar.vue'
import WindDirectionIcon from './WindDirectionIcon.vue'

const props = defineProps({
  city: {
    type: Object,
    required: true, // fetchCurrentWeather()/getDummyWeather() 반환 형태
  },
  // 지도 팝업처럼 공간이 좁은 곳에서 쓸 때 true로 넘기면 아이콘·여백이 줄어든다.
  // 상세 페이지(WeatherDetailView)는 기본값(false)으로 기존 크기를 그대로 쓴다.
  compact: {
    type: Boolean,
    default: false,
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

// 오늘 기온 범위(최저~최고) 안에서 현재 기온이 몇 % 지점인지 — DotStatBar를 그대로
// 재사용해 막대로 보여준다. 최저·최고가 같으면(드묾) 가운데(50%)로 둔다.
const tempRangePercent = computed(() => {
  const { temp, tempMin, tempMax } = props.city
  if (tempMax === tempMin) return 50
  return Math.round(((temp - tempMin) / (tempMax - tempMin)) * 100)
})

// 풍향(windDeg, 0~360°)을 8방위 한글 라벨로 변환한다 — 지금까지 받아오기만 하고 화면
// 어디에도 안 쓰이던 필드를 처음 활용하는 지점.
const COMPASS_LABELS = ['북', '북동', '동', '남동', '남', '남서', '서', '북서']
const windCompassLabel = computed(() => {
  const index = Math.round((props.city.windDeg % 360) / 45) % 8
  return COMPASS_LABELS[index]
})

// 일교차(최고-최저, 항상 섭씨 원본 기준 — 단위를 화씨로 바꿔도 "크다/작다" 판정 기준은
// 그대로 10℃로 고정해야 의미가 일관된다)가 10℃ 이상이면 겉옷을 챙기라는 배지를 보여준다.
const DIURNAL_RANGE_THRESHOLD = 10
const hasWideDiurnalRange = computed(
  () => props.city.tempMax - props.city.tempMin >= DIURNAL_RANGE_THRESHOLD,
)

// 체감온도와 실제 기온의 차이가 3℃ 이상 벌어지면 규칙 기반으로 안내 문구를 만든다.
const FEELS_LIKE_DIFF_THRESHOLD = 3
const feelsLikeNote = computed(() => {
  const diff = props.city.feelsLike - props.city.temp
  if (diff >= FEELS_LIKE_DIFF_THRESHOLD) return '체감상 실제보다 더 덥게 느껴져요'
  if (diff <= -FEELS_LIKE_DIFF_THRESHOLD) return '체감상 실제보다 더 춥게 느껴져요'
  return null
})

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
  <div class="weather-stats-panel" :class="{ 'weather-stats-panel--compact': compact }">
    <div class="weather-stats-panel__screen">
      <DotMatrixIcon :condition="city.condition" :size="compact ? 'md' : 'lg'" :animated="true" />
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
      <DotStatBar
        label="기온 범위"
        :value="tempRangePercent"
        :display-value="`최저 ${displayTempMin}° ~ 최고 ${displayTempMax}°`"
      />
    </div>

    <p class="weather-stats-panel__extra">
      체감 {{ displayFeelsLike }}{{ configStore.unitSymbol }} · 최저 {{ displayTempMin }}{{ configStore.unitSymbol }} · 최고
      {{ displayTempMax }}{{ configStore.unitSymbol }}
    </p>
    <p class="weather-stats-panel__wind">
      <WindDirectionIcon :degrees="city.windDeg" :size="10" />
      풍속 {{ city.windSpeed }}m/s · {{ windCompassLabel }}풍
    </p>

    <p v-if="hasWideDiurnalRange || feelsLikeNote" class="weather-stats-panel__insight">
      <span v-if="hasWideDiurnalRange" class="weather-stats-panel__badge">일교차 큼 · 겉옷 챙기세요</span>
      <span v-if="feelsLikeNote">{{ feelsLikeNote }}</span>
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

.weather-stats-panel--compact .weather-stats-panel__status {
  margin-bottom: 12px;
}

.weather-stats-panel--compact .weather-stats-panel__stats {
  gap: 8px;
}

.weather-stats-panel--compact .weather-stats-panel__extra {
  margin-top: 10px;
}

.weather-stats-panel__extra {
  margin: 16px 0 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--moss);
}

.weather-stats-panel__wind {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin: 6px 0 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--moss);
}

.weather-stats-panel__insight {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 8px 0 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--moss);
}

.weather-stats-panel__badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(184, 68, 47, 0.15);
  color: var(--danger, #b8442f);
  font-size: 11px;
  white-space: nowrap;
}
</style>
