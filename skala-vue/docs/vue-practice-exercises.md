# Vue.js 실습 가이드 (Practice Exercises)

> 출처: `pdf/1) Full-stack Engineering_3.Frontend-framework_Vue.js_강병호_0729-1-158.pdf` (1~4장, 158페이지) — 이론 원전 교재
>
> 이 문서는 위 158p 교재 안의 `[실습]`과 `Code Challenge` 항목만 분리 정리한 자료입니다. 이론 설명은 [vue-study-guide.md](./vue-study-guide.md)를 참고하세요.
>
> ⚠️ **실제 진행/제출 기준은 `pdf/day{N}.pdf`(그날의 공식 실습 강의안)입니다.** 158p 교재는 실습의 배경 이론과 원본 문제를 제공하지만, 매일 제공되는 `day{N}.pdf`가 그날 다뤄야 할 정확한 범위·데이터·요구사항을 규정하며 이 둘이 다를 경우 `day{N}.pdf`를 따릅니다. 아래 "Day별 공식 실습" 섹션에서 이 둘을 구분해 반영합니다.
>
> 5장(Vue Router) 이후 실습 자료가 추가되면 이 문서에 이어서 추가합니다.

## 핵심 연속 프로젝트: "날씨(Weather)" 실습

이 강의의 실습은 하나의 **날씨 대시보드 앱**을 장이 진행될수록 점진적으로 발전시키는 방식으로 구성되어 있습니다.

| 단계 | 장 | 페이지 | 발전 내용 |
|---|---|---|---|
| 1단계 | 2장 (Vue 문법) | p.98 | 정적 Mockup — v-for/v-if/v-model만으로 화면 구성 |
| 2단계 | 3장 (Composition API) | p.126 | computed/watch/watchEffect로 필터링·감시 로직 추가 |
| 3단계 | 4장 (Vue Component) | p.158 | 4개 컴포넌트로 분리, Props/Emit/Slot 적용 |

실습을 진행할 때는 이전 단계에서 작성한 코드를 다음 단계에서 계속 확장/리팩토링하는 흐름임을 유의합니다.

---

## 2장. Vue 문법 실습

### Code Challenge — Vue Directive (p.75)
`v-html`(및 XSS 위험), `v-text`, `v-bind`(기본/축약형/클래스 바인딩/스타일 바인딩), `v-if`/`v-else-if`/`v-else`/`v-show`, `v-for`, `v-pre`/`v-cloak`/`v-once`/`v-memo`를 각각 연습하는 종합 챌린지.

### Code Challenge — Vue Event Handling (p.87)
`v-on` 이벤트 핸들러(Inline vs Method), Event Object(`e.target`, 좌표, 키보드 속성), Event Modifier(`.prevent`, `.stop`, `.once` 등) 종합 연습.

### Code Challenge — Vue Form / Style (p.97)
`v-model` 양방향 바인딩, 폼 요소별 변수 선언 규칙(textarea/checkbox/radio/select), `v-model` Modifiers(`.lazy`/`.number`/`.trim`), Scoped/External Style 종합 연습.

### [실습] 과제 — 날씨 Mockup (p.98, 교재 원본 요구사항)

**요구사항**
- `weatherList` 배열을 `v-for`와 `:key`로 카드 목록 렌더링
- 기온이 25도 이상/미만인지에 따라 `v-if`로 조건부 라벨(예: "더움"/"선선함") 표시
- 도시명을 한글로 검색하는 입력창을 `v-model`로 구현 (검색어와 도시명을 문자열 매칭)
- 카드를 클릭하면 상태 갱신, 카드 내부의 [상세보기] 버튼 클릭 시:
  - 이벤트 버블링이 부모 카드 클릭까지 전파되지 않도록 처리(`@click.stop` 등)
  - `window.alert()`로 상세 정보 표시

**제공 데이터/함수 형태**
```js
const weatherList = ref([
  { id: 1, name: '서울', temp: 28, status: '맑음' },
  // ...
])

function showDetail(cityName, status) {
  window.alert(`${cityName}: ${status}`)
}
```

> ℹ️ 위는 158p 교재 원본 기준이며, 아래 "Day 1 공식 실습(`day1.pdf`)" 스펙과 데이터/구현 방식이 다릅니다. **실제 제출은 `day1.pdf` 스펙을 따릅니다.** 상세보기+alert 요구사항은 `day1.pdf`의 1단계 범위에는 포함되어 있지 않으므로, 이후 단계(day2 이후)에서 요구될 수 있는 확장 기능으로 봐 둡니다.

---

## Day 1 공식 실습 (`pdf/day1.pdf` 기준) — 실제 진행/제출 스펙

