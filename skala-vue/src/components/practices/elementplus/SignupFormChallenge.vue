<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const userForm = ref({
  email: '',
  agree: false,
})

function handleRegister() {
  if (!userForm.value.email.includes('@')) {
    ElMessage.error('❌ 올바른 이메일 형식이 아닙니다.')
    return
  }
  if (!userForm.value.agree) {
    ElMessage.warning('⚠️ 이용약관에 동의하셔야 합니다.')
    return
  }
  ElMessage.success('🎉 가입 신청이 정상적으로 완료되었습니다!')
}
</script>

<template>
  <el-card class="practice-section">
    <template #header><h2>Element Plus — 회원가입 폼 (p.225)</h2></template>
    <el-input
      v-model="userForm.email"
      placeholder="이메일을 입력하세요"
      style="margin-bottom: 12px"
    />
    <el-switch v-model="userForm.agree" active-text="이용약관 동의" style="margin-bottom: 12px" />
    <br />
    <el-button type="primary" @click="handleRegister">회원가입</el-button>
  </el-card>
</template>
