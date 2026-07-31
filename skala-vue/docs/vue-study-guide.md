# Vue.js 강의 학습 가이드

> 출처: `pdf/1) Full-stack Engineering_3.Frontend-framework_Vue.js_강병호_0729-1-158.pdf` (158페이지)
>
> 이 PDF는 전체 10개 챕터 커리큘럼 중 **1~4장까지만** 담고 있습니다. 5장(Vue Router) 이후 자료가 추가로 제공되면 이 문서도 이어서 갱신합니다.
>
> 전체 커리큘럼: 1.Vue.js 시작하기 · 2.Vue 문법 · 3.Composition API · 4.Vue Component · 5.Vue Router · 6.Pinia · 7.Axios · 8.UI 라이브러리 · 9.Modern JavaScript · 10.Vite 빌드 및 실무 배포
>
> 실습(`[실습]`, `Code Challenge`) 관련 내용은 이 문서에 포함하지 않았습니다. → [vue-practice-exercises.md](./vue-practice-exercises.md) 참고
>
> 이 문서는 158p 이론 교재를 기반으로 하되, 매일 제공되는 `pdf/day{N}.pdf`(공식 실습 강의안)의 심화 설명·비유·실무 팁을 함께 반영합니다. (`day1.pdf` 반영분: MVVM/Virtual DOM 비유, v-if vs v-show 실무 기준, toRefs, watch 디바운스 패턴, reactive 재할당 위험 강조)

---

## 1장. Vue.js 시작하기

### Vue.js 개요
- Vue.js는 Front-end JavaScript Framework. React/Angular와 비교해 더 가볍고 배우기 쉬움.
- Vue 2 코어는 JavaScript, Vue 3 코어는 100% TypeScript로 재작성됨. 단, 개발자는 프로젝트에서 JS/TS 중 자유롭게 선택 가능.
- 역사: 2014년 Evan You 개발 → 2015년 1.0 → 2016년 2.0(Virtual DOM) → 2020년 3.0(Composition API, TS 지원) → 2023년 Vite 연계 표준화.
- **왜 Vue 같은 프레임워크를 쓰나?** 옛날 방식은 화면 글자 하나를 바꾸려면 `document.getElementById`로 요소를 찾아 직접 갈아 끼워야 했고, 데이터가 많아지면 "어디를 바꿔야 하는지" 챙기는 일이 복잡해진다. Vue는 이를 대신 해준다 — 개발자는 그냥 "데이터"만 바꾸면 Vue가 그 데이터를 쓰는 화면을 알아서 다시 그려준다. 마치 엑셀에서 셀 값을 바꾸면 그 셀을 참조하는 합계가 자동으로 바뀌는 것과 같다. (`day1.pdf`)

### MVVM 아키텍처
Vue.js는 Model-View-ViewModel 패턴을 따른다.
- **Model**: `<script>` 내부의 순수 데이터(ref/reactive 원본) 또는 백엔드 API 데이터.
- **View**: 사용자에게 보이는 화면(`<template>`, `<style>`).
- **ViewModel**: View와 Model을 중개하는 Vue 엔진 + `<script>`. DOM 이벤트 감지와 데이터 바인딩을 수행.

> 비유: 식당에서 주방(Model)과 손님 테이블(View) 사이를 오가는 종업원(ViewModel)과 같다 — 주방 음식이 바뀌면 테이블에 새로 내오고, 손님 주문이 바뀌면 주방에 전달한다. (`day1.pdf`)

### Frontend Framework 3대장 비교

| 항목 | Vue.js | React | Angular |
|---|---|---|---|
| 출시연도 | 2014 | 2013 | 2010 |
| 개발 | Evan You (커뮤니티) | Meta | Google |
| 기술분류 | 점진적 프레임워크 | UI 라이브러리 | 풀스택 프레임워크 |
| 학습 곡선 | 낮음 | 중간 | 높음 |
| 크기 | 약 33KB | 약 42KB | 약 500KB |
| 데이터 바인딩 | 양방향 (v-model) | 단방향 | 양방향 |

