<script setup>
// 풍향(windDeg) 픽셀 아이콘 — API에서 받아오면서도 그동안 화면 어디에도 쓰이지 않던
// "죽은 데이터"를 처음 활용하는 지점이다. windDeg는 기상학 관례상 "바람이 불어오는 방향"을
// 가리키므로, 화살표도 그 방향을 가리키도록 회전시킨다(0°/360°=북에서 불어옴 → 위쪽 고정).
defineProps({
  degrees: {
    type: Number,
    default: 0,
  },
  size: {
    type: Number,
    default: 14, // px, 전체 정사각형 한 변 길이
  },
})

// PixelTempIcon.vue와 같은 7x7 격자 패턴 방식 — 위쪽을 가리키는 화살표(화살촉+꼬리).
const ARROW_PATTERN = [
  [0, 0, 0, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0],
]
const cells = ARROW_PATTERN.flat()
</script>

<template>
  <div
    class="wind-direction-icon"
    :style="{ width: `${size}px`, height: `${size}px`, gridTemplateColumns: 'repeat(7, 1fr)', transform: `rotate(${degrees}deg)` }"
  >
    <span v-for="(lit, index) in cells" :key="index" class="wind-direction-icon__dot" :class="{ 'is-lit': lit }" />
  </div>
</template>

<style scoped>
.wind-direction-icon {
  display: grid;
  gap: 1px;
}

.wind-direction-icon__dot {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 1px;
  background: transparent;
}

.wind-direction-icon__dot.is-lit {
  background: var(--sea);
}
</style>
