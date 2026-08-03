<script setup>
import { ref, onMounted, onUpdated, onUnmounted } from 'vue'

const seconds = ref(0)
const log = ref('')
let timerId = null

onMounted(() => {
  log.value = 'onMounted: 타이머 시작'
  timerId = setInterval(() => {
    seconds.value++
  }, 1000)
})
onUpdated(() => {
  console.log('onUpdated: 화면이 갱신됨, seconds =', seconds.value)
})
onUnmounted(() => {
  clearInterval(timerId) // 메모리 누수 방지
  console.log('onUnmounted: 타이머 정리 완료')
})
</script>

<template>
  <div class="practice-section">
    <h2>Component Lifecycle 학습 (p.136)</h2>
    <p>{{ log }}</p>
    <p>경과 시간: {{ seconds }}초</p>
    <p style="color: #9ba1a8; font-size: 13px">
      1초마다 자동으로 증가합니다. 다른 페이지로 이동해 이 컴포넌트가 화면에서 사라지면
      onUnmounted에서 타이머가 정리됩니다(콘솔 확인).
    </p>
  </div>
</template>
