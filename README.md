# skala-vue — 픽셀 날씨 대시보드

Vue.js 강의 4일 과정의 종합과제 저장소입니다. 하루 단위로 새로 만든 게 아니라, **1일차 정적 Mockup을 3일에 걸쳐 이어서 발전시킨 하나의 결과물**입니다.

실제 프로젝트 코드는 [`skala-vue/`](./skala-vue) 폴더 안에 있습니다.

## 진행 과정 요약

| 일차 | 단계 | 내용 |
|---|---|---|
| 1일차 (7/31) | 날씨 Mockup | `v-for`/`v-if`로 도시별 날씨 카드 정적 렌더링, 검색창 양방향 바인딩 |
| 2일차 (8/3) | Composition API + 컴포넌트 분리 | `computed`/`watch`/`watchEffect`로 검색·필터링 반응형화, 4개 컴포넌트로 분리 |
| 3일차 (8/4) | Router · Pinia · Axios | 목록↔상세 라우팅, Pinia로 ℃/℉ 전역 상태 관리, OpenWeatherMap 실시간 API 연동 |
| 4일차 (8/5) | 마무리 + 부가 실습 | Element Plus, Modern JS 정리 + (부가) 픽셀 지도 페이지, 드래그 가능한 창, 미니게임 등 |

각 날짜의 상세 작업 기록(요구사항/사고 과정/트러블슈팅/결과)은 [`skala-vue/docs/reports/`](./skala-vue/docs/reports)에 있습니다.

## 주요 기능

- **날씨 목록/검색/상세**: 도시별 실시간 날씨를 카드로 보여주고, 검색으로 필터링, 클릭하면 상세 페이지로 이동
- **℃/℉ 단위 전환**: Pinia 전역 상태로 관리되어 목록·상세 어디서나 동일하게 반영
- **실시간 API 연동**: OpenWeatherMap API + Axios, 로딩/에러 상태 처리, API Key 없이도 볼 수 있는 데모 데이터 모드
- **레트로 LED 픽셀 컨셉의 날씨 지도**: 한반도를 도트 매트릭스로 표현한 인터랙티브 지도 — 커서를 따라가는 파동/눌림 효과, 클릭 시 폭발 이펙트, 드래그로 옮길 수 있는 정보창·게임창, 지도를 게임판으로 쓰는 "한반도 지역 찾기" 미니게임 포함

## 기술 스택

Vue 3 (Composition API, `<script setup>`) · Vite · Vue Router · Pinia · Axios · Element Plus

## 로컬에서 실행하기

```bash
cd skala-vue
npm install
cp .env.example .env   # VITE_OPENWEATHER_API_KEY에 OpenWeatherMap API Key 입력
npm run dev
```

API Key 없이 둘러보고 싶다면, 상단 내비게이션의 "데모 데이터 보기" 토글을 켜면 실제 API 호출 없이 더미 날씨 데이터로 모든 화면을 확인할 수 있습니다.

## 빌드

```bash
cd skala-vue
npm run build
```
