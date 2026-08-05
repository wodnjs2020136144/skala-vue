<script setup>
import { ref } from 'vue'
import DotMatrixIcon from '../components/practices/weather/DotMatrixIcon.vue'

const conditions = [
  { key: 'sun', label: '해 (맑음) — 빨강·주황·노랑 8방향 광선이 중심에서 순차 반짝임' },
  { key: 'cloud', label: '구름 — 비대칭 둥근 형태, 좌→우 은은한 밝기 웨이브' },
  { key: 'rain', label: '비 — 구름 없이, 굵은 빗방울이 또르륵 흘러내림' },
  { key: 'snow', label: '눈 — 구름 없이, "+"자 눈송이가 서서히 아래로 내려앉음' },
  { key: 'thunderstorm', label: '뇌우 — 구름 없이, 번개가 위→아래로 번쩍 떨어짐' },
  { key: 'fog', label: '안개 — 불규칙한 뭉치가 자유롭게 나타났다 사라짐' },
]

const colorEnabled = ref(true)
</script>

<template>
  <div class="preview-page">
    <div class="preview-page__header">
      <h2 class="preview-page__title">DotMatrixIcon 애니메이션 미리보기 (6종 비교)</h2>
      <button class="preview-page__toggle" @click="colorEnabled = !colorEnabled">
        {{ colorEnabled ? '색상 적용 후' : '색상 적용 전' }} (클릭해서 전환)
      </button>
    </div>
    <div class="preview-page__grid">
      <div v-for="item in conditions" :key="item.key" class="preview-page__item">
        <DotMatrixIcon :condition="item.key" size="lg" :animated="true" :colored="colorEnabled" />
        <p class="preview-page__label">{{ item.label }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-page {
  padding: 28px;
}

.preview-page__header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.preview-page__title {
  font-size: 15px;
  font-weight: 600;
  color: #8a8f98;
  margin: 0;
}

.preview-page__toggle {
  border: 1px solid #8a8f98;
  background: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  color: #8a8f98;
  cursor: pointer;
}

.preview-page__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.preview-page__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.preview-page__label {
  max-width: 260px;
  text-align: center;
  font-size: 12px;
  color: #6b7076;
}
</style>
