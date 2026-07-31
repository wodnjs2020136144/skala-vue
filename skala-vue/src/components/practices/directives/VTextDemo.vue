<script setup>
const content = '안녕하세요! <strong>Skala-Vue</strong> 강의입니다.'
</script>

<template>
  <div class="practice-section">
    <h2>v-text 디렉티브 학습</h2>

    <h3>1) 일반 보간법 결과</h3>
    <p>{{ content }}</p>

    <h3>2) v-text 결과 (보간법과 동일하게 동작)</h3>
    <p v-text="'출력: ' + content"></p>

    <h3>3) v-html 결과 비교 (HTML로 해석됨)</h3>
    <p v-html="content"></p>
  </div>
</template>
