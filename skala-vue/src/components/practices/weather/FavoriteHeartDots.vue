<script setup>
defineProps({
  active: {
    type: Boolean,
    default: false,
  },
  size: {
    type: Number,
    default: 20, // px, 전체 정사각형 한 변 길이
  },
})

// 7x7 격자에 하트 모양을 픽셀아트로 근사한 패턴.
const HEART_PATTERN = [
  [0, 1, 1, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 0],
]
const CELLS = HEART_PATTERN.flat()
</script>

<template>
  <div
    class="favorite-heart"
    :style="{ width: `${size}px`, height: `${size}px`, gridTemplateColumns: 'repeat(7, 1fr)' }"
  >
    <span
      v-for="(lit, index) in CELLS"
      :key="index"
      class="favorite-heart__dot"
      :class="{ 'is-lit': lit, 'is-active': lit && active }"
    />
  </div>
</template>

<style scoped>
.favorite-heart {
  display: grid;
  gap: 1px;
}

.favorite-heart__dot {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 1px;
  background: transparent;
}

.favorite-heart__dot.is-lit {
  background: var(--moss);
}

.favorite-heart__dot.is-active {
  background: var(--amber);
}
</style>
