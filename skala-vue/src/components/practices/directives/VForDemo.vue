<script setup>
import { ref } from 'vue'
const fruits = ref(['사과', '바나나', '포도'])
const user = ref({ name: '이순신', role: '장군' })
const items = ref([
  { id: 1, name: '노트북' },
  { id: 2, name: '키보드' },
  { id: 3, name: '마우스' },
])
</script>

<template>
  <div class="practice-section">
    <h2>v-for 디렉티브 학습</h2>

    <h3>1) 배열 렌더링</h3>
    <ul>
      <li v-for="(fruit, index) in fruits" :key="index">{{ index + 1 }}번 과일: {{ fruit }}</li>
    </ul>

    <h3>2) 객체 렌더링</h3>
    <ul>
      <li v-for="(value, key, index) in user" :key="key">[{{ index }}] {{ key }} : {{ value }}</li>
    </ul>

    <h3>3) 배열 내 객체 렌더링 (:key는 반드시 id 사용, 인덱스 금지)</h3>
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.id }}. {{ item.name }}</li>
    </ul>
  </div>
</template>
