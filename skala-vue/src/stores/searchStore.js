import { ref } from 'vue'
import { defineStore } from 'pinia'

// 상단 네비게이션의 검색창이 쓰는 전역 검색어. 실제 필터링은 "날씨" 홈 화면에서만 이 값을 읽는다.
export const useSearchStore = defineStore('search', () => {
  const query = ref('')

  function setQuery(value) {
    query.value = value
  }

  return { query, setQuery }
})
