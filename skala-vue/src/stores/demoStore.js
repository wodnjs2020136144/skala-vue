import { ref } from 'vue'
import { defineStore } from 'pinia'

// 켜면 실제 OpenWeatherMap API 대신 더미 날씨 데이터(6가지 조건)를 사용한다.
export const useDemoStore = defineStore('demo', () => {
  const useDummyData = ref(false)

  function toggleDummyData() {
    useDummyData.value = !useDummyData.value
  }

  return { useDummyData, toggleDummyData }
})
