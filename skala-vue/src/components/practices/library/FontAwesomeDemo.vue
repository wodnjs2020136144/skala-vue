<script setup>
// FontAwesome 아이콘은 main.js에서 전역 등록(library.add + app.component)해두면
// 이 컴포넌트처럼 별도 import 없이 <FontAwesomeIcon icon="아이콘명" />으로 바로 쓸 수 있다.
</script>

<template>
  <div class="practice-section">
    <h2>Font Awesome 아이콘 학습</h2>

    <h3>1) 기본 사용법</h3>
    <p><FontAwesomeIcon icon="sun" /> 맑음</p>
    <p><FontAwesomeIcon icon="cloud" /> 흐림</p>
    <p><FontAwesomeIcon icon="cloud-rain" /> 비</p>
    <p><FontAwesomeIcon icon="fire" /> 더움</p>
    <p><FontAwesomeIcon icon="snowflake" /> 선선함/추움</p>

    <h3>2) 크기 · 색상 조절</h3>
    <p><FontAwesomeIcon icon="sun" size="2x" style="color: orange" /> size="2x" + 색상 지정</p>
    <p><FontAwesomeIcon icon="fire" size="lg" style="color: red" /> size="lg"</p>

    <h3>3) 텍스트와 나란히 (검색 아이콘 예시)</h3>
    <label>
      <FontAwesomeIcon icon="magnifying-glass" />
      <input placeholder="검색어를 입력하세요" style="margin-left: 6px" />
    </label>
  </div>
</template>