### 핵심 특징
- **Virtual DOM**: 실제 DOM 조작(Reflow/Repaint 비용)을 줄이기 위한 메모리상의 가짜 DOM. 상태 변화를 배치 처리하여 한 이벤트 사이클에 단 한 번만 실제 DOM에 반영. (3,000개 노드 중 1개만 바뀌어도 통째로 다시 그리면 부하가 크다 — 학급 게시판을 통째로 새로 만드는 대신 바뀐 종이 한 장만 떼어 붙이는 것과 같다. `day1.pdf`)
- **양방향 데이터 바인딩**: Model이 바뀌면 View가, View(입력)가 바뀌면 Model도 동시에 변경. 주로 `v-model`로 구현.
- **컴포넌트 기반**: 독립 UI 부품(.vue)에 HTML/JS/CSS를 응집(Encapsulation), 재사용(Reusability), 부모-자식 트리 구조(Props Down, Emit Up).

### 렌더링 방식
- **CSR (Client-Side Rendering)**: 브라우저가 JS를 실행해 화면을 그림. Vue.js 기본 동작 방식.
- **SSR (Server-Side Rendering)**: 서버에서 완성된 HTML을 내려줌. Vue 생태계에서는 Nuxt.js로 구현.
- **SPA vs MPA**:

| 구분 | MPA | SPA |
|---|---|---|
| 페이지 구성 | 요청마다 새 HTML | 최초 1개 HTML + JS |
| 페이지 전환 | 서버 요청 → 새로고침 | JS로 부분 렌더링 |
| SEO | 유리 | 불리 (보완 가능) |
| 기술 스택 예시 | JSP, PHP, Spring MVC | Vue.js, React + REST API |

- SPA 추가 기술 요소: **Vite**(빌드 도구), **Vue Router**(URL-컴포넌트 연결), **Pinia**(전역 상태 저장소), **Axios**(백엔드 통신).

### 개발 환경 구성
- Windows: WSL2 + Ubuntu 설치(`wsl --install`) → Node.js는 fnm으로 설치.
- macOS: Homebrew 설치 → `brew install node`.
- VS Code 확장: **Vue (Official)**, **ESLint**, **Prettier**(WSL 사용 시 **WSL** 확장 추가).
- Chrome 확장: **Vue Devtools** (Component Tree, Emit 추적, Pinia 모니터링).
- Node.js의 역할: Vite 실행 엔진, npm 패키지 관리, HMR 지원 로컬 개발 서버(`localhost:5173`) 구동.

### 프로젝트 생성 (`npm create vue@latest`)
생성 시 선택 옵션: TypeScript(No), JSX(No), Vue Router(Yes), Pinia(Yes), Vitest(No), E2E(No), ESLint(Yes), Prettier(Yes).

```
npm create vue@latest
cd skala-vue
npm install
npm run format
npm run dev
```

### 프로젝트 구조

| 폴더/파일 | 역할 |
|---|---|
| `index.html` | 진입점(entry point), `<div id="app">`에 Vue가 렌더링 |
| `package.json` | 메타정보, scripts, 의존성 목록 |
| `vite.config.js` | Vite 빌드 엔진 전역 설정 |
| `public/` | 컴파일 없이 그대로 제공되는 정적 자원 |
| `src/main.js` | 앱 초기화 진입점 (`createApp`, Pinia/Router 등록, `mount`) |
| `src/App.vue` | 루트 컴포넌트 |
| `src/assets/` | 컴파일이 필요한 CSS/이미지/폰트 |
| `src/components/` | 재사용 가능한 작은 컴포넌트 |
| `src/router/` | SPA 라우팅 정의 |
| `src/stores/` | Pinia 전역 상태 저장소 |
| `src/views/` | 컴포넌트를 조립한 페이지 단위 화면 |

**main.js 핵심 동작**: `main.css` 로드 → `createApp(App)`로 앱 인스턴스 생성(App.vue가 루트 컴포넌트) → Pinia/Router 등록 → `.mount('#app')`로 실제 DOM에 부착.

**Frontend Project Tools 분류**

| 유형 | 역할 | 예시 |
|---|---|---|
| Packager | 의존성 관리 | npm, yarn, pnpm |
| Compiler | 언어 변환 | Babel, TypeScript |
| Bundler | 모듈 번들링 | Vite, Webpack, Rollup |
| Build Tool | 컴파일+번들링+최적화 전체 | Vite, Webpack |

**주요 npm 명령어**: `npm create vue@latest`(프로젝트 생성) · `npm install`(의존성 설치) · `npm install 패키지명`(패키지 추가) · `npm uninstall 패키지명`(제거) · `npm run dev`(개발 서버, Vite) · `npm run build`(Rollup으로 tree-shaking 후 `dist/` 생성).

