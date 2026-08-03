<script setup>
import { ref, reactive } from 'vue'

// ref: 원시/참조 타입 모두 반응형화
const count = ref(0)
const user = ref({ name: '이순신', age: 30 })

// reactive: 참조 자료형(객체) 전용, 통째 재할당 시 반응성 끊김 위험
let state = reactive({ count: 0 })

function increaseRef() {
  count.value++
}
function changeUserName() {
  user.value.name = user.value.name === '이순신' ? '장보고' : '이순신'
}
function increaseReactiveSafe() {
  state.count++ // 안전: 알맹이 속성만 변경
}
function breakReactiveUnsafe() {
  state = { count: 999 } // 위험: 통째 재할당하면 화면이 더 이상 갱신되지 않음
}
</script>

<template>
  <div class="practice-section">
    <h2>ref vs reactive 학습 (p.107)</h2>

    <h3>1) ref — 원시값도 감쌀 수 있음</h3>
    <p>count: {{ count }}</p>
    <button @click="increaseRef">count 증가</button>
    <p>user.name: {{ user.name }}</p>
    <button @click="changeUserName">이름 변경</button>

    <h3>2) reactive — 알맹이 속성만 변경해야 안전</h3>
    <p>state.count: {{ state.count }}</p>
    <button @click="increaseReactiveSafe">안전하게 증가 (state.count++)</button>
    <button @click="breakReactiveUnsafe">위험: 통째 재할당 (state = {...})</button>
    <p style="color: #9ba1a8; font-size: 13px">
      "위험" 버튼을 누르면 이후 어떤 버튼을 눌러도 위 숫자가 더 이상 바뀌지 않습니다 — reactive
      변수를 새 객체로 통째로 갈아끼우면 반응성 연결이 끊어지기 때문입니다.
    </p>
  </div>
</template>
