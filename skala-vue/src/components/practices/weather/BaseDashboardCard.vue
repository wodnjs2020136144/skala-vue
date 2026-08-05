<script setup>
// 검색박스(search)와 리스트박스(list)를 담는 공통 레이아웃 컨테이너.
// 이 슬롯 안에 배치되는 콘텐츠(SearchBar, WeatherCard 등)는 시각적으로는 이 컴포넌트 내부에 있지만,
// 스크립트 스코프(변수·함수)는 이 컴포넌트를 사용하는 부모(WeatherParent)에 그대로 소속된다.
</script>

<template>
  <div class="dashboard-card">
    <div class="dashboard-card__search">
      <slot name="search" />
    </div>
    <div class="dashboard-card__list">
      <slot name="list" />
    </div>
  </div>
</template>

<style scoped>
.dashboard-card {
  max-width: 420px;
  margin: 0 auto;
  padding: 28px;
  background: var(--paper);
  border-radius: 20px;
  font-family: var(--font-mono);
}

.dashboard-card__list {
  margin-top: 20px;
}

@media (max-width: 640px) {
  .dashboard-card {
    padding: 18px;
  }
}
</style>
