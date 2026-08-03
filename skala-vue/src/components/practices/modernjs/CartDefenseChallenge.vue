<script setup>
import { ref } from 'vue'

const result2 = ref('')

function runTask2() {
  const currentCart = ['Apple', 'Banana']
  const newProduct = { name: 'Orange', stock: 0, preview: null }

  const updatedCart = [...currentCart, newProduct.name]
  const imgStatus = newProduct.preview?.url ?? '이미지 준비중'
  const finalStock = newProduct.stock ?? 0

  result2.value = `카트: ${updatedCart} / 이미지: ${imgStatus} / 수량: ${finalStock}개`
}
</script>

<template>
  <div class="quiz-container practice-section">
    <h3>과제 2. 불변성 복사 및 데이터 방어 (p.248)</h3>
    <button @click="runTask2">과제 2 가동</button>
    <div class="console">결과창 2: {{ result2 }}</div>
  </div>
</template>
