<script setup>
import { computed } from 'vue'

// 상세 페이지 참고 이미지("창문 밖으로 도시가 보이는" 구성)를 이 앱의 픽셀/레트로 톤으로
// 재해석한 정적 일러스트. 프레임마다 다시 그리는 애니메이션 그리드(DotMatrixIcon 같은)가
// 아니라, 그라디언트·clip-path 도형 몇 개로만 구성해 렌더 비용이 사실상 0에 가깝다 —
// 시간이 지나도, 창을 리사이즈해도 다시 계산할 값이 전혀 없다(밤/낮만 마운트 시 한 번 계산).
const props = defineProps({
  condition: {
    type: String,
    default: 'sun',
  },
  sunrise: {
    type: Number,
    default: null,
  },
  sunset: {
    type: Number,
    default: null,
  },
})

// WeatherMapView.vue의 isNight와 같은 계산(대표 도시 대신 이 도시 자신의 일출·일몰 기준).
const isNight = computed(() => {
  if (!props.sunrise || !props.sunset) return false
  const now = Date.now() / 1000
  return now < props.sunrise || now > props.sunset
})
</script>

<template>
  <div class="scene" :class="[`scene--${condition}`, { 'scene--night': isNight }]">
    <div class="scene__blinds" />
    <div class="scene__sky">
      <div class="scene__orb" />
    </div>
    <div class="scene__skyline" />
    <div class="scene__cat" />
  </div>
</template>

<style scoped>
.scene {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 12px;
  overflow: hidden;
  background: #0b0b0f;
}

.scene__blinds {
  position: absolute;
  inset: 0 0 auto 0;
  height: 14%;
  background: repeating-linear-gradient(to bottom, #0b0b0f 0 3px, transparent 3px 8px);
  background-color: #232228;
  z-index: 3;
}

.scene__sky {
  position: absolute;
  inset: 14% 0 0 0;
  background: linear-gradient(180deg, var(--sky-from), var(--sky-to));
}

/* 조건별 하늘 색 — 낮 기준 그라디언트만 정의하고, 밤은 아래 --night 오버레이 하나로
   전부 어둡게 눌러서 12종(조건×낮/밤)을 따로 만들지 않는다. */
.scene--sun {
  --sky-from: #ffe6b0;
  --sky-to: #f6b98f;
  --orb-color: #ffd24a;
}
.scene--cloud {
  --sky-from: #d9c9e2;
  --sky-to: #eec3cf;
  --orb-color: #f7ede2;
}
.scene--rain {
  --sky-from: #bcd3cb;
  --sky-to: #5f8f8a;
  --orb-color: #dfe9e6;
}
.scene--snow {
  --sky-from: #dceffa;
  --sky-to: #aecbe0;
  --orb-color: #ffffff;
}
.scene--thunderstorm {
  --sky-from: #8f8aa8;
  --sky-to: #4a4560;
  --orb-color: #fff3c0;
}
.scene--fog {
  --sky-from: #cfd3d4;
  --sky-to: #a7acae;
  --orb-color: #e8eaea;
}

.scene__orb {
  position: absolute;
  top: 14%;
  right: 18%;
  width: 15%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--orb-color);
  box-shadow: 0 0 16px var(--orb-color);
}

/* 밤 — 조건별 낮 그라디언트 위에 어두운 반투명 막 하나만 덮어 톤을 낮춘다. */
.scene--night .scene__sky::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(8, 10, 30, 0.55);
}
.scene--night .scene__orb {
  background: #eef1f6;
  box-shadow: 0 0 10px rgba(238, 241, 246, 0.6);
}

/* 도시 스카이라인 실루엣 — clip-path 다각형 하나로 건물 윤곽을 표현한다. */
.scene__skyline {
  position: absolute;
  inset: 55% 0 0 0;
  background: #14141c;
  clip-path: polygon(
    0% 100%, 0% 55%, 8% 55%, 8% 35%, 16% 35%, 16% 60%, 24% 60%, 24% 20%,
    30% 20%, 30% 50%, 38% 50%, 38% 40%, 46% 40%, 46% 65%, 54% 65%, 54% 30%,
    62% 30%, 62% 55%, 70% 55%, 70% 15%, 78% 15%, 78% 45%, 86% 45%, 86% 60%,
    94% 60%, 94% 40%, 100% 40%, 100% 100%
  );
}

/* 창틀에 걸터앉은 고양이 실루엣 — 몸통(둥근 사각형) + 세모 귀 두 개. 정적 도형이라
   애니메이션 없이도 이미지의 핵심 모티프를 가볍게 담는다. */
/* 고양이와 스카이라인이 같은 검정(#14141c)이라 겹치는 위치에서는 색만으로 구분이 안 된다
   — 몸통 가장자리에 은은한 밝은 테두리(box-shadow)를 둘러 배경과 같은 색이어도 실루엣
   윤곽이 드러나게 한다. */
.scene__cat {
  position: absolute;
  left: 10%;
  bottom: 4%;
  width: 24%;
  height: 26%;
  background: #14141c;
  border-radius: 60% 60% 45% 45% / 75% 75% 35% 35%;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.18);
  z-index: 2;
}
.scene__cat::before,
.scene__cat::after {
  content: '';
  position: absolute;
  top: -28%;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 11px solid #14141c;
  filter: drop-shadow(0 0 0.5px rgba(255, 255, 255, 0.3));
}
.scene__cat::before {
  left: 8%;
  transform: rotate(-12deg);
}
.scene__cat::after {
  right: 8%;
  transform: rotate(12deg);
}
</style>
