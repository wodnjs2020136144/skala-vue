# Vue.js 실습 기록 - Day 3

- 과정명: Full-Stack Engineering - Frontend-framework: Vue.js (강병호)
- 날짜: 2026-08-04
- 오늘 목표 (`docs/checklist.md` 3일차 기준): 4단계「Router·Pinia·Axios」
  - Router — 목록↔상세 라우팅, 지연 로딩, Catch-all Route
  - Pinia `configStore` — `state.unit` / `getters.unitSymbol`(℃·℉) / `actions.toggleUnit`
  - `UnitToggler.vue`를 Navigation Bar 옆에 배치, 메인·상세 양쪽 적용
  - 온도 변환은 `computed`로 — `Math.round((rawTemp * 9) / 5 + 32)`
  - Axios로 OpenWeatherMap 실제 데이터 교체 + 로딩·에러 처리
  - 오늘 작업분 커밋 & 푸시
  - (사전 준비) OpenWeatherMap API Key는 1일차에 미리 가입해뒀어야 함 — 아직이면 지금 발급 필요

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
