<script setup>
import { computed } from 'vue'
import { useConfigStore } from '../stores/configStore'

const configStore = useConfigStore()
// 버튼 라벨은 "현재 단위"가 아니라 눌렀을 때 "바뀔 단위"를 보여준다 — 현재 단위를 그대로
// 보여주면(예: 섭씨 상태에서 "℃ 전환") 누르면 그 단위가 된다는 뜻처럼 읽혀 헷갈린다.
const nextUnitSymbol = computed(() => (configStore.unit === 'metric' ? '℉' : '℃'))
</script>

<template>
  <button class="unit-toggler" @click="configStore.toggleUnit">
    {{ nextUnitSymbol }}로 전환
  </button>
</template>

<style scoped>
.unit-toggler {
  border: 1px solid var(--moss);
  background: var(--panel);
  color: var(--dot-lit);
  font-family: var(--font-pixel-kr);
  font-size: 13px;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
}

.unit-toggler:hover {
  border-color: var(--amber);
  color: var(--amber);
}
</style>
