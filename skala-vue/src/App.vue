<script setup>
import { RouterLink, RouterView } from 'vue-router'
import UnitToggler from './components/UnitToggler.vue'
</script>

<template>
  <nav class="app-nav">
    <div class="app-nav__links">
      <RouterLink to="/" class="app-nav__link">날씨</RouterLink>
      <RouterLink to="/practices" class="app-nav__link">실습 모음</RouterLink>
    </div>
    <UnitToggler />
  </nav>
  <RouterView />
</template>

<style scoped>
.app-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e7e9ec;
}

.app-nav__links {
  display: flex;
  gap: 16px;
}

.app-nav__link {
  font-size: 14px;
  font-weight: 600;
  color: #8a8f98;
  text-decoration: none;
}

.app-nav__link.router-link-active {
  color: #2e3238;
}
</style>