> 참고로 Vue-CLI + Webpack은 Vite 이전 기술로 더 이상 사용하지 않는다.

---

## 2장. Vue 문법

### SFC (Single File Component)
`.vue` 파일 하나가 아래 3단 구조를 가짐(Vue 3 트렌드는 `<script setup>`을 최상단에 배치):

| 영역 | 역할 |
|---|---|
| `<script setup>` | 데이터·함수 등 로직 |
| `<template>` | HTML 구조 |
| `<style>` | CSS (보통 `scoped`) |

파일명은 두 단어 이상 조합의 **PascalCase** 권장.

### Options API vs Composition API

| 항목 | Options API (Vue 2) | Composition API (Vue 3 표준) |
|---|---|---|
| 선언 구조 | `<script>` | `<script setup>` |
| 작성 철학 | 역할별 격리(data/methods/computed) | 기능별 그룹화 |
| 반응성 변수 | `data()` 반환 객체 | `ref()` / `reactive()` |
| 코드 재사용 | Mixin(이름 충돌 위험) | Composable 함수 |
| TypeScript | 결합 어려움 | 완벽 호환 |
| 공식 권장 | 레거시 유지보수만 | 신규 표준 |

```js
// Composition API 예시
import { ref } from 'vue'
const count = ref(0)
const increment = () => { count.value++ }
```

### Text Interpolation & Directive
- **Interpolation**: `{{ 변수명 }}` — JS 값을 문자열로 투사.
- **Directive**: `v-`로 시작하는 특수 속성(`v-bind`, `v-if`, `v-for`, `v-on` 등). 따옴표 내부는 JS 표현식이 작동하는 공간.

### 전체 Directive 요약

| Directive | 설명 | 비고 |
|---|---|---|
| `v-html` | 표현식 값을 HTML로 렌더링 | XSS 위험 |
| `v-text` | 텍스트로 렌더링(`innerText`와 동일) | Interpolation과 유사 |
| `v-bind` | 속성에 값을 동적 바인딩 | 축약형 `:` |
| `v-model` | 폼 요소 양방향 바인딩 | |
| `v-if`/`v-else-if`/`v-else` | 조건부 렌더링(DOM 생성/제거) | |
| `v-show` | 조건부 표시(`display:none` 토글) | v-if보다 토글 비용 저렴 |
| `v-for` | 반복 렌더링 | `:key` 필수 |
| `v-on` | 이벤트 리스너 등록 | 축약형 `@` |
| `v-pre` | 템플릿 컴파일 생략, 원본 그대로 출력 | |
| `v-cloak` | 바인딩 완료 전 `{{ }}` 노출 방지 | `[v-cloak]{display:none}` CSS 필요 |
| `v-once` | 최초 1회만 렌더링 | 메모리 절약 |
| `v-memo` | 지정 변수가 바뀔 때만 재렌더링 | `v-memo="[a, b]"` |

**v-html의 XSS 위험**: 사용자 입력을 그대로 `v-html`에 넣으면 `<img src=x onerror="...">` 같은 악성 스크립트가 실행될 수 있음. 신뢰할 수 없는 입력에는 사용 금지.

**v-if vs v-show**: v-if는 조건이 false면 DOM 자체를 제거/생성(초기 렌더링 비용 낮음, 토글 비용 높음), v-show는 항상 DOM을 유지하고 CSS만 토글(초기 비용 높음, 토글 비용 낮음). v-show는 `v-else`와 조합할 수 없다는 점도 유의.
> 실무 선택 기준: 전환이 잦은 곳(모달, 탭)은 **v-show**, 전환이 드문 곳(로그인 후 화면 전환 등)은 **v-if**. (`day1.pdf`)

**v-bind 동일이름 축약 (Vue 3.4+)**: `:src="src"` → `:src`로 축약 가능.

**v-bind 클래스/스타일 바인딩**:
```js
// Class Binding — 객체/배열 형식
const isWarning = ref(false)
```
```html
<p :class="{ 'text-danger': isWarning }">경고: {{ isWarning }}</p>
<div :class="[themeClass, isWarning ? 'border-red' : 'border-gray']">...</div>
```
```html
<!-- Style Binding — camelCase 속성명 권장 -->
<p :style="{ color: activeColor, fontSize: fontSize + 'px' }">텍스트</p>
<div :style="[baseStyle, borderStyle]">상자</div>
```