> 출처: `pdf/day1.pdf` (DreamIT Biz 실습 강의안, 2026-07-31, 09:00~18:00, 8교시)
>
> ⚠️ **[정정] 실제 제출 방식은 본인 GitHub 계정에 Public 저장소(`skala-vue`)를 생성해 제출하는 것이다.** (한때 "Slack PDF 제출"로 잘못 판단했으나, `docs/checklist.md` 확인 결과 GitHub Public 저장소 제출이 맞는 것으로 정정됨) 아래 "정본 저장소 Fork/Clone" 문구는 참고용이며, 실제로는 본인 저장소(`skala-vue`)를 직접 만들어 커밋/푸시하면 된다. 최신 제출 기준은 [checklist.md](./checklist.md) 참고.

### 종합과제 1단계 — 날씨 Mockup (`day1.pdf` 스펙, 이것이 실제 제출 기준)

**요구사항**
1. 본인 GitHub 계정에 Public 저장소 `skala-vue`를 생성한다 (정본 `bottletiger/skala-vue`를 Fork/Clone해도 되고, 직접 새 저장소를 만들어 커밋해도 된다). 시크릿 창으로 로그인 없이 소스가 보이는지 확인한다.
2. 아래 정확한 데이터로 `weatherList`를 선언한다:
   ```js
   const weatherList = ref([
     { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
     { id: 'city_02', name: '수원', temp: 24, status: '비' },
     { id: 'city_03', name: '부산', temp: 26, status: '구름' },
   ])
   ```
3. `v-for`로 날씨 카드를 반복 출력하고, `:key`는 **반드시 `id`를 사용** (인덱스 사용 금지).
4. `v-if`로 라벨을 붙인다: 25도 이상이면 **"🔥 더움 (25도 이상)"**, 25도 미만이면 **"❄ 선선함 (25도 미만)"**.
5. 검색 입력을 **`:value`와 `@input`으로 양방향 처리**한다 (`v-model`이 아니라 수동 바인딩으로 구현). 한글 입력(IME 조합)이 깨지지 않는지 직접 타이핑해서 확인한다.
6. 여기까지가 Day 1 결과물 — **commit 하고 push**한다.

**산출물**: 날씨 카드 목록이 반복 출력되고, 기온에 따라 라벨이 갈리며, 검색어 입력이 한글로도 정상 동작하는 화면.

> 교재 2장 실습(위 섹션)에 있던 "카드 클릭 → 상세보기 버튼 → `window.alert`" 기능은 이 단계 요구사항에는 없다. 검색도 `v-model` 대신 `:value`+`@input` 수동 구현이 명시적으로 요구된다는 점에 유의.

### 추가 실습 (Lab) — 채점 대상 아님, 개념 체감용 스크래치 실습

- **Lab 1. 첫 Vue 프로젝트 띄우기**: `npm create vite@latest hello -- --template vue` → `cd hello && npm install && npm run dev` → `localhost:5173` 확인 → `App.vue`의 `<template>` 텍스트를 바꿔 HMR 체감.
- **Lab 2. 반응형 이름 인사 만들기**: `App.vue`에 `const name = ref('')` 선언, `<input v-model="name">` + `<p>안녕하세요, {{ name }} 님</p>`으로 실시간 반영 확인.
- **Lab 3. Vue Devtools로 반응형 상태 들여다보기**: Vue Devtools 확장 설치 → Components 탭에서 입력할 때마다 상태가 트리에서 바뀌는 것 관찰.

### 8교시 종합실습 — 반응형 UI: 카운터 & 할 일 목록 (날씨 프로젝트와 별개)

`ref`, `v-model`, `v-for`, `computed`를 종합한 Todo 리스트 앱을 만든다.

```js
import { ref, computed } from 'vue'
const todos = ref([])
const text = ref('')
let nextId = 1

function addTodo() {
  if (text.value.trim() === '') return
  todos.value.push({ id: nextId++, title: text.value, done: false })
  text.value = ''
}

const remaining = computed(() => todos.value.filter(t => !t.done).length)
```
```html
<input v-model="text" @keyup.enter="addTodo" placeholder="할 일을 입력하세요" />
<button @click="addTodo">추가</button>
<ul>
  <li v-for="todo in todos" :key="todo.id">
    <input type="checkbox" v-model="todo.done" />
    <span :class="{ done: todo.done }">{{ todo.title }}</span>
  </li>
</ul>
```

### 📝 과제 (홈워크 — 스크린샷 캡처 제출)

1. 위 할 일 목록에 **"완료된 항목 모두 삭제"** 버튼을 추가하고, 클릭 시 `done`이 `true`인 항목만 배열에서 제거되도록 구현 → 캡처 제출.
2. `computed`를 하나 더 만들어 **"전체 개수 / 완료 개수"**를 화면에 함께 표시.
3. 교재 2장 과제(p.91, 위 "날씨 Mockup" 섹션과 동일) — 위 "종합과제 1단계" 항목과 같은 내용.

---

## 3장. Composition API 실습

### Code Challenge — Reactive State (p.107)
`ref()`와 `reactive()`를 이용한 반응형 변수 선언 연습, 반응성 단절 사례(객체 통째 재할당) 확인.

