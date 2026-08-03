<script setup>
import { ref, computed, watch, watchEffect } from 'vue'

const count = ref(0)
const doubleCount = computed(() => {
  console.log('✅ computed 재연산됨')
  return count.value * 2
})

const city = ref('서울')
const watchLog = ref('')
watch(city, (newVal, oldVal) => {
  watchLog.value = `${oldVal} → ${newVal}로 변경됨`
})

const keyword = ref('')
const watchEffectLog = ref('')
watchEffect(() => {
  watchEffectLog.value = `[watchEffect] 검색어: "${keyword.value}"`
})
</script>

<template>
  <div class="practice-section">
    <h2>computed / watch / watchEffect 학습 (p.125)</h2>

    <h3>1) computed — 캐싱되는 계산값</h3>
    <p>count: {{ count }} / doubleCount: {{ doubleCount }}</p>
    <button @click="count++">count 증가</button>

    <h3>2) watch — 특정 값 변경 감시</h3>
    <select v-model="city">
      <option value="서울">서울</option>
      <option value="수원">수원</option>
      <option value="부산">부산</option>
    </select>
    <p>{{ watchLog || '아직 변경 없음' }}</p>

    <h3>3) watchEffect — 자동 추적 + 즉시 실행</h3>
    <input v-model="keyword" placeholder="검색어 입력" />
    <p>{{ watchEffectLog }}</p>
  </div>
</template>
