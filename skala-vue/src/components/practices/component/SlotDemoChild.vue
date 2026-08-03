<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="slot-card">
    <header>
      <slot name="header"><strong>기본 헤더</strong></slot>
    </header>
    <div><slot>기본 콘텐츠입니다.</slot></div>
    <ul>
      <li v-for="item in items" :key="item">
        <slot name="item" :text="item">{{ item }}</slot>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.slot-card {
  border: 1px solid #e7e9ec;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
}
</style>
