<script setup>
import { onUnmounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const downloadProgress = ref(0)
const isDownloading = ref(false)
let downloadIntervalId = null

onUnmounted(() => clearInterval(downloadIntervalId))

function confirmDelete() {
  // 교재 원본은 type: 'danger'였으나 ElMessageBox가 지원하는 타입이 아니라 'warning'으로 수정
  ElMessageBox.confirm('서버에서 해당 파일을 영구히 삭제하시겠습니까?', '🔥 최종 경고', {
    confirmButtonText: '네, 삭제합니다',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(() => {
      ElMessage.success('🗑️ 파일이 안전하게 파쇄되었습니다.')
    })
    .catch(() => {
      ElMessage.info('❌ 삭제 작업이 취소되었습니다.')
    })
}

function startDownload() {
  if (isDownloading.value) return
  isDownloading.value = true
  downloadProgress.value = 0
  downloadIntervalId = setInterval(() => {
    downloadProgress.value += 20
    if (downloadProgress.value >= 100) {
      clearInterval(downloadIntervalId)
      isDownloading.value = false
      ElMessage.success('💾 대용량 데이터 로드가 완료되었습니다!')
    }
  }, 400)
}
</script>

<template>
  <el-card class="practice-section">
    <template #header><h2>Element Plus — 삭제 확인 &amp; 다운로드 진행률 (p.227)</h2></template>
    <el-button type="danger" @click="confirmDelete">파일 삭제</el-button>
    <el-button
      type="primary"
      @click="startDownload"
      :disabled="isDownloading"
      style="margin-left: 8px"
    >
      다운로드 시작
    </el-button>
    <el-progress :percentage="downloadProgress" style="margin-top: 16px" />
  </el-card>
</template>
