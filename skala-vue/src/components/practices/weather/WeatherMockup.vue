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
  <div class="weather-card-app">
    <header class="weather-card-app__header">
      <h2>날씨 Mockup — Day 1 공식 과제 (day1.pdf 스펙)</h2>
      <div class="search-bar">
        <FontAwesomeIcon icon="magnifying-glass" class="search-bar__icon" />
        <input
          class="search-bar__input"
          :value="searchQuery"
          @input="handleSearchInput"
          placeholder="도시명을 검색하세요 (한글 입력 테스트)"
        />
      </div>
    </header>

    <ul class="city-list">
      <li v-for="city in filteredList" :key="city.id" class="city-card">
        <div class="city-card__badge" :class="city.temp >= 25 ? 'is-warm' : 'is-cool'">
          <FontAwesomeIcon :icon="city.temp >= 25 ? 'fire' : 'snowflake'" />
        </div>
        <div class="city-card__info">
          <p class="city-card__name">{{ city.name }}</p>
          <p class="city-card__status">{{ city.status }}</p>
        </div>
        <div class="city-card__temp-block">
          <p class="city-card__temp">{{ city.temp }}<span class="city-card__unit">°</span></p>
          <span class="city-card__label" :class="city.temp >= 25 ? 'is-warm' : 'is-cool'">
            {{ city.temp >= 25 ? '더움' : '선선함' }}
          </span>
        </div>
      </li>
    </ul>

    <p v-if="filteredList.length === 0" class="empty-state">검색 결과가 없습니다.</p>
  </div>
</template>

<style scoped>
.weather-card-app {
  max-width: 420px;
  margin: 0 auto;
  padding: 28px;
  background: #f6f7f8;
  border-radius: 20px;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'Pretendard',
    sans-serif;
}

.weather-card-app__header h2 {
  font-size: 15px;
  font-weight: 600;
  color: #8a8f98;
  margin: 0 0 16px;
  letter-spacing: 0.2px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border-radius: 999px;
  padding: 10px 16px;
  box-shadow: 0 1px 2px rgba(20, 20, 30, 0.04);
}

.search-bar__icon {
  color: #b7bcc4;
  font-size: 14px;
}

.search-bar__input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;
  color: #3a3f45;
  background: transparent;
}

.search-bar__input::placeholder {
  color: #b7bcc4;
}

.city-list {
  list-style: none;
  margin: 20px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.city-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #ffffff;
  border-radius: 16px;
  padding: 16px 18px;
  box-shadow: 0 1px 3px rgba(20, 20, 30, 0.05);
}

.city-card__badge {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.city-card__badge.is-warm {
  background: #f5e4db;
  color: #c97b4a;
}

.city-card__badge.is-cool {
  background: #e1eaee;
  color: #6e97a6;
}

.city-card__info {
  flex: 1;
  min-width: 0;
}

.city-card__name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #2e3238;
}

.city-card__status {
  margin: 2px 0 0;
  font-size: 13px;
  color: #9ba1a8;
}

.city-card__temp-block {
  text-align: right;
}

.city-card__temp {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #2e3238;
  line-height: 1;
}

.city-card__unit {
  font-size: 13px;
  font-weight: 500;
  color: #9ba1a8;
}

.city-card__label {
  display: inline-block;
  margin-top: 4px;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
}

.city-card__label.is-warm {
  background: #f5e4db;
  color: #c97b4a;
}

.city-card__label.is-cool {
  background: #e1eaee;
  color: #6e97a6;
}

.empty-state {
  text-align: center;
  color: #9ba1a8;
  font-size: 13px;
  margin-top: 24px;
}
</style>