| 구분 | 클래스 바인딩(`:class`) | 스타일 바인딩(`:style`) |
|---|---|---|
| 대상 | `class` 속성에 문자열 주입 | 인라인 `style`에 값 주입 |
| 용도 | 디자인 상태 전환(활성/비활성 등) | 수치·색상 실시간 미세 조정 |
| 속성명 표기 | CSS 클래스명 그대로 | camelCase 권장 |

### 이벤트 처리 (v-on)
- 축약형 `@click` 100% 사용. 주요 이벤트: click, submit, keyup/keydown, input, change, mouseenter/leave.
- **Inline Handler**(`@click="count++"`) vs **Method Handler**(`@click="increment"`, 함수 참조 전달).
- **Event Object**: `e.target`/`e.currentTarget`/`e.type`/`e.timeStamp`, 마우스(`clientX/Y`, `pageX/Y`), 키보드(`e.key`, `shiftKey`, `ctrlKey`), `preventDefault()`/`stopPropagation()`.
- **$event**: 함수만 적으면 이벤트 객체 자동 전달, 다른 인자와 함께 넘기려면 `$event`를 명시적으로 전달.

**Event Modifier**

| 분류 | Modifier |
|---|---|
| 전파 제어 | `.prevent`, `.stop`, `.self`, `.capture`, `.once`, `.passive` |
| 키보드 | `.enter`, `.tab`, `.delete`, `.esc`, `.space`, 방향키 |
| 시스템키 | `.ctrl`, `.alt`, `.shift`, `.meta`, `.exact` |
| 마우스 버튼 | `.left`, `.right`, `.middle` |

### Form Data Binding (v-model)
내부적으로는 `:value` + `@input`의 결합(문법설탕):
```html
<input type="text" :value="text2" @input="(e) => (text2 = e.target.value)" />
<!-- 위와 동일한 결과 -->
<input type="text" v-model="text2" />
```

**요소별 변수 선언 규칙**

| 요소 | 변수 |
|---|---|
| textarea | `ref('')` |
| 단일 checkbox | `ref(false)` |
| 다중 checkbox | `ref([])` |
| radio | `ref('')` |
| select | `ref('')` |

**v-model Modifiers**: `.lazy`(input→change 시점 변경), `.number`(문자열→숫자 변환), `.trim`(공백 제거), 체이닝 가능(`v-model.trim.number`).

### Vue Style
- **Scoped Style**: `<style scoped>`로 해당 컴포넌트에만 CSS 적용 범위 제한.
- **External Style**: 프로젝트 전체 공통 스타일은 `main.js`에서 전역 등록하거나, 컴포넌트 내부에서 `@import '@/assets/파일.css'`로 개별 로드.

---

## 3장. Composition API

### 개요
Vue 3에서 도입된 방식으로 `<script setup>` 내부에 함수 기반으로 로직을 작성. Vue 2의 Options API와 대비되는 표준 방식.

Vue 3 내장함수 카테고리: Application, Reactive State, Computed & Watchers, Lifecycle Hooks, Component Composition, Rendering & DOM, Dependency Injection.

### ref() vs reactive()
```js
import { ref, reactive } from 'vue'

// ref: 원시/참조 타입 모두 반응형화. <script>에서는 .value, <template>에서는 생략.
const count = ref(0)
const user = ref({ name: '이순신', age: 30 })
count.value++
user.value.name = '장보고'

// reactive: 참조 자료형(객체/배열) 전용.
let state = reactive({ count: 0 })
// ❌ 통째로 새 객체를 갈아끼우면 반응성 연결이 끊어진다.
state = { count: 5 }
// 🟢 내부 속성만 변경해야 한다.
state.count = 5
```
배열은 `push`/`splice` 등 변형 메서드로 다뤄야 반응성이 유지됨.

> **실무 팁**: `reactive`는 객체를 통째로 재할당하거나 구조분해하면 반응성이 끊기는 약점이 있어, 현업에서는 객체·배열도 안전하게 **`ref()`로 통일해서 쓰는 추세**가 강하다. 처음 배울 때는 "우선 `ref`만 쓴다"고 생각해도 충분하다. (`day1.pdf`)

