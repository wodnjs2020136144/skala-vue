<script setup>
defineProps({
  message: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['notify-parent'])
</script>

<template>
  <div class="child-box">
    <p>부모가 보낸 메시지: {{ message }}</p>
    <button @click="emit('notify-parent', '자식에서 보낸 이벤트!')">부모에게 알리기</button>
  </div>
</template>

<style scoped>
.child-box {
  padding: 12px;
  background: #f1f2f4;
  border-radius: 8px;
  margin-top: 8px;
}
</style>
