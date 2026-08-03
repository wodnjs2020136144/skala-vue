<script setup>
import { useConfigStore } from '../stores/configStore'

const configStore = useConfigStore()
</script>

<template>
  <button class="unit-toggler" @click="configStore.toggleUnit">
    {{ configStore.unitSymbol }} 전환
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