**반응형 기타 함수 요약**: `readonly`, `shallowRef`/`shallowReactive`/`shallowReadonly`, `toRef`/`toRefs`, `unref`, `toRaw`, `markRaw`, `isRef`/`isReactive`/`isReadonly`, `customRef`.

**toRefs — reactive 객체를 구조분해해도 반응성 지키기**: `reactive` 객체를 그냥 구조분해(`const { city, temp } = state`)하면 일반 값 복사가 되어 반응형 연결이 끊긴다. `toRefs`는 모든 속성을, `toRef`는 속성 1개만 반응형 `ref`로 추출해 이 문제를 해결한다.
```js
import { reactive, toRefs } from 'vue'
const state = reactive({ city: '수원', temp: 24 })
// (X) const { city, temp } = state → 반응성 끊김
// (O) toRefs로 감싸면 모든 속성이 반응형 ref로 추출된다
const { city, temp } = toRefs(state)
function warmer() { temp.value++ }   // 원본 state.temp도 함께 바뀐다
```

### computed()
계산 결과를 **캐싱**하는 읽기 전용 반응형 값. 의존하는 값이 바뀌지 않으면 재연산하지 않음(일반 함수 호출과의 핵심 차이).
```js
import { ref, computed } from 'vue'
const count = ref(0)
const doubleCount = computed(() => {
  console.log('✅ Computed 연산 실행됨!')
  return count.value * 2
})
```

### watch()
특정 반응형 데이터의 변화를 감시하고 `(newValue, oldValue)` 콜백을 실행.

> **computed vs watch 판단 기준** (`day1.pdf`): 새 값이 필요하면 **computed**(예: 장바구니 합계처럼 원본이 바뀌면 자동으로 다시 계산되는 값), 값이 바뀔 때 할 일(부수 효과 — API 재호출, 로그 저장 등)이 필요하면 **watch**.

```js
// 기본
watch(currentCity, (newValue, oldValue) => { /* ... */ })

// 멀티소스: 배열로 여러 변수 동시 감시
watch([city, dateType], ([newCity, newDate], [oldCity, oldDate]) => { /* ... */ })

// Deep watch: 객체/배열은 참조값만 추적하므로 deep 옵션 필요
watch(user, (newVal) => { /* ... */ }, { deep: true })
// deep 사용 시 newVal과 oldVal 주소가 같아 이전값 비교 불가 → 특정 속성만 감시하면 해결
watch(() => user.value.age, (newAge, oldAge) => { /* ... */ })
```

**watch + 디바운스(debounce) 패턴** — 검색 입력처럼 매 입력마다 API를 호출하면 낭비이므로, 입력이 멈춘 뒤에만 호출하도록 지연시키는 실전 패턴 (`day1.pdf`):
```js
import { ref, watch } from 'vue'
const keyword = ref('')
let timer
watch(keyword, (val) => {
  clearTimeout(timer)              // 이전 예약 취소
  timer = setTimeout(() => {
    fetchSuggestions(val)          // 입력이 멈춘 뒤에만 실제 호출
  }, 300)
})
```
`reactive()` 데이터는 자동으로 deep 감시되지만 이전값 추적이 안 되므로, 특정 속성을 화살표 함수로 지정해 감시하는 방식으로 해결한다.

### watchEffect()
감시 대상을 코드 내에서 자동으로 추적하고, 컴포넌트 생성 시 최초 1회 즉시 실행됨. `oldValue` 없음.
```js
watchEffect(() => {
  logMessage.value = `[자동 감지] 이름: ${username.value} / 나이: ${age.value}세`
})
```

**Computed & Watchers 계열 함수 요약**: `computed`, `watch`, `watchEffect`, `watchPostEffect`(DOM 업데이트 후 실행), `watchSyncEffect`(동기 실행).

---

## 4장. Vue Component

### Component 개요 및 계층
- 컴포넌트는 독립성과 교체 가능성을 가지며, SFC(.vue)로 HTML/CSS/JS를 통합.
- **Parent-Child**: 서로 내부 변수 직접 접근 불가, Props/Emit으로만 통신.
- **Sibling**: 형제 컴포넌트는 부모를 경유해야 통신 가능.
- **Ancestors-Descendants**: 다중 계층 조상-후손 관계.

