<script setup>
import { ref } from 'vue'

// 1) Inline Handler vs Method Handler
const inlineCount = ref(0)
const methodCount = ref(0)
function increment() {
  methodCount.value++
}

// 2) Event Object
const eventLog = ref('클릭하거나 입력창에 키를 눌러보세요')
function logClick(e) {
  eventLog.value = `클릭 좌표: (${e.clientX}, ${e.clientY}) / target: ${e.target.tagName}`
}
function logKey(e) {
  eventLog.value = `누른 키: ${e.key} / ctrl: ${e.ctrlKey} / shift: ${e.shiftKey}`
}

// 3) Event Modifier
const formLog = ref('')
function submitForm() {
  formLog.value = '.prevent 덕분에 새로고침 없이 이 함수만 실행됨'
}

const bubbleLog = ref('')
function outerClick() {
  bubbleLog.value = '바깥 상자 클릭'
}
function innerClick() {
  bubbleLog.value = '안쪽 버튼만 클릭 (.stop으로 버블링 차단됨)'
}

const onceLog = ref('아직 클릭 안 함')
function onceClick() {
  onceLog.value = '한 번만 실행됨 (.once) — 다시 눌러도 안 바뀜'
}
</script>

<template>
  <div class="practice-section">
    <h2>v-on 이벤트 핸들링 학습</h2>

    <h3>1) Inline Handler vs Method Handler</h3>
    <p>Inline: {{ inlineCount }} / Method: {{ methodCount }}</p>
    <button @click="inlineCount++">Inline로 증가</button>
    <button @click="increment">Method로 증가</button>

    <h3>2) Event Object</h3>
    <p>{{ eventLog }}</p>
    <button @click="logClick">클릭해서 좌표 확인</button>
    <input @keyup="logKey" placeholder="아무 키나 입력해보세요" />

    <h3>3) Event Modifier</h3>
    <form @submit.prevent="submitForm">
      <button type="submit">.prevent로 제출 (새로고침 안 됨)</button>
    </form>
    <p>{{ formLog }}</p>

    <div @click="outerClick" style="padding: 20px; background: #eee">
      바깥 영역
      <button @click.stop="innerClick">.stop 버튼 (버블링 차단)</button>
    </div>
    <p>{{ bubbleLog }}</p>

    <button @click.once="onceClick">.once 버튼 (한 번만 동작)</button>
    <p>{{ onceLog }}</p>
  </div>
</template>
