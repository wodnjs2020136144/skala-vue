<script setup>
import { ref } from 'vue'
import PropsEmitsChild from './PropsEmitsChild.vue'

const parentMessage = ref('안녕, 자식 컴포넌트!')
const receivedFromChild = ref('')

function handleNotify(payload) {
  receivedFromChild.value = payload
}
</script>

<template>
  <div class="practice-section">
    <h2>Props &amp; Emits 학습 (p.152)</h2>
    <p>부모 상태: {{ parentMessage }}</p>
    <PropsEmitsChild :message="parentMessage" @notify-parent="handleNotify" />
    <p>자식으로부터 받은 이벤트: {{ receivedFromChild || '(아직 없음)' }}</p>
  </div>
</template>
