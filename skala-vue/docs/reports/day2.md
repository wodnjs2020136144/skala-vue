# Vue.js 실습 기록 - Day 2

- 과정명: Full-Stack Engineering - Frontend-framework: Vue.js (강병호)
- 날짜: 2026-08-03
- 오늘 목표 (`docs/checklist.md` 2일차 기준): 2단계「컴포지션」+ 3단계「컴포넌트 분리」
  - 반응형 상태 3종 — `searchQuery`·`selectedCityInfo`·`weatherList`
  - `computed`로 `filteredWeatherList` (검색어 포함 필터링)
  - `watch(selectedCityInfo)`·`watchEffect(searchQuery)` 각각 콘솔 로그
  - 검색어 비면 원본 출력 / 일치하면 결과 출력
  - 기능은 유지한 채 4개 파일로 분리: `WeatherParent.vue`·`BaseDashboardCard.vue`(+slot)·`SearchBar.vue`·`WeatherCard.vue`
  - `SearchBar`는 props 수신 + `update-query` emit / `WeatherCard`는 `select-card`·`click-detail` emit
  - 오늘 작업분 커밋 & 푸시

> 이 문서는 실습 중 진행한 작업을 요구사항 → 사고 과정 → 해결 과정 → 트러블슈팅 → 결과 → 느낀점 순서로 기록합니다. 최종 종합 보고서는 [final-report.md](./final-report.md)를 참고하세요.

---

<!--
아래 형식을 복사해서 작업 단위마다 항목을 추가합니다.

## N. (작업 제목)

**요구사항**
-

**사고 과정**
-

**해결 과정**
1. (파일을 작성/수정하는 단계라면, 그 아래 파일 경로 + 코드 블록을 바로 넣는다)

#### 파일 경로
```vue

```

**트러블슈팅**
- 문제:
- 원인:
- 해결:
(문제가 없었다면 "없음"으로 기록)

**결과**
-

**느낀점**
-

---
-->
