<script setup>
import { ref } from 'vue'
import axios from 'axios'

const BASE_URL = 'https://jsonplaceholder.typicode.com/posts'
const items = ref([])
const textInput = ref('')
const statusLog = ref('')

async function handleRead() {
  try {
    const response = await axios.get(BASE_URL, { params: { _limit: 3 } })
    items.value = response.data
    statusLog.value = 'GET 성공'
  } catch (error) {
    statusLog.value = 'GET 실패'
    console.error(error)
  }
}

async function handleCreate() {
  if (!textInput.value.trim()) return
  try {
    const response = await axios.post(BASE_URL, { title: textInput.value, body: '', userId: 1 })
    items.value = [response.data, ...items.value]
    statusLog.value = `CREATE 성공 (id: ${response.data.id})`
    textInput.value = ''
  } catch (error) {
    statusLog.value = 'CREATE 실패'
    console.error(error)
  }
}

async function handleUpdate(item) {
  try {
    const response = await axios.put(`${BASE_URL}/${item.id}`, {
      ...item,
      title: item.title + ' (수정됨)',
    })
    item.title = response.data.title
    statusLog.value = `UPDATE 성공 (id: ${item.id})`
  } catch (error) {
    statusLog.value = 'UPDATE 실패'
    console.error(error)
  }
}

async function handleDelete(item) {
  try {
    await axios.delete(`${BASE_URL}/${item.id}`)
    items.value = items.value.filter((i) => i.id !== item.id)
    statusLog.value = `DELETE 성공 (id: ${item.id})`
  } catch (error) {
    statusLog.value = 'DELETE 실패'
    console.error(error)
  }
}
</script>

<template>
  <div class="practice-section">
    <h2>Axios JSONPlaceholder CRUD 학습 (p.207)</h2>
    <button @click="handleRead">GET (조회)</button>
    <p>{{ statusLog }}</p>
    <input v-model="textInput" placeholder="새 게시글 제목" />
    <button @click="handleCreate">POST (생성)</button>
    <ul>
      <li v-for="item in items" :key="item.id">
        {{ item.id }}. {{ item.title }}
        <button @click="handleUpdate(item)">수정</button>
        <button @click="handleDelete(item)">삭제</button>
      </li>
    </ul>
  </div>
</template>
