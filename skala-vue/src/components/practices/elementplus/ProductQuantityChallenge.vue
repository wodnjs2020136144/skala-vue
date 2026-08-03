<script setup>
import { ref } from 'vue'

const productQuantity = ref(1) // 수량 카운터 기본값
const productRate = ref(4) // 별점 기본값 (별 4개)
</script>

<template>
  <el-card class="practice-section">
    <template #header><h2>Element Plus — 구매 수량 &amp; 별점 (p.226)</h2></template>
    <p>구매 수량</p>
    <el-input-number v-model="productQuantity" :min="1" :max="99" />
    <p style="margin-top: 12px">평점</p>
    <el-rate v-model="productRate" />
  </el-card>
</template>
