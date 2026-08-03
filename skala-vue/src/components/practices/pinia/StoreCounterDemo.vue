<script setup>
import { useCounterStore } from '../../../stores/counter'

const counterStore = useCounterStore()
</script>

<template>
  <div class="practice-section">
    <h2>Pinia Counter Store 학습 (p.190)</h2>
    <p>
      원본 카운트 데이터(state): <strong>{{ counterStore.count }}</strong>
    </p>
    <p>2배 연산 데이터(getters): {{ counterStore.doubleCount }}</p>
    <button @click="counterStore.increment">숫자 1 증가 (actions)</button>
  </div>
</template>
