<script setup>
import { ref } from 'vue'

// 1) 기본 바인딩
const dynamicUrl = 'https://vuejs.org/'
const logoImgSrc = 'https://vuejs.org/images/logo.png'
const isButtonDisabled = ref(true)

// 2) 클래스 바인딩
const isWarning = ref(false)
const themeClass = ref('bg-dark')

// 3) 스타일 바인딩
const textColor = ref('purple')
const boxWidth = ref(150)
</script>

<template>
  <div class="practice-section">
    <h2>v-bind 디렉티브 학습</h2>

    <h3>1) 기본 바인딩 (축약형 :)</h3>
    <a :href="dynamicUrl" target="_blank" rel="noopener">Vue 공식 사이트로 이동</a>
    <br />
    <img :src="logoImgSrc" alt="Vue 로고" style="width: 80px" />
    <br />
    <button :disabled="isButtonDisabled">동의해야 클릭 가능</button>
    <button @click="isButtonDisabled = !isButtonDisabled">잠금 토글</button>

    <h3>2) 클래스 바인딩 (객체/배열 구문)</h3>
    <p :class="{ 'text-danger': isWarning }">경고 상태: {{ isWarning }}</p>
    <button @click="isWarning = !isWarning">경고 토글</button>
    <div :class="[themeClass, isWarning ? 'border-red' : 'border-gray']">다중 클래스 조합 박스</div>

    <h3>3) 스타일 바인딩 (객체 구문)</h3>
    <p :style="{ color: textColor, fontWeight: 'bold' }">색상이 실시간으로 바뀌는 텍스트</p>
    <button @click="textColor = textColor === 'purple' ? 'blue' : 'purple'">색상 토글</button>
    <br />
    <label>박스 가로 크기(px): <input type="number" v-model.number="boxWidth" step="50" /></label>
    <div :style="{ backgroundColor: '#42b883', width: boxWidth + 'px', height: '60px' }">
      가로 {{ boxWidth }}px 박스
    </div>
  </div>
</template>

<style scoped>
.text-danger {
  color: red;
  font-weight: bold;
}
.bg-dark {
  background-color: #333;
  color: white;
  padding: 15px;
}
.border-red {
  border: 3px solid red;
}
.border-gray {
  border: 3px solid #ccc;
}
</style>
