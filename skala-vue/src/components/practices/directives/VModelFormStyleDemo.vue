<script setup>
import { ref } from 'vue'

// 1) v-model 기본 & Modifiers
const textValue = ref('')
const lazyText = ref('')
const numberValue = ref(0)
const trimText = ref('')

// 2) 폼 요소별 v-model
const agree = ref(false)
const fruits = ref([])
const gender = ref('')
const city = ref('seoul')
</script>

<template>
  <div class="practice-section">
    <h2>Form 바인딩(v-model) & Style 학습</h2>

    <h3>1) v-model 기본 & Modifiers</h3>
    <input v-model="textValue" placeholder="일반 v-model" />
    <p>값: {{ textValue }}</p>

    <input v-model.lazy="lazyText" placeholder=".lazy (change 시점에 반영)" />
    <p>값: {{ lazyText }}</p>

    <input v-model.number="numberValue" placeholder=".number (문자열→숫자 변환)" />
    <p>값: {{ numberValue }} / 타입: {{ typeof numberValue }}</p>

    <input v-model.trim="trimText" placeholder=".trim (앞뒤 공백 제거)" />
    <p>값: "{{ trimText }}"</p>

    <h3>2) 폼 요소별 v-model</h3>
    <label><input type="checkbox" v-model="agree" /> 약관 동의</label>
    <br />
    <label><input type="checkbox" value="사과" v-model="fruits" /> 사과</label>
    <label><input type="checkbox" value="바나나" v-model="fruits" /> 바나나</label>
    <br />
    <label><input type="radio" value="남" v-model="gender" /> 남</label>
    <label><input type="radio" value="여" v-model="gender" /> 여</label>
    <br />
    <select v-model="city">
      <option value="seoul">서울</option>
      <option value="busan">부산</option>
    </select>
    <p>동의: {{ agree }} / 과일: {{ fruits }} / 성별: {{ gender }} / 도시: {{ city }}</p>

    <h3>3) Style (scoped)</h3>
    <p class="highlight">이 텍스트는 scoped 스타일이 적용된 컴포넌트입니다.</p>
  </div>
</template>

<style scoped>
.highlight {
  color: white;
  background-color: #42b883;
  padding: 8px;
  border-radius: 4px;
  display: inline-block;
}
</style>
