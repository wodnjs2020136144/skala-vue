<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import guideRaw from '../../docs/vue-study-guide.md?raw'

// 저장소 안의 신뢰된 정적 문서를 파싱하는 것이라 사용자 입력이 섞이지 않으므로 sanitize 없이 v-html로 렌더링한다.
const html = computed(() => marked.parse(guideRaw))
</script>

<template>
  <div class="study-guide">
    <div class="study-guide__header">
      <h1 class="study-guide__title">스터디 가이드</h1>
    </div>

    <div class="study-guide__card">
      <div class="study-guide__body" v-html="html" />
    </div>
  </div>
</template>

<style scoped>
.study-guide {
  max-width: 760px;
  margin: 0 auto;
  padding: 28px 20px 60px;
}

.study-guide__header {
  margin-bottom: 20px;
}

.study-guide__title {
  margin: 0;
  font-family: var(--font-pixel-kr);
  font-size: 26px;
  color: var(--ink);
  letter-spacing: 0.05em;
}

/* 카드 배경(--paper)이 body 배경과 같은 색이라 그림자 하나만으로는 경계가 거의 안 보였다 —
   테두리를 더하고 그림자도 살짝 키웠다. */
.study-guide__card {
  background: var(--paper);
  border: 1px solid rgba(94, 107, 90, 0.25);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(20, 20, 30, 0.12);
}

.study-guide__body {
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.7;
  color: var(--ink);
}

/* v-html로 주입된 콘텐츠는 scoped 스타일이 안 먹으므로 :deep()으로 지정.
   h1/h2/h3가 각각 밑줄/글자색/무장식으로 서로 다른 축을 쓰던 걸, "좌측 amber 바"
   하나의 축으로 통일하고 두께·크기로만 위계를 구분한다. */
.study-guide__body :deep(h1),
.study-guide__body :deep(h2),
.study-guide__body :deep(h3) {
  font-family: var(--font-pixel-kr);
  color: var(--ink);
  letter-spacing: 0.04em;
  line-height: 1.4;
  border-left-style: solid;
  border-left-color: var(--amber);
}

.study-guide__body :deep(h1) {
  font-size: 21px;
  margin: 36px 0 16px;
  padding: 2px 0 2px 14px;
  border-left-width: 5px;
}

.study-guide__body :deep(h2) {
  font-size: 17px;
  margin: 32px 0 12px;
  padding: 1px 0 1px 11px;
  border-left-width: 3px;
}

.study-guide__body :deep(h3) {
  font-size: 14px;
  margin: 20px 0 8px;
  padding-left: 9px;
  border-left-width: 2px;
  border-left-color: var(--moss);
}

.study-guide__body :deep(p) {
  margin: 0 0 12px;
}

.study-guide__body :deep(ul),
.study-guide__body :deep(ol) {
  margin: 0 0 12px;
  padding-left: 22px;
}

.study-guide__body :deep(li) {
  margin: 4px 0;
}

.study-guide__body :deep(strong) {
  color: var(--ink);
  font-weight: 700;
}

.study-guide__body :deep(a) {
  color: var(--amber);
  overflow-wrap: anywhere;
}

.study-guide__body :deep(hr) {
  border: none;
  border-top: 1px dashed var(--moss);
  margin: 24px 0;
}

/* 원문의 "비유:" 등 부가 설명 인용구 — LED 패널 톤의 터미널 노트 박스 */
.study-guide__body :deep(blockquote) {
  margin: 16px 0;
  padding: 12px 16px;
  background: var(--panel);
  border-left: 4px solid var(--amber);
  border-radius: 4px;
  color: var(--dot-lit);
  font-size: 13px;
}

.study-guide__body :deep(blockquote p) {
  margin: 0;
}

.study-guide__body :deep(blockquote code) {
  color: var(--amber);
}

/* 표가 카드 폭보다 넓어지면 페이지 전체가 가로로 밀리던 문제 — 표 자체를 블록으로 감싸
   가로 스크롤을 표 안으로만 가두고, 카드는 항상 화면 폭 안에 머물게 한다. */
.study-guide__body :deep(table) {
  display: block;
  width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 13px;
}

.study-guide__body :deep(th) {
  background: var(--panel);
  color: var(--dot-lit);
  font-family: var(--font-pixel-kr);
  font-weight: 400;
  text-align: left;
  padding: 8px 10px;
  border: 1px solid var(--moss);
}

.study-guide__body :deep(td) {
  padding: 8px 10px;
  border: 1px solid var(--moss);
}

.study-guide__body :deep(tr:nth-child(even) td) {
  background: rgba(94, 107, 90, 0.08);
}

.study-guide__body :deep(code) {
  font-family: var(--font-mono);
  background: rgba(94, 107, 90, 0.15);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 13px;
  overflow-wrap: anywhere;
}

.study-guide__body :deep(pre) {
  background: var(--panel);
  color: var(--dot-lit);
  border-radius: 10px;
  padding: 14px 16px;
  overflow-x: auto;
  margin: 16px 0;
}

.study-guide__body :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

@media (max-width: 640px) {
  .study-guide__card {
    padding: 20px;
  }
}
</style>
