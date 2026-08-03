<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: Number, // 0~100 사이로 정규화된 비율
    required: true,
  },
  displayValue: {
    type: String,
    required: true,
  },
})

const DOT_COUNT = 16
const clampedValue = computed(() => Math.max(0, Math.min(100, props.value)))
const litCount = computed(() => Math.round((clampedValue.value / 100) * DOT_COUNT))
</script>

<template>
  <div class="dot-stat-bar">
    <div class="dot-stat-bar__head">
      <span class="dot-stat-bar__label">{{ label }}</span>
      <span class="dot-stat-bar__value">{{ displayValue }}</span>
    </div>
    <div class="dot-stat-bar__dots">
      <span
        v-for="index in DOT_COUNT"
        :key="index"
        class="dot-stat-bar__dot"
        :class="{ 'is-lit': index <= litCount }"
      />
    </div>
  </div>
</template>

<style scoped>
.dot-stat-bar {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dot-stat-bar__head {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--moss);
}

.dot-stat-bar__value {
  color: var(--ink);
}

.dot-stat-bar__dots {
  display: flex;
  gap: 3px;
}

.dot-stat-bar__dot {
  flex: 1;
  aspect-ratio: 2 / 3;
  border-radius: 2px;
  background: var(--dot-off);
}

.dot-stat-bar__dot.is-lit {
  background: var(--amber);
}
</style>
