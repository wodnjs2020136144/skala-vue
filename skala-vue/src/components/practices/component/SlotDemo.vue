<script setup>
import SlotDemoChild from './SlotDemoChild.vue'

const fruits = ['사과', '바나나', '포도']
</script>

<template>
  <div class="practice-section">
    <h2>Slot 학습 — Default / Named / Scoped (p.157)</h2>

    <SlotDemoChild :items="fruits">
      <template #header><h3>🍎 과일 목록</h3></template>
      <template #item="slotProps">
        <span style="color: #c97b4a">{{ slotProps.text }}</span>
      </template>
    </SlotDemoChild>
  </div>
</template>
