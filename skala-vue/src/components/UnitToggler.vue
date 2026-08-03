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
  border: none;
  background: #f1f2f4;
  color: #3a3f45;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
}

.unit-toggler:hover {
  background: #e7e9ec;
}
</style>