### Code Challenge — Computed & Watchers (p.125)
`computed`, `watch`(단일/멀티소스/deep), `reactive` 데이터 watch, `watchEffect` 종합 연습.

### [실습] 과제 — 날씨 (컴포지션 API 적용) (p.126)

2단계 요구사항 (1단계 Mockup을 Composition API로 리팩토링):

- 상태 정의: `searchQuery`(검색어), `selectedCityInfo`(선택된 도시), `weatherList`(전체 목록)을 반응형으로 선언
- `computed`로 `filteredWeatherList` 계산 — `searchQuery`에 따라 `weatherList`를 필터링
- `watch`로 `selectedCityInfo`의 변경을 감시하여 콘솔에 로그 출력
- `watchEffect`로 `searchQuery`의 변경을 자동 감지하여 콘솔에 로그 출력
- 화면은 검색 결과에 따라 3가지 상태를 분기 렌더링:
  1. 검색어가 비어있을 때 (전체 목록 표시)
  2. 검색 결과가 있을 때 (필터링된 목록 표시)
  3. 검색 결과가 없을 때 (안내 메시지 표시)

```js
const searchQuery = ref('')
const selectedCityInfo = ref(null)
const weatherList = ref([ /* ...1단계와 동일한 데이터... */ ])

const filteredWeatherList = computed(() =>
  weatherList.value.filter(city => city.name.includes(searchQuery.value))
)

watch(selectedCityInfo, (newVal) => {
  console.log('선택된 도시:', newVal)
})

watchEffect(() => {
  console.log('검색어 변경:', searchQuery.value)
})
```

---

## 4장. Vue Component 실습

### Code Challenge — Component Lifecycle (p.136)
`onMounted`에서 타이머 시작, `onUpdated` 로그, `onUnmounted`에서 `clearInterval`로 정리하는 Lifecycle Hook 연습.

### Code Challenge — Props & Emits (p.152)
`defineProps`(배열형/객체형, 타입 검증), `defineEmits`를 이용한 부모-자식 통신 종합 연습.

### Code Challenge — Component Slot (p.157)
Default/Named/Scoped Slot 3종 연습.

### [실습] 과제 — 날씨 (컴포넌트 분리) (p.158, 최종 실습)

3단계 요구사항 (2단계 로직을 4개 컴포넌트로 분리):

| 컴포넌트 | 역할 |
|---|---|
| `WeatherParent.vue` | 반응형 상태(`searchQuery`, `selectedCityInfo`, `weatherList`, `filteredWeatherList`)를 계속 보유하는 최상위 컴포넌트 |
| `BaseDashboardCard.vue` | 검색박스/리스트박스의 공통 디자인 레이아웃을 **Slot**으로 제공하는 재사용 컨테이너 |
| `SearchBar.vue` | 검색어 입력 UI. `props`로 현재 검색어를 받고, 입력 시 `update-query` 이벤트를 `emit` |
| `WeatherCard.vue` | 도시 정보 카드 UI. `props`로 도시 객체를 받고, 카드 클릭 시 `select-card`, 상세보기 클릭 시 `click-detail` 이벤트를 `emit` |

**구현 포인트**
- `SearchBar`와 `WeatherCard`는 `BaseDashboardCard`의 Slot을 통해 화면에 배치되지만, 이 Slot 콘텐츠의 스크립트 스코프(변수·함수)는 여전히 **부모인 `WeatherParent`에 소속**된다는 점이 핵심 학습 포인트
- 각 컴포넌트는 `<style scoped>`로 스타일을 분리
- `WeatherParent`가 `SearchBar`의 `update-query` 이벤트를 받아 `searchQuery`를 갱신 → `computed`로 필터링된 목록이 `WeatherCard` 목록에 반영되는 흐름을 컴포넌트 간 통신으로 재구성

```html
<!-- WeatherParent.vue (개념적 구조) -->
<BaseDashboardCard>
  <template #search>
    <SearchBar :query="searchQuery" @update-query="searchQuery = $event" />
  </template>
  <template #list>
    <WeatherCard
      v-for="city in filteredWeatherList"
      :key="city.id"
      :city="city"
      @select-card="selectedCityInfo = city"
      @click-detail="showDetail(city.name, city.status)"
    />
  </template>
</BaseDashboardCard>
```

---

## 부가 실습 (공식 커리큘럼 외) — Font Awesome 아이콘 적용

공식 8장(UI 라이브러리) 커리큘럼과 별개로, 사용자 요청에 따라 미리 도입. 자세한 설치/사용법은 [vue-study-guide.md의 "부가 학습: UI 라이브러리 — Font Awesome"](./vue-study-guide.md#부가-학습-ui-라이브러리--font-awesome) 참고.

- `FontAwesomeDemo.vue`: 기본 사용법(아이콘 종류/크기/색상) 데모
- `WeatherMockup.vue`의 온도 라벨 이모지(🔥/❄)를 `<FontAwesomeIcon icon="fire"/snowflake" />`로 교체
