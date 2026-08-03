<script setup>
import { ref } from 'vue'

const result1 = ref('')

function runTask1() {
  const members = ['김수원', '이서울', '박부산', '최대전']
  const rawData = { id: 101, grade: 'VIP', details: { score: 95 } }

  const memberContainsPark = members.includes('박부산')
  const {
    grade,
    details: { score },
  } = rawData

  result1.value = `부산 포함 여부: ${memberContainsPark} / 등급: ${grade} / 점수: ${score}점`
}
</script>

<template>
  <div class="quiz-container practice-section">
    <h3>과제 1. 데이터 추출 및 포맷팅 (p.247)</h3>
    <button @click="runTask1">과제 1 가동</button>
    <div class="console">결과창 1: {{ result1 }}</div>
  </div>
</template>
