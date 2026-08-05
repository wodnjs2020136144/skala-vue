<script setup>
defineProps({
  query: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update-query'])

// day1.pdf 스펙: v-model이 아니라 :value + @input으로 수동 양방향 처리 (한글 IME 확인용)
function handleInput(e) {
  emit('update-query', e.target.value)
}
</script>

<template>
  <div class="search-bar">
    <FontAwesomeIcon icon="magnifying-glass" class="search-bar__icon" />
    <input class="search-bar__input" :value="query" @input="handleInput" placeholder="도시명을 검색하세요"
      aria-label="도시 검색" />
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--panel);
  border-radius: 999px;
  padding: 10px 16px;
  border: 1px solid transparent;
}

.search-bar:focus-within {
  border-color: var(--amber);
}

.search-bar__icon {
  color: var(--moss);
  font-size: 14px;
}

.search-bar__input {
  border: none;
  outline: none;
  flex: 1;
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--dot-lit);
  background: transparent;
}

.search-bar__input::placeholder {
  color: var(--moss);
}
</style>
