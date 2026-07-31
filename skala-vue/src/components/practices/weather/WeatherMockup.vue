<script setup>
import { ref, computed } from 'vue'

// day1.pdf 스펙: 정확히 지정된 데이터, id 형식 city_01 등
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
])

// day1.pdf 스펙: v-model이 아니라 :value + @input으로 수동 양방향 처리 (한글 IME 확인용)
const searchQuery = ref('')
function handleSearchInput(e) {
  searchQuery.value = e.target.value
}

const filteredList = computed(() =>
  weatherList.value.filter((city) => city.name.includes(searchQuery.value)),
)
</script>

<template>
  <div class="practice-section">
    <h2>날씨 Mockup — Day 1 공식 과제 (day1.pdf 스펙)</h2>

    <input
      :value="searchQuery"
      @input="handleSearchInput"
      placeholder="도시명을 검색하세요 (한글 입력 테스트)"
    />

    <ul>
      <li v-for="city in filteredList" :key="city.id">
        {{ city.name }} - {{ city.temp }}도, {{ city.status }}
        <span v-if="city.temp >= 25">🔥 더움 (25도 이상)</span>
        <span v-else>❄ 선선함 (25도 미만)</span>
      </li>
    </ul>
  </div>
</template>