### 컴포넌트 등록
- **지역(Local) 등록**: 부모가 `import`하여 사용. PascalCase/kebab-case 모두 가능.
- **전역(Global) 등록**: `main.js`에서 `app.component('이름', 컴포넌트)`로 등록, 메서드 체이닝 가능.

### Component Lifecycle
4단계: **생성(Creation) → 부착(Mounting) → 갱신(Updating) → 소멸(Unmounting)**.

| Hook | 시점 |
|---|---|
| `setup` | 컴포넌트 생성 시작 |
| `onBeforeMount` / `onMounted` | DOM 부착 전/후 |
| `onBeforeUpdate` / `onUpdated` | 반응형 데이터 변경으로 인한 리렌더링 전/후 |
| `onBeforeUnmount` / `onUnmounted` | 컴포넌트 제거 전/후 |
| `onErrorCaptured` | 하위 컴포넌트 에러 캐치 |
| `onActivated` / `onDeactivated` | `<KeepAlive>` 사용 시 |

**타이머 정리 표준 패턴** (메모리 누수 방지):
```js
import { ref, onMounted, onUnmounted } from 'vue'
const count = ref(0)
let timerId = null

onMounted(() => {
  timerId = setInterval(() => { count.value++ }, 3000)
})
onUnmounted(() => {
  clearInterval(timerId) // 필수: 하지 않으면 메모리 누수
})
```

### Props & Emits
"데이터는 위→아래(Props), 이벤트는 아래→위(Emit)". `defineProps`/`defineEmits`/`defineExpose`는 **Compiler Macro**로 `<script setup>` 전용이며 import 불필요.

**defineProps() — 객체 형식(타입/검증 가능)**:
```js
defineProps({
  title: String,
  likes: { type: Number, required: true },
  status: { type: String, default: '대기 중' },
  weeklyForecast: { type: Array, default: () => [] },       // 배열은 반드시 함수로 기본값 지정
  coordinates: { type: Object, default: () => ({ lat: 37.5, lng: 126.9 }) },
  score: { type: Number, validator(value) { return value >= 0 && value <= 100 } },
})
```
- Props는 자식에서 **읽기 전용**(직접 수정 시 에러).
- 부모 템플릿에서는 **kebab-case**, 자식 스크립트에서는 **camelCase**로 매핑됨:
```html
<WeatherCard :city-name="selectCityName" :area-code="areaCode" />
```
```js
defineProps({ cityName: String, areaCode: Number })
```

**defineEmits() — 자식→부모 통신**:
```js
// Child
const emit = defineEmits(['select-city'])
const handleCardClick = (name) => { emit('select-city', name) }
```
```html
<!-- Parent -->
<WeatherCard cityName="서울" status="맑음" @select-city="receiveCitySignal" />
```
이벤트명은 kebab-case 관례를 따른다.

### Provide & Inject
Props Drilling(여러 계층을 거쳐 전달해야 하는 문제) 해결책. 중간 계층을 건너뛰고 조상→후손으로 직접 전달.
```js
// 조상
import { provide, ref } from 'vue'
const themeColor = ref('dark-mode')
provide('globalTheme', themeColor)

// 후손
import { inject } from 'vue'
const theme = inject('globalTheme')
```
> 실무에서는 전역 상태 관리에 Pinia를 주로 사용하므로 Provide/Inject 사용 빈도는 상대적으로 낮음.

### Component Slot
Props(데이터 주입)와 달리 Slot은 **HTML 마크업/레이아웃 조각**을 부모가 자식에게 주입하는 방식.

```html
<!-- Default Slot (Child) -->
<slot><p>기본 콘텐츠 영역입니다.</p></slot>

<!-- Named Slot (Child) -->
<slot name="header"></slot>
<!-- Named Slot (Parent) -->
<template v-slot:header><h3>Child 주입 제목</h3></template>

<!-- Scoped Slot (Child): 자식→부모로 데이터 전달 -->
<slot :text="message" :count="userCount"></slot>
<!-- Scoped Slot (Parent) -->
<SlotScopedChild v-slot="slotBag">
  <p>알림 메시지: {{ slotBag.text }}</p>
</SlotScopedChild>
```

> 중요 개념: Slot으로 주입된 콘텐츠는 시각적으로는 자식 컴포넌트 내부에 위치하지만, **스크립트 스코프(변수/함수)는 부모(주입한 쪽) 컴포넌트에 소속**된다.
