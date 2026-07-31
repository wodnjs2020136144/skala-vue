<script setup>
import { ref } from 'vue'

// 1) 일반 보간법 vs v-html 비교
const rawHtmlData = '이 글자는 <span style="color: red; font-weight: bold;">빨간색 굵은 글자</span>이다.'

// 2) v-html의 XSS 위험 데모 (alert로 안전하게 구성)
const inputValue = ref('')
const message = ref('')
function showMessage() {
  message.value = inputValue.value
}
</script>

<template>
  <div class="practice-section">
    <h2>v-html 디렉티브 학습</h2>

    <h3>1) 일반 보간법(중괄호 두 개) vs v-html 비교</h3>
    <p>보간법 결과: {{ rawHtmlData }}</p>
    <p v-html="rawHtmlData"></p>

    <h3>2) v-html의 XSS 위험 데모</h3>
    <p style="color: #888">
      아래 입력창에 <code>&lt;img src="x" onerror="alert('XSS 위험!')" /&gt;</code> 를 입력하고
      확인을 눌러보세요. 사용자 입력을 그대로 v-html로 렌더링하면 이런 악성 스크립트가 실행될 수
      있습니다.
    </p>
    <input v-model="inputValue" placeholder="HTML을 입력해보세요" style="width: 320px" />
    <button @click="showMessage">확인</button>
    <div v-html="message"></div>
  </div>
</template>
