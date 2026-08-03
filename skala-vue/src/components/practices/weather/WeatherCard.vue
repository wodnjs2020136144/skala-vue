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
    <div class="city-card__badge">
      <!-- 카드 아이콘은 44px로 작아 애니메이션 디테일이 잘 안 보이는데, 홈 화면에 9장이 동시에
           떠 있으면 각자 80ms마다 36x36 그리드를 다시 계산해 렉이 심해진다. 큰 화면(지도 팝업/
           상세 페이지)에서만 animated=true로 켜고, 카드에서는 정적 1프레임만 그린다. -->
      <DotMatrixIcon :condition="city.condition" size="sm" :animated="false" />
    </div>
    <div class="city-card__info">
      <p class="city-card__name">{{ city.name }}</p>
      <p class="city-card__status">{{ city.status }}</p>
    </div>
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
  </li>
</template>

<style scoped>
.city-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--paper);
  border-radius: 16px;
  padding: 16px 18px;
  box-shadow: 0 1px 3px rgba(20, 20, 30, 0.05);
  cursor: pointer;
}

.city-card__badge {
  flex-shrink: 0;
}

.city-card__info {
  flex: 1;
  min-width: 0;
}

.city-card__name {
  margin: 0;
  font-family: var(--font-pixel-kr);
  font-size: 15px;
  color: var(--ink);
  letter-spacing: 0.05em;
}

.city-card__status {
  margin: 2px 0 0;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--moss);
}

.city-card__temp-block {
  text-align: right;
}

.city-card__temp {
  margin: 0;
  font-family: var(--font-pixel);
  font-size: 20px;
  color: var(--ink);
  line-height: 1;
}

.city-card__unit {
  font-size: 13px;
  color: var(--moss);
}

.city-card__label {
  display: inline-block;
  margin-top: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 2px 8px;
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
  font-size: 12px;
  padding: 6px 10px;
  cursor: pointer;
  flex-shrink: 0;
}

.city-card__detail-btn:hover {
  color: var(--amber);
}
</style>
