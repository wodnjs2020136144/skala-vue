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
    <input
      class="search-bar__input"
      :value="query"
      @input="handleInput"
      placeholder="도시명을 검색하세요 (한글 입력 테스트)"
    />
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border-radius: 999px;
  padding: 10px 16px;
  box-shadow: 0 1px 2px rgba(20, 20, 30, 0.04);
}

.search-bar__icon {
  color: #b7bcc4;
  font-size: 14px;
}

.search-bar__input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;
  color: #3a3f45;
  background: transparent;
}

.search-bar__input::placeholder {
  color: #b7bcc4;
}
</style>
