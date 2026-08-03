<script setup>
import { ref } from 'vue'
import axios from 'axios'

const weatherData = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const URL = `https://api.openweathermap.org/data/2.5/weather?q=Gwangju,KR&appid=${API_KEY}&units=metric&lang=kr`

async function handleFetchWeather() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await axios.get(URL)
    weatherData.value = response.data
  } catch (error) {
    console.error('통신 중 에러가 발생했습니다:', error)
    errorMessage.value = '데이터를 가져오지 못했습니다. API 키 활성화 여부나 주소를 확인하세요.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="practice-section">
    <h2>Axios 수동 조회 학습 (p.203)</h2>
    <button @click="handleFetchWeather" :disabled="isLoading">
      {{ isLoading ? '데이터 로딩 중...' : '광주 날씨 당겨오기' }}
    </button>
    <p v-if="errorMessage" style="color: #c97b4a">{{ errorMessage }}</p>
    <div v-if="weatherData">
      <p>
        📍 위치: <strong>{{ weatherData.name }}</strong>
      </p>
      <p>
        🌡️ 현재 기온: <strong>{{ weatherData.main.temp }}°C</strong>
      </p>
      <p>
        ☁️ 날씨 상태: <strong>{{ weatherData.weather[0].description }}</strong>
      </p>
      <p>
        💧 습도: <strong>{{ weatherData.main.humidity }}%</strong>
      </p>
    </div>
  </div>
</template>
