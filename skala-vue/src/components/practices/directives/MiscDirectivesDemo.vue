<script setup>
import { ref } from 'vue'
const rawText = '{{ 이 글자는 컴파일되지 않고 그대로 보입니다 }}'
const onceCount = ref(0)
const memoCount = ref(0)
const memoKey = ref(0)
</script>

<template>
  <div class="practice-section">
    <h2>v-pre / v-cloak / v-once / v-memo 학습</h2>

    <h3>1) v-pre — 템플릿 컴파일 없이 원본 그대로 출력</h3>
    <p v-pre>{{ rawText }}</p>

    <h3>2) v-cloak — 바인딩 완료 전 보간법 텍스트 노출 방지</h3>
    <p style="color: #888">
      데이터 바인딩이 끝나기 전 잠깐 중괄호 두 개짜리 보간법 원본 텍스트가 그대로 노출되는 것을 막는
      디렉티브입니다. <code>[v-cloak] &#123; display: none &#125;</code> CSS와 함께 써야 하며, 이미
      컴파일이 끝난 화면에서는 그 순간을 눈으로 재현하기 어려워 개념으로만 정리합니다.
    </p>

    <h3>3) v-once — 최초 1회만 렌더링</h3>
    <p v-once>최초 렌더링 시점 값(이후 안 바뀜): {{ onceCount }}</p>
    <button @click="onceCount++">onceCount 증가 (화면은 그대로)</button>

    <h3>4) v-memo — 지정한 변수가 바뀔 때만 갱신</h3>
    <p v-memo="[memoKey]">memoKey 기준 캐시된 값: {{ memoCount }}</p>
    <button @click="memoCount++">memoCount만 증가 (화면 유지됨)</button>
    <button @click="memoKey++">memoKey 증가 (이때 memoCount도 함께 갱신됨)</button>
  </div>
</template>
