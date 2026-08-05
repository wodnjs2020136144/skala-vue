<script setup>
import DotMatrixIcon from './DotMatrixIcon.vue'

defineProps({
  city: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['select-card', 'click-detail'])
</script>

<template>
  <li class="city-card" @click="emit('select-card', city)">
    <div class="city-card__head">
      <!-- 카드 아이콘은 44px로 작아 애니메이션 디테일이 잘 안 보이는데, 홈 화면에 17장이
           동시에 떠 있으면 각자 80ms마다 36x36 그리드를 다시 계산해 렉이 심해진다. 큰 화면(지도
           팝업/상세 페이지)에서만 animated=true로 켜고, 카드에서는 정적 1프레임만 그린다. -->
      <DotMatrixIcon :condition="city.condition" size="sm" :animated="false" />
      <div class="city-card__head-text">
        <p class="city-card__name">{{ city.name }}</p>
        <p class="city-card__status">{{ city.status }}</p>
      </div>
    </div>
    <div class="city-card__foot">
      <div class="city-card__temp-block">
        <p class="city-card__temp">
          {{ city.displayTemp ?? city.temp
          }}<span class="city-card__unit">{{ city.unitSymbol ?? '°' }}</span>
        </p>
        <span class="city-card__label" :class="city.temp >= 25 ? 'is-warm' : 'is-cool'">
          {{ city.temp >= 25 ? '더움' : '선선함' }}
        </span>
      </div>
      <button class="city-card__detail-btn" @click.stop="emit('click-detail', city)">상세</button>
    </div>
  </li>
</template>

<style scoped>
/* 홈 화면이 17개 도시를 2열 그리드로 보여주면서(WeatherHomeView.vue의 .city-list),
   카드 한 장의 실질 폭이 ~170px까지 좁아진다 — 기존의 "아이콘+이름+온도+버튼"을 한 줄에
   다 욱여넣던 가로 레이아웃은 이 폭에서 텍스트가 한 글자씩 줄바꿈되며 무너졌다. 아이콘+이름
   묶음과 온도+버튼 묶음, 두 줄로 나누고 긴 텍스트는 말줄임표로 자르는 세로 레이아웃으로
   바꿔 좁은 폭에서도(그리고 원래의 넓은 1열 폭에서도) 안정적으로 보이게 했다. */
.city-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--paper);
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(20, 20, 30, 0.05);
  cursor: pointer;
}

.city-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.city-card__head-text {
  flex: 1;
  min-width: 0;
}

.city-card__name {
  margin: 0;
  font-family: var(--font-pixel-kr);
  font-size: 14px;
  color: var(--ink);
  letter-spacing: 0.05em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.city-card__status {
  margin: 2px 0 0;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--moss);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.city-card__foot {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
}

.city-card__temp {
  margin: 0;
  font-family: var(--font-pixel);
  font-size: 18px;
  color: var(--ink);
  line-height: 1;
}

.city-card__unit {
  font-size: 12px;
  color: var(--moss);
}

.city-card__label {
  display: inline-block;
  margin-top: 4px;
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 999px;
}

.city-card__label.is-warm {
  background: rgba(201, 138, 44, 0.15);
  color: var(--amber);
}

.city-card__label.is-cool {
  background: rgba(94, 107, 90, 0.15);
  color: var(--moss);
}

.city-card__detail-btn {
  border: none;
  background: none;
  color: var(--moss);
  font-family: var(--font-pixel-kr);
  font-size: 11px;
  padding: 4px 8px;
  cursor: pointer;
  flex-shrink: 0;
}

.city-card__detail-btn:hover {
  color: var(--amber);
}
</style>
