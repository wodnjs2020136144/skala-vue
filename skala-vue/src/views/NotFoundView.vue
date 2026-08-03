<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="not-found">
    <h2>404 — 페이지를 찾을 수 없습니다</h2>
    <p>주소를 다시 확인해 주세요.</p>
    <button @click="router.push({ name: 'weather-home' })">홈으로 돌아가기</button>
  </div>
</template>

<style scoped>
.not-found {
  max-width: 420px;
  margin: 60px auto;
  text-align: center;
  color: #6b7076;
}

.not-found button {
  margin-top: 12px;
  border: none;
  background: #f1f2f4;
  color: #3a3f45;
  font-size: 13px;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
}
</style>
