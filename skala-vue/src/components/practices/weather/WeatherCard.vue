<script setup>
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
    <div class="city-card__badge" :class="city.temp >= 25 ? 'is-warm' : 'is-cool'">
      <FontAwesomeIcon :icon="city.temp >= 25 ? 'fire' : 'snowflake'" />
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
  background: #ffffff;
  border-radius: 16px;
  padding: 16px 18px;
  box-shadow: 0 1px 3px rgba(20, 20, 30, 0.05);
  cursor: pointer;
}

.city-card__badge {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.city-card__badge.is-warm {
  background: #f5e4db;
  color: #c97b4a;
}

.city-card__badge.is-cool {
  background: #e1eaee;
  color: #6e97a6;
}

.city-card__info {
  flex: 1;
  min-width: 0;
}

.city-card__name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #2e3238;
}

.city-card__status {
  margin: 2px 0 0;
  font-size: 13px;
  color: #9ba1a8;
}

.city-card__temp-block {
  text-align: right;
}

.city-card__temp {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #2e3238;
  line-height: 1;
}

.city-card__unit {
  font-size: 13px;
  font-weight: 500;
  color: #9ba1a8;
}

.city-card__label {
  display: inline-block;
  margin-top: 4px;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
}

.city-card__label.is-warm {
  background: #f5e4db;
  color: #c97b4a;
}

.city-card__label.is-cool {
  background: #e1eaee;
  color: #6e97a6;
}

.city-card__detail-btn {
  border: none;
  background: #f1f2f4;
  color: #6b7076;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  cursor: pointer;
  flex-shrink: 0;
}

.city-card__detail-btn:hover {
  background: #e7e9ec;
}
</style>
