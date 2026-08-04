<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'hot', // hot | cold
  },
  size: {
    type: Number,
    default: 14, // px, 전체 정사각형 한 변 길이
  },
})

// 7x7 격자에 불꽃/얼음 모양을 픽셀아트로 근사한 패턴. FavoriteHeartDots와 동일한 방식.
const FLAME_PATTERN = [
  [0, 0, 0, 1, 0, 0, 0],
  [0, 0, 1, 1, 0, 0, 0],
  [0, 1, 0, 1, 1, 0, 0],
  [0, 1, 0, 1, 1, 0, 0],
  [0, 1, 1, 0, 1, 1, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 0],
]
const SNOWFLAKE_PATTERN = [
  [0, 0, 0, 1, 0, 0, 0],
  [1, 0, 1, 1, 1, 0, 1],
  [0, 1, 0, 1, 0, 1, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [0, 1, 0, 1, 0, 1, 0],
  [1, 0, 1, 1, 1, 0, 1],
  [0, 0, 0, 1, 0, 0, 0],
]

const cells = computed(() => (props.variant === 'cold' ? SNOWFLAKE_PATTERN : FLAME_PATTERN).flat())
</script>

<template>
  <div
    class="pixel-temp-icon"
    :class="`pixel-temp-icon--${variant}`"
    :style="{ width: `${size}px`, height: `${size}px`, gridTemplateColumns: 'repeat(7, 1fr)' }"
  >
    <span v-for="(lit, index) in cells" :key="index" class="pixel-temp-icon__dot" :class="{ 'is-lit': lit }" />
  </div>
</template>

<style scoped>
.pixel-temp-icon {
  display: grid;
  gap: 1px;
}

.pixel-temp-icon__dot {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 1px;
  background: transparent;
}

.pixel-temp-icon--hot .pixel-temp-icon__dot.is-lit {
  background: var(--amber);
}

.pixel-temp-icon--cold .pixel-temp-icon__dot.is-lit {
  background: var(--sea);
}
</style>
