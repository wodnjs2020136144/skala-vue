<script setup>
import { ref, computed } from 'vue'

const todos = ref([])
const text = ref('')
let nextId = 1

function addTodo() {
  if (text.value.trim() === '') return
  todos.value.push({ id: nextId++, title: text.value, done: false })
  text.value = ''
}

// 과제 1: 완료된 항목 모두 삭제
function clearCompleted() {
  todos.value = todos.value.filter((t) => !t.done)
}

const remaining = computed(() => todos.value.filter((t) => !t.done).length)

// 과제 2: 전체 개수 / 완료 개수
const totalCount = computed(() => todos.value.length)
const doneCount = computed(() => todos.value.filter((t) => t.done).length)
</script>

<template>
  <div class="practice-section">
    <h2>할 일 목록 (남은 일: {{ remaining }}개)</h2>
    <p>전체 {{ totalCount }}개 / 완료 {{ doneCount }}개</p>

    <input v-model="text" @keyup.enter="addTodo" placeholder="할 일을 입력하세요" />
    <button @click="addTodo">추가</button>
    <button @click="clearCompleted">완료된 항목 모두 삭제</button>

    <ul>
      <li v-for="todo in todos" :key="todo.id">
        <input type="checkbox" v-model="todo.done" />
        <span :class="{ done: todo.done }">{{ todo.title }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.done {
  text-decoration: line-through;
  color: gray;
}
</style>
