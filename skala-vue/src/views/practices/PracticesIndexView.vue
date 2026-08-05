<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="practices-index">
    <h2>실습 모음</h2>
    <p class="practices-index__desc">
      날씨 종합과제(메인 실습)와 별개로 진행한 챕터별 Code Challenge 데모를 일자별로 모았습니다.
    </p>
    <nav class="practices-index__list">
      <RouterLink to="/practices/day1" class="practices-index__link">
        Day 1 — Vue 문법(디렉티브/이벤트/폼)
      </RouterLink>
      <RouterLink to="/practices/day2" class="practices-index__link">
        Day 2 — Composition API / Component
      </RouterLink>
      <RouterLink to="/practices/day3" class="practices-index__link">
        Day 3 — Pinia / Axios
      </RouterLink>
      <RouterLink to="/practices/day4" class="practices-index__link">
        Day 4 — UI 라이브러리(Element Plus) / Modern JavaScript
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.practices-index {
  max-width: 420px;
  margin: 0 auto;
  padding: 28px;
}

.practices-index__desc {
  color: #9ba1a8;
  font-size: 13px;
  margin: 8px 0 20px;
}

.practices-index__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.practices-index__link {
  display: block;
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(20, 20, 30, 0.05);
  color: #2e3238;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}

.practices-index__link:hover {
  background: #f1f2f4;
}

@media (max-width: 640px) {
  .practices-index {
    padding: 18px;
  }
}
</style>
