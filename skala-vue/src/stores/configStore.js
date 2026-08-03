import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 앱 전역 설정(온도 단위)을 관리하는 스토어.
// 메인/상세 화면 어디서든 이 스토어 하나만 참조하면 같은 단위로 동기화된다.
export const useConfigStore = defineStore('config', () => {
  const unit = ref('metric') // 'metric'(섭씨) | 'imperial'(화씨)

  const unitSymbol = computed(() => (unit.value === 'metric' ? '℃' : '℉'))

  function toggleUnit() {
    unit.value = unit.value === 'metric' ? 'imperial' : 'metric'
  }

  return { unit, unitSymbol, toggleUnit }
})
