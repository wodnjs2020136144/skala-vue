<script setup>
import { ref } from 'vue'
const score = ref(85)
const open = ref(true)
</script>

<template>
  <div class="practice-section">
    <h2>v-if / v-else-if / v-else / v-show 학습</h2>

    <h3>1) 점수 등급 분기 (v-if / v-else-if / v-else)</h3>
    <label>점수: <input type="number" v-model.number="score" /></label>
    <div v-if="score >= 90" style="color: green; font-weight: bold">합격 등급: A</div>
    <div v-else-if="score >= 80" style="color: blue">합격 등급: B</div>
    <div v-else-if="score >= 70" style="color: orange">합격 등급: C</div>
    <div v-else style="color: red; font-weight: bold">불합격</div>

    <h3>2) v-if vs v-show</h3>
    <button @click="open = !open">토글 (현재: {{ open }})</button>
    <p v-if="open">v-if 상자 — 조건이 거짓이면 DOM에서 완전히 사라짐</p>
    <p v-show="open">v-show 상자 — 숨겨져도 DOM에는 남아 있음 (display:none)</p>
  </div>
</template>
