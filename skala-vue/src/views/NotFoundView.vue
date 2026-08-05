<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="not-found">
    <h2 class="not-found__title">404 — 페이지를 찾을 수 없습니다</h2>
    <p>주소를 다시 확인해 주세요.</p>
    <button @click="router.push({ name: 'weather-home' })">홈으로 돌아가기</button>
  </div>
</template>

<style scoped>
.not-found {
  max-width: 420px;
  margin: 60px auto;
  text-align: center;
  color: var(--moss);
  font-family: var(--font-mono);
}

.not-found__title {
  font-family: var(--font-pixel-kr);
  font-size: 18px;
  color: var(--ink);
  letter-spacing: 0.04em;
}

.not-found button {
  margin-top: 12px;
  border: none;
  background: rgba(94, 107, 90, 0.12);
  color: var(--ink);
  font-family: var(--font-pixel-kr);
  font-size: 13px;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
}

.not-found button:hover {
  background: rgba(94, 107, 90, 0.2);
}
</style>
