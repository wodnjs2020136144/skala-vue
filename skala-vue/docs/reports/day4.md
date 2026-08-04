# Vue.js 실습 기록 - Day 4

- 과정명: Full-Stack Engineering - Frontend-framework: Vue.js (강병호)
- 날짜: 2026-08-05
- 오늘 목표 (`docs/checklist.md` 4일차 기준): 마무리 + 제출
  - Element Plus로 UI 정리
  - Modern JS — 구조분해·전개·옵셔널 체이닝 적용
  - `npm run build` · base 경로 확인 · 정적 배포(Vercel·Netlify·GitHub Pages)
  - 저장소가 Public인지 시크릿 창으로 최종 확인
  - 수업 종료 전까지 제출

> 이 문서는 실습 중 진행한 작업을 요구사항 → 사고 과정 → 해결 과정 → 트러블슈팅 → 결과 → 느낀점 순서로 기록합니다. 최종 종합 보고서는 [final-report.md](./final-report.md)를 참고하세요.
>
> Day 4는 4일 과정의 마지막 날로, 실습이 최종 결과물로 완성되는 날입니다. 오늘 작업이 끝나면 [final-report.md](./final-report.md)를 반드시 완성해야 합니다.

---

## 1. Day 4 추가 실습(8~9장 Code Challenge) 조사 및 구현 (메인 실습 착수 전 사전 작업)

**요구사항**
- 4일차 메인 실습(Element Plus로 실제 앱 UI 정리, Modern JS 리팩토링, 빌드/배포)에 들어가기 전에, 새 PDF 209~274페이지(8장 UI 라이브러리·9장 Modern JavaScript·10장 Vite 빌드/배포)를 조사해 문서화하고, 8~9장의 자습용 Code Challenge를 `/practices/day4`에 구현한다.

**사고 과정**
- 탐색 결과 8장은 Element Plus 3종 챌린지(회원가입 폼, 구매 수량/별점, 삭제확인+다운로드 진행률), 9장은 완전한 스타터 코드가 제공된 Modern JS 3종 챌린지(구조분해+비구조화, 스프레드+옵셔널체이닝, async/await 연쇄)임을 확인. 9장 챌린지는 교재의 "미션" 주석을 그대로 두고 정답 코드로 빈칸을 채우는 형태로 구현.
- 10장(ESLint/Prettier/env/build)의 Code Challenge는 컴포넌트가 아니라 "명령 실행·설정 파일 작성" 성격이라, 오늘 이어질 메인 실습(빌드/배포)에서 자연스럽게 함께 다루기로 하고 이번 항목에서는 구현하지 않음(문서화만 완료).
- Element Plus를 신규 설치해야 하므로 `main.js`에 전역 등록.

**해결 과정**
1. `npm install --save --legacy-peer-deps element-plus` 설치, `main.js`에 `app.use(ElementPlus)` + CSS import 추가.
2. `SignupFormChallenge.vue`(p.225) 생성 — 이메일 형식 검증, 약관 동의, `ElMessage`로 성공/경고/에러 토스트.
3. `ProductQuantityChallenge.vue`(p.226) 생성 — `el-input-number`(구매 수량), `el-rate`(별점).
4. `FileDeleteProgressChallenge.vue`(p.227) 생성 — `ElMessageBox.confirm`(삭제 확인) + `el-progress`(다운로드 진행률 애니메이션). 교재 원본의 `type: 'danger'`는 Element Plus 미지원 값이라 `'warning'`으로 수정.
5. `DataExtractChallenge.vue`(p.247), `CartDefenseChallenge.vue`(p.248), `AsyncChainChallenge.vue`(p.249) 생성 — 교재가 제공한 스타터 코드의 "미션" 주석 부분을 실제 구현 코드로 완성.

   #### `src/components/practices/modernjs/AsyncChainChallenge.vue` (예시로 하나만 인용, 나머지는 유사한 구조)
   ```vue
   <script setup>
   import { ref } from 'vue'
   const result3 = ref('')
   const fetchUserId = () => new Promise((res) => setTimeout(() => res({ uid: 777 }), 400))
   const fetchUserProfile = (uid) => new Promise((res) => setTimeout(() => res({ uid, nick: 'Graves' }), 400))

   async function runTask3() {
     result3.value = '⏳ 데이터 동기화 중...'
     try {
       const { uid } = await fetchUserId()
       const { nick } = await fetchUserProfile(uid)
       result3.value = `동기화 성공: ${nick}님 환영합니다.`
     } catch (error) {
       result3.value = '통신 실패'
       console.error(error)
     }
   }
   </script>
   ```

6. `PracticesDay4View.vue` 신규 생성(6개 챌린지 모두 배치), `router/index.js`의 `/practices/day4`에 연결.
7. `docs/vue-study-guide.md`에 8~10장 이론 섹션 추가, `docs/vue-practice-exercises.md`에 "Day 4 추가 실습" 절 추가.
8. 브라우저에서 `/practices/day4` 렌더링 확인 — 잘못된 이메일 검증 메시지, 다운로드 진행률 애니메이션(0%→100%), Modern JS 3개 챌린지의 "가동" 버튼을 각각 클릭해 정확한 출력 포맷을 검증.

**트러블슈팅**
- **문제**: element-plus 설치 시 이전과 동일한 `ERESOLVE`(oxlint peer dependency) 충돌.
- **원인**: 프로젝트의 oxlint 버전 고정 문제(1일차부터 반복).
- **해결**: `--legacy-peer-deps`로 재시도, 정상 설치.

**결과**
- Element Plus 3개 챌린지 모두 정상 동작: 이메일 형식 오류 시 "❌ 올바른 이메일 형식이 아닙니다" 토스트 표시, 다운로드 진행률이 0→20→40→...→100%까지 정상 애니메이션.
- Modern JS 3개 챌린지 모두 교재가 요구한 정확한 문자열 포맷으로 출력됨:
  - 결과창 1: `부산 포함 여부: true / 등급: VIP / 점수: 95점`
  - 결과창 2: `카트: Apple,Banana,Orange / 이미지: 이미지 준비중 / 수량: 0개`
  - 결과창 3: `동기화 성공: Graves님 환영합니다.`

![Day 4 추가 실습 — Element Plus 챌린지](./images/day4/01-practices-day4-elementplus.jpg)
![Day 4 추가 실습 — Modern JS 챌린지](./images/day4/02-practices-day4-modernjs.jpg)

**느낀점**
- Modern JS 챌린지는 교재가 스타터 코드와 정확한 출력 포맷까지 제공해줘서, 구현한 코드가 맞았는지 화면에 찍힌 문자열을 교재 스펙과 글자 그대로 대조하며 바로 확인할 수 있었다 — 채점 기준이 명확한 연습 문제의 장점을 느꼈다.
- 교재 원본 코드에 `type: 'danger'`처럼 실제로는 동작하지 않는 오탈자가 종종 있다는 걸 이번에도 확인했다(1일차 v-cloak 문서화 때도 비슷한 경험). 라이브러리 문서를 항상 함께 대조하는 습관이 중요하다는 걸 다시 느꼈다.
- 이제 메인 실습(Element Plus로 실제 날씨 앱 UI 정리, Modern JS 리팩토링, 빌드/배포)으로 넘어갈 준비가 됐다 — 연습을 먼저 해두니 실제 앱에 적용할 때 문법을 다시 찾아볼 필요가 없을 것 같다.

---

## 2. "Retro LED Weather Terminal" 디자인 시스템 구축 및 전체 화면 적용

**요구사항**
- 4일차 UI 정리 단계에서, 참고 이미지(도트 매트릭스 스타일의 스마트폰 날씨 앱 화면)를 기반으로 날씨 아이콘을 도트(픽셀) 기반 애니메이션으로 재구성하고, 이 디자인을 홈 화면·날씨 카드·검색창·단위 토글·상단 내비게이션까지 앱 전체에 확산 적용한다.

**사고 과정**
- 디자인 변경은 되돌리기 어렵고 취향이 많이 갈리는 작업이라, 전체 화면에 한 번에 적용하지 않고 `WeatherDetailView` 한 곳에만 먼저 적용해 컨셉을 확정한 뒤 나머지로 확산하는 단계적 접근을 택했다.
- 아이콘 애니메이션을 "원형 그래픽이 CSS `transform`으로 미끄러지는" 방식으로 처음 구현했다가, "진짜 전광판처럼 고정된 칸이 켜졌다 꺼졌다 하는 느낌"이어야 한다는 피드백을 받고 `setInterval` 기반으로 매 프레임 그리드 전체의 점등 여부를 다시 계산하는 방식으로 전면 재설계했다. 이 과정에서 비/눈/안개는 프레임 기반 동적 패턴으로, 해/구름/뇌우는 정적 패턴 + CSS 애니메이션으로 역할을 나눴다.
- 아이콘이 어느 정도 안정된 뒤에는 이 스타일을 앱 전체로 확산하되, 이미 존재하는 디자인 토큰(`retro-theme.css`)과 컴포넌트(`DotMatrixIcon`)를 그대로 재사용하고, 날씨 카드의 배지 아이콘도 이미 계산되어 있는 `city.condition` 값을 이용해 `DotMatrixIcon size="sm"`으로 교체하는 방향으로 정리했다(새 데이터 계산 없이 기존 값 재사용).

**해결 과정**
1. 디자인 토큰과 폰트를 준비했다 — `index.html`에 Silkscreen(영문 픽셀 폰트) 구글 폰트와 Galmuri(한글 픽셀 폰트, CDN) 링크를 추가하고, `src/assets/retro-theme.css`에 색상 토큰을 정의해 `main.js`에서 전역 로드했다.

   #### `src/assets/retro-theme.css`
   ```css
   :root {
     --paper: #edeae1;
     --ink: #1c1b19;
     --panel: #17181a;
     --dot-off: #2a2c2e;
     --dot-lit: #f3ebd9;
     --amber: #c98a2c;
     --moss: #5e6b5a;
     --font-pixel: 'Silkscreen', ui-monospace, monospace;
     --font-pixel-kr: 'Galmuri11', var(--font-mono);
     --font-mono: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
   }
   body {
     background: var(--paper);
     color: var(--ink);
     font-family: var(--font-mono);
   }
   ```

2. `src/components/practices/weather/DotMatrixIcon.vue`를 신규 작성했다 — `condition`(sun/cloud/rain/snow/thunderstorm/fog)/`size`(sm|lg)/`animated`/`colored` prop을 받아 36×36 그리드를 계산해 렌더링한다. 해·구름·뇌우는 좌표 기하 계산(원·타원·선분 거리)으로 정적 패턴을 만들고, 비·눈·안개는 `frame` ref를 `setInterval`로 증가시키며 매 틱마다 그리드를 다시 계산해 "고정된 칸이 밝기만 바뀌는" 전광판 느낌을 낸다.

   #### `src/components/practices/weather/DotMatrixIcon.vue` (비 애니메이션 핵심 로직 발췌)
   ```js
   const RAINDROP_SHAPE = [ [0,0], [-1,1],[0,1],[1,1], [-1,2],[0,2],[1,2],
     [-2,3],[-1,3],[0,3],[1,3],[2,3], [-2,4],[-1,4],[0,4],[1,4],[2,4], [-1,5],[0,5],[1,5] ]
   function buildRainFrame(frame) {
     const dots = emptyDots()
     RAIN_DROPS.forEach(({ x, phase, speed }) => {
       const exact = ((frame * speed + phase) % totalRows) - 6
       const row = Math.floor(exact)
       const frac = exact - row
       ;[[row, 1 - frac], [row + 1, frac]].forEach(([cy, weight]) => {
         if (weight <= 0.02) return
         RAINDROP_SHAPE.forEach(([ox, oy]) => applyDot(dots, x + ox, cy + oy, weight, color, 'drop'))
       })
     })
     return dots
   }
   ```

3. 확인용 테스트 페이지 `src/views/DotMatrixPreviewView.vue`(`/preview/dot-matrix`)를 만들어 실제 날씨가 바뀌길 기다리지 않고 6가지 조건 애니메이션을 한 화면에서 색상 토글과 함께 비교할 수 있게 했다.
4. `WeatherDetailView.vue`에 `DotMatrixIcon`을 적용해 컨셉을 먼저 확정했다(도시명은 `--font-pixel-kr`, 온도는 `--font-pixel`, 화면은 `--panel` 배경).
5. 컨셉이 확정된 뒤, 나머지 화면에 동일 토큰을 적용해 확산했다.

   #### `src/App.vue` (상단 내비게이션)
   ```css
   .app-nav {
     background: var(--ink);
     border-bottom: 2px solid var(--amber);
   }
   .app-nav__link {
     font-family: var(--font-pixel-kr);
     color: var(--paper);
   }
   .app-nav__link.router-link-active {
     color: var(--amber);
   }
   ```

   #### `src/components/practices/weather/WeatherCard.vue` (배지를 FontAwesome → DotMatrixIcon으로 교체)
   ```vue
   <div class="city-card__badge">
     <DotMatrixIcon :condition="city.condition" size="sm" :animated="true" />
   </div>
   ```

   `SearchBar.vue`(검색창을 LED 화면처럼 `--panel` 배경 + `--dot-lit` 글자로), `UnitToggler.vue`(작은 픽셀 버튼), `BaseDashboardCard.vue`(카드 배경을 `--paper`로)도 같은 토큰으로 통일했다.

**트러블슈팅**
- **문제**: 비/눈 애니메이션이 "원이 미끄러지는" 것처럼 보이고, 구름은 매끈한 타원 하나로 뭉쳐 보이거나 반대로 내부에 구멍이 생기는 등 여러 차례 모양이 어색했다.
- **원인**: 초기 구현이 CSS `transform`으로 도트를 이동시켰던 것과, 원 여러 개를 겹칠 때 반지름·간격 비율을 잘못 잡아 개별 원의 경계가 그대로 드러나거나(포도송이처럼 분리) 반대로 내부가 비는 문제였다.
- **해결**: 이동은 매 프레임 그리드를 다시 계산하는 방식으로 전환했고, 구름은 "속을 채우는 큰 도형 + 겹침 비율을 세밀하게 조정한 작은 돌기들"의 조합으로 여러 번 반지름·중심 좌표를 다시 맞춰 참고 이미지와 비슷한 울퉁불퉁한 실루엣을 만들었다.

**결과**
- `/`, `/weather/:id`, `/preview/dot-matrix` 전 화면에서 다크 내비게이션 + 크림톤 카드 + 도트 매트릭스 아이콘 스타일이 일관되게 적용됨을 확인했다.
- 검색 필터링, 카드 선택/상세 이동, ℃/℉ 단위 토글이 스타일 변경 후에도 기존과 동일하게 동작함을 확인했다(로직은 손대지 않고 스타일만 교체).

![Day 4 디자인 적용 — 홈 화면](./images/day4/08-retro-theme-home.jpg)
![Day 4 디자인 적용 — 상세 화면](./images/day4/09-retro-theme-detail.jpg)

**느낀점**
- 디자인처럼 정답이 없는 작업은 "한 곳에서 컨셉을 확정한 뒤 확산"하는 단계적 접근이 되돌리기 비용을 크게 줄여준다는 걸 체감했다. 상세 화면 하나에서 8~9번의 세부 피드백을 받아 아이콘을 다듬은 뒤 전체 확산은 오히려 빠르고 매끄럽게 끝났다.
- CSS `transform` 애니메이션과 "매 프레임 다시 계산하는" 방식은 코드량은 비슷해도 결과물의 성격이 완전히 다르다는 걸 배웠다 — 같은 "움직임"이라도 무엇이 실제로 움직이는지(그래픽 자체 vs 그리드 상태)에 따라 시각적 인상이 크게 달라진다.

---

## 3. 한반도 도트 지도 대시보드(`/map`) 구현 — 지역 선택·풍향 애니메이션·API 데이터 시각화·즐겨찾기

**요구사항**
- Day 4 메인 실습(레트로 도트 매트릭스 디자인)을 베이스로, 한반도 지도 위에서 주요 지역 날씨를 확인하는 새 대시보드 페이지를 추가한다. (1) 지도에 대표 지역을 표시하고 클릭하면 날씨가 나오게, (2) 지도 자체도 도트 이미지로, (3) 지도에서 날씨 흐름(풍향)을 표현, (4) 지역 즐겨찾기 기능. 추가로 지역 상세 정보에서 API의 다양한 값(습도·구름량·가시거리·기압·일출일몰 등)을 시각화한다.

**사고 과정**
- 실제 GPS 좌표 데이터 없이 지도를 만들어야 했으므로, 기존 구름/눈송이 아이콘을 만들 때 썼던 "다각형/원 기하로 실루엣을 근사해 그리드에 점을 찍는" 기법을 그대로 재사용하기로 했다. 대신 이 지도가 실측 지리 데이터가 아니라 스타일화된 근사 실루엣이라는 점은 사용자에게 미리 밝혔다.
- "날씨 흐름"을 표현하는 방법은 여러 방향(실제 풍향 애니메이션 / 온도 히트맵 / 정적 마커)이 가능해 사용자에게 직접 골라달라고 물었고, "실제 풍향 기반 애니메이션"으로 확정했다. OpenWeatherMap 응답에 이미 풍향(`wind.deg`)·풍속(`wind.speed`)이 들어있으므로 새 API 호출 없이 기존 `fetchCurrentWeather`에 필드만 추가하면 됐다.
- API 데이터 시각화는 그래프 라이브러리를 새로 설치하기보다, 지금까지 만든 도트 매트릭스 톤에 맞춰 "도트 여러 칸을 채우는 막대(LED 레벨미터)"로 직접 만드는 쪽을 택했다 — 일관성을 지키면서 의존성도 늘리지 않는 방법이었다.

**해결 과정**
1. `weatherApi.js`의 `CITY_LIST`를 3개 도시에서 9개(서울·인천·수원·대전·대구·광주·부산·울산·제주)로 늘리고, 지도 배치용 정규화 좌표 `mapX`/`mapY`를 추가했다. `fetchCurrentWeather`가 반환하는 객체에도 풍향/풍속/습도/기압/체감온도/최저·최고/가시거리/구름량/일출·일몰을 추가로 뽑아 담았다.

   #### `src/services/weatherApi.js` (발췌)
   ```js
   export const CITY_LIST = [
     { id: 'city_01', name: '서울', query: 'Seoul,KR', mapX: 0.42, mapY: 0.08 },
     { id: 'city_04', name: '인천', query: 'Incheon,KR', mapX: 0.25, mapY: 0.1 },
     // ... 총 9개 도시
   ]

   export async function fetchCurrentWeather(city) {
     const { data } = await axios.get(BASE_URL, { params: { q: city.query, appid: API_KEY, units: 'metric', lang: 'kr' } })
     const { main, weather, wind, visibility, clouds, sys } = data
     const [{ main: weatherMain, description } = {}] = weather ?? []
     return {
       id: city.id, name: city.name, mapX: city.mapX, mapY: city.mapY,
       temp: Math.round(main.temp), status: description, condition: mapWeatherMainToCondition(weatherMain),
       windDeg: wind?.deg ?? 0, windSpeed: wind?.speed ?? 0,
       humidity: main.humidity, pressure: main.pressure,
       feelsLike: Math.round(main.feels_like), tempMin: Math.round(main.temp_min), tempMax: Math.round(main.temp_max),
       visibility: visibility ?? 10000, cloudiness: clouds?.all ?? 0,
       sunrise: sys?.sunrise, sunset: sys?.sunset,
     }
   }
   ```

2. `src/components/practices/weather/KoreaMapDots.vue`를 신규 작성했다 — 남한 외곽선을 다각형 좌표로 손으로 근사하고, `DotMatrixIcon`과 같은 grid-membership 판정(ray-casting)으로 도트를 켜서 지도 실루엣을 만들었다. 제주는 별도의 원으로 추가. 각 도시 위치에 `DotMatrixIcon size="sm"` 마커를 절대좌표로 올리고, 마커 주변에 실제 풍향(`windDeg+180`)·풍속 기반으로 흘러나가는 작은 입자를 `setInterval` 프레임 재계산 방식(비/눈 애니메이션과 동일한 기법, CSS transform 슬라이드 아님)으로 그렸다.

   #### `src/components/practices/weather/KoreaMapDots.vue` (풍향 입자 로직 발췌)
   ```js
   const particles = computed(() =>
     props.cities.flatMap((city) => {
       const angleRad = ((city.windDeg + 180) % 360) * (Math.PI / 180)
       const speed = Math.max(0.6, Math.min(3, city.windSpeed || 1))
       return [0, 1].map((phaseIndex) => {
         const phase = phaseIndex * (MAX_DRIFT / 2)
         const distance = (frame.value * speed * 0.6 + phase) % MAX_DRIFT
         const dx = distance * Math.sin(angleRad)
         const dy = -distance * Math.cos(angleRad)
         return { key: `${city.id}-${phaseIndex}`, mapX: city.mapX, mapY: city.mapY, dx, dy, opacity: 1 - distance / MAX_DRIFT }
       })
     }),
   )
   ```

3. `src/components/practices/weather/DotStatBar.vue`를 신규 작성했다 — `label`/`value`(0~100)/`displayValue` prop을 받아 도트 16칸 중 비율만큼 앰버색으로 채우는 막대 컴포넌트.
4. `src/stores/favoritesStore.js`를 신규 작성했다 — `favoriteIds` 배열을 `localStorage`(`weather-favorites` 키)에 `watch`로 영속화하고 `toggleFavorite`/`isFavorite`을 제공.
5. `src/views/WeatherMapView.vue`를 신규 작성했다 — 지도(왼쪽) + 선택된 도시 상세 패널(오른쪽) 2단 레이아웃. 상세 패널엔 `DotMatrixIcon size="lg"`와 함께 `DotStatBar`로 습도·구름량·가시거리·기압·낮 진행률(일출~일몰 사이 현재 시각 비율)을 표시하고, 즐겨찾기 토글(★)과 기존 `/weather/:id` 상세 페이지로 가는 버튼을 뒀다. 즐겨찾기된 도시는 지도 위에 칩으로 나열해 바로 선택할 수 있게 했다. `@media (max-width: 640px)`로 모바일에서 1단 스택으로 전환.
6. `router/index.js`에 `/map`(`weather-map`) 라우트를, `App.vue` 내비게이션에 "지도" 링크를 추가했다.
7. 브라우저에서 확인 — 9개 마커가 지도 위 대략 올바른 상대 위치(서울 북쪽, 부산 남동쪽, 제주 최남단)에 표시됨을 확인. 마커 클릭 시 상세 패널이 갱신되고 도트 막대들이 실제 값 비율만큼 채워짐을 확인. 즐겨찾기 토글 후 새로고침해도 유지됨을 확인. 브라우저 창을 좁혀 모바일 스택 레이아웃 CSS가 실제로 컴파일돼 있음을 스타일시트에서 확인.

**트러블슈팅**
- **문제**: 처음 좌표(서울/수원, 부산/울산)로 지도를 그렸더니 마커들이 서로 겹쳐서 라벨이 뭉개졌다.
- **원인**: 실제 거리상 가까운 도시들의 `mapY` 값 차이가 너무 작아 마커(아이콘+라벨) 세로 폭보다 간격이 좁았다.
- **해결**: 겹치는 도시 쌍의 `mapX`/`mapY`를 서로 더 벌리는 방향으로 좌표를 재조정해 해결했다(정밀한 지리 좌표가 아니라 장식적 배치이므로 가독성 우선으로 조정).

**결과**
- `/map`에서 9개 지역 마커 클릭 → 상세 패널(온도·상태·습도·구름량·가시거리·기압·낮 진행률·풍속) 표시, 즐겨찾기 토글·영속화, 데스크탑 2단/모바일 1단 반응형 레이아웃 모두 정상 동작을 확인했다.

![Day 4 지도 대시보드 — 전체 화면](./images/day4/10-map-dashboard-overview.jpg)
![Day 4 지도 대시보드 — 상세 패널 데이터 시각화](./images/day4/11-map-dashboard-detail.jpg)

**느낀점**
- 지리 데이터를 정확히 구할 수 없는 상황에서도, 이미 확립해 둔 "기하 근사 + 그리드 판정" 패턴을 다른 문제(지도 실루엣)에 그대로 적용할 수 있다는 걸 확인했다 — 한 번 잘 만들어둔 기법은 아이콘 하나에 그치지 않고 재사용 가치가 크다.
- 여러 구현 방향이 있는 모호한 요구사항("날씨 흐름을 표현")은 임의로 하나를 골라 구현하기보다, 실제 API 데이터와 연결되는 옵션을 포함해 선택지를 제시하고 사용자가 고르게 하는 편이 결과물의 만족도와 데이터 활용도를 모두 높인다는 걸 느꼈다.

---

## 4. 지도 대시보드 개선 — 정적 마커, 한반도 전체 실루엣, 클릭 위치 팝업, 바다 배경

**요구사항**
- 직전에 만든 `/map` 지도 대시보드에 4가지 개선: (1) 메인 지도에서는 마커 애니메이션을 빼고 상세 진입 시에만 재생, (2) 참고 이미지(남북한 전체를 흰 도트로 표현한 실루엣)를 기준으로 지도 모양 재작성, (3) 상세 정보를 옆 패널이 아니라 클릭 위치 근처에 뜨는 애니메이션 팝업으로 변경, (4) 지도를 가두던 검은 박스를 없애고 화면 전체를 "바다"처럼 보이게 한 뒤 그 위에서 풍향 애니메이션이 펼쳐지도록.

**사고 과정**
- 참고 이미지를 보니 지금까지 그린 건 남한만 있는 반쪽짜리 지도였다는 걸 깨달았다. 북한까지 포함한 전체 윤곽으로 다시 그리되, 실측 좌표가 없다는 한계는 이전과 동일하므로 다각형 꼭짓점을 참고 이미지의 특징적인 굴곡(두만강 방면의 각진 돌출, 잘록한 허리, 남해안으로 갈수록 좁아지는 흐름)에 맞춰 눈대중으로 다시 잡았다.
- 지도를 남한 지역에서 북한 포함 전체로 넓히면서, 기존에 남한 영역 기준으로 잡아뒀던 9개 도시의 `mapX`/`mapY`도 새 다각형의 남쪽 절반 영역에 맞게 전부 재조정해야 했다.
- 옆 패널 방식은 지도 자리를 계속 차지해 좁아 보였는데, 팝업으로 바꾸면 지도를 넓게 쓰면서 필요할 때만 정보가 뜨는 구조가 되어 "바다 위에 떠 있는 지도"라는 4번 요구사항과도 자연스럽게 맞아떨어졌다.

**해결 과정**
1. `KoreaMapDots.vue`의 `KOREA_POLYGON`을 남한만 있던 다각형에서 북한을 포함한 전체 윤곽으로 다시 그리고, 울릉도는 낱개 점 2개, 제주는 하나의 원이 아니라 흩어진 점 4개로 바꿨다. 마커에서는 `DotMatrixIcon`을 빼고 조건별 색상의 정적 점 + 라벨만 남겼다.

   #### `src/components/practices/weather/KoreaMapDots.vue` (발췌)
   ```js
   const KOREA_POLYGON = [
     [27, 4], [30, 7], [28, 10], [24, 9], [26, 13], [25, 17], [24, 22], [23, 27],
     [24, 32], [25, 36], [23, 40], [19, 42], [14, 40], [9, 36], [7, 32], [9, 27],
     [7, 23], [10, 20], [8, 16], [11, 12], [9, 8], [13, 5], [17, 3],
   ]
   const ULLEUNGDO_DOTS = [[27, 26], [29, 27]]
   const JEJU_DOTS = [[13, 45], [15, 45], [14, 46], [16, 46]]

   const CONDITION_COLORS = { sun: '#ffd24a', cloud: '#c7d0d3', rain: '#5b8fc7', snow: '#dcf0fa', thunderstorm: '#fff3c0', fog: '#a7acae' }
   ```

2. `weatherApi.js`의 `CITY_LIST` 9개 도시 `mapX`/`mapY`를 새 다각형의 남쪽 영역(허리 아래)에 맞춰 재조정했다.
3. `retro-theme.css`에 `--sea: #16232b` 토큰을 추가하고, `KoreaMapDots.vue`의 `.korea-map__grid`에서 `background: var(--panel)` 박스 스타일을 제거해 지도가 배경과 하나로 이어지게 했다. `WeatherMapView.vue`의 페이지 배경을 `var(--sea)`로 채웠다.
4. 풍향 입자의 `MAX_DRIFT`를 46px → 160px로 늘려, 좁은 박스가 아니라 바다 전체를 가로지르듯 흘러가게 했다.
5. `WeatherMapView.vue`의 2단(지도+패널) 레이아웃을 제거하고, 마커 클릭 시 `event.currentTarget.getBoundingClientRect()`를 emit받아 그 좌표 근처에 `position: fixed` 팝업을 띄우는 구조로 바꿨다. `<Transition name="popup">`으로 스케일+페이드 애니메이션을 넣고, 화면 밖으로 넘치지 않게 `top`/`left`를 모두 clamp했다.

   #### `src/views/WeatherMapView.vue` (팝업 위치 계산 발췌)
   ```js
   const popupStyle = computed(() => {
     if (!popupAnchor.value) return {}
     const { left, top, bottom } = popupAnchor.value
     const maxLeft = window.innerWidth - POPUP_WIDTH - POPUP_MARGIN
     const clampedLeft = Math.max(POPUP_MARGIN, Math.min(left, maxLeft))
     const spaceBelow = window.innerHeight - bottom
     const opensUpward = spaceBelow < POPUP_HEIGHT_ESTIMATE + POPUP_MARGIN && top > POPUP_HEIGHT_ESTIMATE
     const rawTop = opensUpward ? top - POPUP_HEIGHT_ESTIMATE - 8 : bottom + 8
     const maxTop = window.innerHeight - POPUP_HEIGHT_ESTIMATE - POPUP_MARGIN
     const clampedTop = Math.max(POPUP_MARGIN, Math.min(rawTop, maxTop))
     return { left: `${clampedLeft}px`, top: `${clampedTop}px` }
   })
   ```

6. 모바일 폭(`max-width: 640px`)에서는 팝업을 화면 중앙에 고정하도록 CSS로 덮어썼고, 팝업 바깥(반투명 배경) 클릭 시 닫히게 했다.
7. 브라우저에서 확인 — 메인 지도에서 마커가 애니메이션 없이 정적 점으로만 보이는지, 지도 모양이 참고 이미지처럼 남북한 전체+울릉도 낱개 점+제주 흩어진 점으로 보이는지, 마커 클릭 시 그 근처에 팝업이 애니메이션과 함께 뜨는지, 배경 클릭으로 닫히는지 확인했다.

**트러블슈팅**
- **문제**: 팝업이 화면 아래쪽 마커를 눌렀을 때 위쪽으로 열리도록 한 로직에서, 팝업 상단이 화면 밖(위)으로 잘려 제목과 즐겨찾기 버튼이 안 보였다.
- **원인**: `bottom` CSS 속성으로 팝업 아래쪽 기준점만 고정하고 `top`은 `auto`로 뒀는데, 팝업의 실제 높이가 남은 공간보다 크면 위쪽이 화면 경계(0) 밖으로 밀려나면서 `position: fixed` 특성상 스크롤로도 닿을 수 없는 영역에 렌더링됐다.
- **해결**: `bottom` 대신 항상 `top` 값을 계산하는 방식으로 바꾸고, 계산된 `top`이 화면 위/아래 여백을 벗어나지 않도록 `Math.max`/`Math.min`으로 이중 clamp했다. 팝업 자체의 `max-height`도 `min(480px, calc(100vh - 24px))`로 뷰포트 높이에 연동시켜 어떤 화면 크기에서도 넘치지 않게 했다.

**결과**
- `/map`에서 메인 지도는 애니메이션 없는 정적 마커로 가볍게 표시되고, 클릭 시 근처에 애니메이션 팝업이 뜨며, 지도는 검은 박스 없이 바다 배경 한가운데 떠 있는 형태로 바뀌었다. 풍향 입자가 넓은 범위로 흘러가는 것도 확인했다.

![Day 4 지도 대시보드 개선 — 바다 배경 + 한반도 전체 실루엣](./images/day4/12-map-sea-background.jpg)
![Day 4 지도 대시보드 개선 — 클릭 위치 팝업](./images/day4/13-map-popup.jpg)

**느낀점**
- `position: fixed` 요소를 `bottom` 기준으로만 배치하면 콘텐츠 높이를 추정치보다 실제로 더 필요로 할 때 화면 밖으로 밀려날 수 있다는 걸 직접 겪었다. 어느 방향으로 열든 `top` 하나로 통일해서 계산하고 위아래 여백을 모두 clamp하는 편이 훨씬 안전하다는 걸 배웠다.
- 요구사항이 이전 결과물을 계속 다듬어가는 형태일 때는, 매번 처음부터 다시 만들기보다 기존 구조(그리드 판정, 프레임 재계산 애니메이션 패턴)를 유지한 채 필요한 부분만 좌표·스타일을 바꾸는 편이 안정적이라는 걸 다시 확인했다.

---

## 5. 지도 배경 인터랙션 재설계 — 캐릭터·입체 효과 실험을 거쳐 평면 통합 그리드 + 성능 최적화된 파동으로 정착

**요구사항**
- `/map` 바다 배경에 커서 인터랙션을 추가해달라는 요청이 여러 차례 이어졌다. 처음엔 "바다를 헤엄치는 픽셀 캐릭터"와 "커서를 따라다니는 웨이브 잔상"을 요청받았고, 실제로 보여준 뒤에는 "캐릭터는 다 지워달라, 배경 자체가 커서 위치에 따라 눌리는 느낌을 원한다"로 방향이 바뀌었으며, 다시 "입체감(3D)이 아니라 평면 그래픽 기반으로", 마지막엔 "파동 효과가 렉이 심하니 최적화"까지 요구사항이 단계적으로 좁혀졌다.

**사고 과정**
- 캐릭터(범고래·물고기)와 웨이브 잔상은 `KoreaMapDots`(한반도 그리드, 최대 420px 폭의 독립 DOM)와 바다(전체 화면을 덮는 CSS `background-image` 트릭)가 서로 다른 좌표계였던 구조 위에 얹었더니, "다른 색 픽셀이 따라오는 것"처럼만 보이고 진짜 "눌림"이 아니라는 피드백을 받았다. 근본 원인이 좌표계 분리에 있다고 판단해, 캐릭터를 걷어내는 김에 육지·바다를 화면 전체를 채우는 **하나의 실제 DOM 도트 그리드**로 통합하기로 했다 — 이후 정렬 문제가 구조적으로 사라지는 부수 효과도 얻었다.
- 통합 그리드로 바꾼 직후엔 바다 도트에 `radial-gradient`, 육지 도트에 `box-shadow: inset`을 넣어 입체감(양각)을 줬는데, "이 3D 느낌은 원한 게 아니다, 평면으로 돌아가되 눌림 파동은 유지해달라"는 피드백을 받아 그러데이션·그림자를 모두 걷어내고 `filter: brightness()`(색이 밝아졌다 사라지는 방식)로 파동을 다시 표현했다.
- 성능 문제의 원인을 진단해보니, 파동 강도(`pressIntensity`)를 각 도트의 Vue reactive 속성으로 두고 있었다. 도트 배열이 컴포넌트 하나의 `v-for`(약 5,000개)로 전부 그려지기 때문에, 단 하나의 도트 값만 바뀌어도 Vue가 이를 "같은 렌더 이펙트의 의존성 변경"으로 취급해 5,000개 전체를 다시 diff했다 — `requestAnimationFrame`으로 초당 최대 60번 이 작업이 발생하니 렉이 심할 수밖에 없었다. 해법은 애니메이션 경로에서 Vue 반응형을 완전히 배제하고, 영향받는 소수의 실제 DOM 엘리먼트에 `style.setProperty`로 직접 쓰는 것이었다.

**해결 과정**
1. (1차 시도, 이후 롤백) `src/components/practices/weather/SeaCreature.vue`를 만들어 문자 매트릭스로 범고래·물고기 픽셀 스프라이트를 그리고, `requestAnimationFrame` 루프로 화면을 가로질러 이동시켰다. 커서 웨이브는 `trailPoints` 배열에 좌표를 쌓았다 700ms 후 제거하는 방식으로 구현했으나, 두 기능 모두 "원하는 방향이 아니다"라는 피드백을 받아 다음 단계에서 전부 제거했다.
2. `SeaCreature.vue`를 삭제하고, `src/components/practices/weather/KoreaMapDots.vue`를 전면 재작성했다. 더 이상 22×41 고정 크기가 아니라 부모 컨테이너 크기에 맞춰 `cols = round(width / DOT_PX)`, `rows = round(height / DOT_PX)`로 그리드를 만들고, 기존 `KOREA_MATRIX`를 이 그리드 중앙에 배치해 셀마다 `isLand` 여부를 판정했다. 도시 마커 좌표도 오프셋을 더해 전체 그리드의 절대 좌표로 재매핑했다.
3. 커서가 지나간 자리마다 "파동 원점"(`{col, row, startTime}`)을 등록하고, `requestAnimationFrame` 루프가 매 프레임 `ringRadius = elapsed * WAVE_SPEED`만큼 퍼져나가는 링 모양 강도를 `Math.cos((distance - ringRadius) * k)`로 계산해 감쇠시키는 방식으로 눌림 파동을 구현했다.
4. 성능 문제 진단 후, 도트 객체에서 `pressIntensity`를 제거하고 `dot.index`(row-major 순번)만 남겼다. `buildGrid()` 이후 `nextTick()`에서 실제 DOM 엘리먼트 배열(`dotElements`)을 한 번 수집해두고, 파동 계산 결과를 `dotElements[dot.index].style.setProperty('--intensity', ...)`로 직접 써서 Vue 렌더 사이클을 완전히 우회했다.

   #### `src/components/practices/weather/KoreaMapDots.vue` (직접 DOM 조작으로 바꾼 핵심 부분)
   ```js
   let dotElements = []
   async function refreshDotElements() {
     await nextTick()
     if (!rootRef.value) return
     dotElements = Array.from(rootRef.value.querySelectorAll('.korea-map__dot'))
   }

   function tickRipples() {
     // ...ripple별 링 강도를 frameIntensity Map에 모은 뒤...
     frameIntensity.forEach((intensity, key) => {
       const dot = dotsByKey.get(key)
       const el = dot && dotElements[dot.index]
       if (el) el.style.setProperty('--intensity', intensity) // Vue 반응형을 거치지 않음
     })
     touchedLastFrame.forEach((key) => {
       if (!frameIntensity.has(key)) {
         const el = dotsByKey.get(key) && dotElements[dotsByKey.get(key).index]
         if (el) el.style.removeProperty('--intensity')
       }
     })
   }
   ```

5. 평면 디자인 피드백을 반영해 도트 CSS에서 `radial-gradient`/`box-shadow: inset`을 모두 제거하고 단색 배경 + `filter: brightness(calc(1 + var(--intensity, 0) * 0.9))`로 교체했다.
6. 화면 가장자리에 여백이 남는 문제(그리드가 `cols * DOT_PX` 고정 픽셀로 그려지다 보니 컨테이너 폭과 딱 맞지 않아 남는 부분에 배경색 띠가 보임)를 `grid-template-columns: repeat(cols, 1fr)`로 바꿔 해결했고, `.weather-map`의 `padding: 28px`도 제거해 도트가 뷰포트 끝까지 채워지게 했다.
7. 브라우저에서 확인 — 바다·육지가 완전히 평면 단색으로 보이는지, 가장자리까지 도트가 빈틈없이 채워지는지, 마우스를 빠르게 움직여도 눈에 띄는 끊김 없이 파동이 표시되는지 확인했다.

**트러블슈팅**
- **문제**: 통합 그리드로 바꾼 직후, `.korea-map` 요소의 실제 렌더링 높이가 CSS로 지정한 `height: 100%`를 무시하고 콘텐츠 한 줄(14px) 높이로만 잡혀, 한반도 그리드가 화면 맨 위 한 줄에만 짓눌린 채로 나타났다.
- **원인**: `.korea-map`의 부모(`.weather-map__grid-area`)가 `flex: 1`(= `flex-basis: 0%`)로 크기를 부여받는 flex 아이템인데, 퍼센트 높이(`height: 100%`)를 가진 자식은 이런 "grow로 크기가 결정되는" flex 아이템을 정의된 높이로 인식하지 못하는 경우가 있어 percentage-height 해석이 깨지는 CSS 특성이 원인이었다.
- **해결**: `.korea-map`을 `height: 100%` 대신 `position: absolute; inset: 0;`으로 바꿔, 퍼센트 높이 해석에 기대지 않고 부모의 패딩 박스를 직접 채우도록 했다.
- **문제**: 파동 로직을 다 고친 뒤에도 자동화 브라우저 탭에서 시각적으로 애니메이션이 전혀 재생되지 않는 것처럼 보였다.
- **원인**: `document.visibilityState`가 `hidden`으로 보고되는 자동화 탭 환경이라 Chrome이 `requestAnimationFrame` 콜백 자체를 완전히 중단시키고 있었다(일반 사용자가 눈으로 보는 포그라운드 탭에서는 발생하지 않는, 테스트 환경 고유의 제약).
- **해결**: 파동 공식(링 반경·감쇠)을 Node.js로 독립 실행해 원점에서 거리·시간에 따라 정확히 링 모양으로 퍼져나가는지 수치로 검증하는 방식으로 로직 정확성을 대신 확인했다.

**결과**
- `/map` 진입 시 바다·육지 모두 완전히 평면(단색)으로 보이고, 화면 가장자리까지 도트가 여백 없이 채워짐을 확인했다.
- 커서를 움직이면 지나간 자리에서 밝기가 링 모양으로 퍼졌다 사라지는 파동이 재생되고, 이 경로가 더 이상 Vue 반응형을 거치지 않아(수천 개 도트 재렌더 → 수십~백여 개 DOM 직접 조작으로 축소) 체감 렉이 크게 줄었다.

![Day 4 지도 인터랙션 — 평면 그리드, 가장자리까지 채워진 도트](./images/day4/14-map-flat-edge-to-edge.jpg)

**느낀점**
- "이게 아니다"라는 피드백을 여러 번 받으며 캐릭터 → 오버레이 눌림 효과 → 입체 그리드 → 평면 그리드로 계속 갈아엎었는데, 매번 완전히 새로 만들기보다 "왜 이번 결과물이 기대와 다른가"를 구조적으로 진단(좌표계 분리, 입체 효과, Vue 반응형 비용)한 뒤 그 원인 하나만 정확히 고치는 식으로 접근하니 반복될수록 오히려 코드가 더 단순해졌다.
- Vue의 반응형 시스템은 굉장히 편리하지만 "같은 컴포넌트 렌더 함수 안의 대량 `v-for`"와 "초당 수십 번 바뀌는 애니메이션 값"의 조합은 안티패턴에 가깝다는 걸 체감했다. 프레임 단위로 갱신되는 값은 반응형 상태로 다루지 않고 DOM을 직접 조작하는 것이, Vue를 "안 쓰는" 게 아니라 오히려 Vue가 잘하는 부분(구조적 렌더링)과 못하는 부분(고빈도 애니메이션)을 구분해서 쓰는 것이라는 걸 배웠다.

---

## 6. 즐겨찾기·검색·단위 전환 상단 네비게이션 통합 및 지도·상세 화면 기능 보강

**요구사항**
- 즐겨찾기 칩과 검색창을 "날씨"/"지도"/"실습 모음" 링크가 있는 상단 네비게이션으로 옮겨 어느 화면에서든 쓸 수 있게 해달라는 요청에 이어, 이후 세션에서 9가지 세부 요구사항이 추가됐다: ① 지도 탭 검색으로 해당 도시 팝업 열기, ② 홈 화면 렉 최적화, ③④ 지도 탭 즐겨찾기로 팝업 열기, ⑤ 단위(℃/℉) 전환을 지도 팝업·상세 화면에서도, ⑥ 상세 화면에 지도 팝업과 동일한 정보 표시, ⑦ 더미 날씨 데이터 토글, ⑧ 즐겨찾기 클릭 시 삭제 가능한 메뉴, ⑨ 지도 가장자리 여백 제거(5번 항목과 함께 해결), ⑩ 과제 채점 기준(`docs/checklist.md`) 이탈 여부 점검. 마지막으로 강사가 제시한 힌트(정렬 기준, 평균/최고·최저 기온 computed 등) 중 아직 구현하지 않은 부분도 함께 추가해달라는 요청을 받았다.

**사고 과정**
- 상단 네비게이션 전역화 자체는 단순했지만, "지도 탭에서 즐겨찾기 누르면 지역 팝업"과 "즐겨찾기 누르면 삭제 팝업"이 같은 클릭에 대해 다른 동작을 요구하는 것처럼 보여, 사용자에게 확인해 "클릭 시 '지도에서 보기'/'즐겨찾기 해제' 두 옵션이 있는 작은 메뉴"로 절충하기로 확정했다.
- 홈 화면 렉의 원인을 조사해보니 `WeatherCard.vue`가 카드마다 `DotMatrixIcon`을 `animated="true"`로 띄워, 9개 도시 카드가 각자 80ms마다 36×36=1,296칸 그리드를 재계산하고 있었다. 44px짜리 작은 카드 아이콘에서는 이 미세한 애니메이션이 어차피 잘 보이지 않으므로, 리스트 카드에서는 끄고 크게 보여줄 이유가 있는 지도 팝업·상세 화면에서만 켜는 쪽으로 정리했다.
- 지도 팝업과 상세 화면에 같은 정보를 두 번 구현하면 나중에 둘이 어긋나기 쉬우므로, 복붙 대신 공용 컴포넌트(`WeatherStatsPanel`)로 추출해 두 화면이 구조적으로 항상 같은 걸 보여주게 했다.
- 체크리스트를 다시 읽어보며 발견한 것: 이전 세션에서 검색창을 상단 네비게이션으로 옮기며 `WeatherHomeView.vue`(=체크리스트의 `WeatherParent`)에서 `<SearchBar>` 렌더링 자체를 없앴는데, 이는 Day2 요구사항("SearchBar를 WeatherParent 안에서 props+emit으로 사용")과 어긋나는 변경이었다. 되돌리는 대신 `WeatherHomeView.vue` 안에도 같은 전역 `searchStore`를 바라보는 `<SearchBar>`를 다시 배치해, 체크리스트가 요구하는 구조와 이번에 추가한 전역 검색 UX를 동시에 만족시켰다. 반대로 Day3 요구사항("UnitToggler를 메인·상세 화면 모두에 적용")은 상세 화면에 토글이 아예 없었던 걸 발견해 이번에 함께 채워 넣었다.

**해결 과정**
1. `src/stores/searchStore.js`, `src/stores/demoStore.js`를 신규 작성했다(기존 `favoritesStore.js`와 동일한 함수형 setup 스토어 패턴). `searchStore`는 전역 검색어를, `demoStore`는 더미 데이터 사용 여부(`useDummyData`)를 담는다.
2. `src/App.vue`의 `.app-nav`에 즐겨찾기 칩·검색창·데모 토글·단위 토글을 배치했다. 즐겨찾기 칩은 클릭 시 열리는 작은 메뉴(`app-nav__favorite-menu`)에서 "지도에서 보기"(`/map?city=id`로 이동)와 "즐겨찾기 해제"(`favoritesStore.toggleFavorite`)를 선택할 수 있게 했고, 문서 클릭 리스너로 메뉴 바깥을 클릭하면 닫히게 했다.

   #### `src/App.vue` (즐겨찾기 메뉴 발췌)
   ```js
   function viewOnMap(city) {
     openMenuFor.value = null
     router.push({ name: 'weather-map', query: { city: city.id } })
   }
   function removeFavorite(city) {
     openMenuFor.value = null
     favoritesStore.toggleFavorite(city.id)
   }
   function handleOutsideClick(event) {
     if (!event.target.closest('.app-nav__favorite-item')) openMenuFor.value = null
   }
   ```

3. `src/components/practices/weather/WeatherStatsPanel.vue`를 신규 작성했다 — `city` prop 하나로 아이콘+상태+`DotStatBar` 5개(습도·구름량·가시거리·기압·낮 진행률)+체감/최저/최고/풍속 요약줄을 렌더링한다. 이때 체감·최저·최고 온도도 현재 단위(℃/℉)에 맞춰 변환하도록 고쳐, 기존에 항상 섭씨 원본으로만 보이던 사소한 불일치도 함께 바로잡았다. `WeatherMapView.vue`의 팝업과 `WeatherDetailView.vue`가 이 컴포넌트 하나를 공유한다.
4. `src/views/WeatherMapView.vue`에 `watch(() => searchStore.query, ...)`를 추가해, 검색어가 도시 이름과 **정확히 일치**할 때만(부분 일치로 하면 첫 글자만 쳐도 팝업이 열려버림) `selectCityById`를 호출하도록 했다. 팝업 헤더에 `UnitToggler`도 추가했다.
5. `src/services/weatherApi.js`에 `DUMMY_CONDITIONS`(6가지 날씨) 순환 배정과 `getDummyWeather(city, index)`를 추가해, API 호출 없이 즉시 6가지 아이콘/애니메이션을 확인할 수 있게 했다. `WeatherHomeView.vue`·`WeatherMapView.vue`의 데이터 로드 함수가 `demoStore.useDummyData`를 보고 실제 API 대신 이 함수로 분기하도록 했다.
6. `src/components/practices/weather/WeatherCard.vue`의 `DotMatrixIcon`을 `animated="false"`로 바꿔 홈 화면 렉을 해소했다.
7. `WeatherHomeView.vue`에 강사 힌트를 반영한 로직을 추가했다: 정렬 기준(`sortBy`, `v-model`로 이름순/기온순 선택 UI), 정렬 기준이 바뀔 때만 재계산되는 `sortedWeatherList` computed, 즐겨찾기 개수·검색 결과 개수·평균 기온·최고/최저 기온 도시 computed 4종, 정렬 기준 변경 시 콘솔 로그를 남기는 `watch`. 그리고 체크리스트 준수를 위해 `#search` 슬롯에 `searchStore`를 바라보는 `<SearchBar>`를 다시 배치했다.
8. `WeatherMapView.vue`의 `.weather-map` padding을 0으로 바꿔 지도 가장자리 여백을 완전히 제거했다(5번 항목의 그리드 `1fr` 전환과 함께 적용).
9. 브라우저에서 전체 플로우를 확인했다 — 상단 검색창에 도시명을 정확히 입력하면 어느 화면에 있든 값이 유지되고 지도로 이동 시 해당 팝업이 뜸, 즐겨찾기 칩 클릭 → 메뉴 → 지도 이동/삭제 각각 정상 동작, 지도 팝업·상세 화면 양쪽에서 단위 전환 버튼으로 ℃/℉가 즉시 바뀌고 체감/최저/최고까지 함께 변환됨, 데모 토글로 6가지 날씨가 즉시 나타남, 홈 화면에 정렬·통계 요약줄이 표시됨을 각각 확인했다.

**트러블슈팅**
- **문제**: 검증 도중 두 개의 개발 서버 프로세스가 동시에 떠 있어(5173에 좀비 프로세스, 5176에 새 프로세스) 브라우저가 옛 코드로 뜬 화면을 보여주는 바람에 한동안 수정 사항이 반영 안 된 것처럼 보였다.
- **원인**: 이전 세션에서 종료되지 않은 `npm run dev` 프로세스가 5173 포트를 계속 점유하고 있었다.
- **해결**: `lsof`로 점유 중인 프로세스를 확인해 정리한 뒤 서버를 깨끗하게 재시작했다.

**결과**
- 검색창·즐겨찾기·단위 전환이 모든 화면에서 동일하게 동작하고, 지도 팝업과 상세 화면의 상세 정보가 완전히 통일됐다. 홈 화면은 카드 애니메이션을 꺼서 체감 성능이 개선됐고, 정렬·통계 요약·더미 데이터 토글이 추가됐다. 체크리스트 재검토로 찾아낸 두 가지 이탈(SearchBar 위치, UnitToggler 미적용)도 이번 작업으로 함께 해소했다.

![Day 4 상단 네비게이션 — 즐겨찾기 메뉴 팝오버](./images/day4/17-nav-favorite-menu-popover.jpg)
![Day 4 지도 검색 팝업 · 단위 전환](./images/day4/15-map-search-popup.jpg)
![Day 4 홈 화면 — 검색·정렬·통계 요약](./images/day4/18-home-search-sort-stats.jpg)
![Day 4 홈 화면 — 더미 데이터 토글](./images/day4/19-home-dummy-data-toggle.jpg)
![Day 4 상세 화면 — 지도 팝업과 통일된 정보 패널](./images/day4/20-detail-shared-stats-panel.jpg)

**느낀점**
- 기능을 추가하기 전에 "이미 문서화된 요구사항(체크리스트)에서 벗어난 부분이 있는지" 스스로 되짚어보는 과정이 유용했다 — 새 기능을 붙이는 데만 집중하면 이전에 잘 지키던 기준을 조용히 어기게 될 수 있다는 걸 직접 겪었다.
- 같은 정보를 두 화면에 보여줘야 할 때 복붙이 아니라 공용 컴포넌트로 묶으면, "두 화면이 같아야 한다"는 요구사항이 유지보수 규칙이 아니라 코드 구조 자체로 보장된다는 걸 다시 확인했다(체감/최저/최고 온도 단위 변환 버그도 컴포넌트를 합치는 과정에서 자연스럽게 함께 발견하고 고칠 수 있었다).

---

## 7. 지도 인터랙션 2차 개선 — 확대/축소, 픽셀 말풍선 툴팁, 파동 육지 제외·자연스러움·재최적화, 도시 도트 날씨 시각화

**요구사항**
- 참고 이미지 두 장을 기준으로 확대/축소 기능을 추가해달라는 요청을 받았다: 기본 진입 시 이미지 4 정도 배율로 확대돼 있고, 최대로 축소했을 때 기존 화면(이미지 5)이 되도록. 커서가 향하는 방향으로 화면이 살짝 끌려오는 느낌도 함께 요청받았다.
- 주요 지역 호버 시 뜨는 툴팁을 참고 이미지의 픽셀 말풍선으로 바꾸고, 안에 도시명과 간단한 날씨 정보(예: "대구 맑음")를 넣어달라는 요청을 받았다. 이모지는 폰트 폴백 문제가 예상되면 텍스트로 대체해도 된다는 조건이 붙었다.
- 커서 파동 효과가 한반도 육지 픽셀 위에서도 적용되던 것을, 바다에서만 나타나도록 제한해달라는 요청을 받았다.
- 파동이 여전히 "핑(ping)"처럼 보인다는 피드백과 함께, 최우선 조건은 성능이라는 전제로 더 자연스러운 파도 느낌으로 개선해달라는 요청을 받았다.
- 도시 도트가 색상만으로 표시돼 눈에 잘 안 띄고, 기온·강수 등 날씨 정보가 지도에서 시각적으로 드러나지 않는다는 점을 개선해달라는 요청을 받았다.

**사고 과정**
- 이미 "Vue 반응형을 우회해 `dotElements[i].style`에 직접 쓰기"로 한 번 최적화해둔 파동 엔진이 있었으므로, 그 구조를 갈아엎지 않고 유지·강화하는 방향으로 접근했다. 특히 성능이 최우선 조건으로 명시됐기 때문에, 새 기능(줌·말풍선·날씨 시각화) 각각을 "매 프레임 JS 비용을 추가하는가"라는 기준으로 먼저 걸러냈다.
- 확대/축소는 두 가지 방식을 저울질했다 — ① 줌 배율에 맞춰 `DOT_PX`를 바꿔 그리드를 다시 만드는 방식, ② 도트 개수는 그대로 두고 `CSS transform: scale()`만 적용하는 방식. ①은 줌할 때마다 수천 개 DOM을 다시 만들어야 해 렉의 원인이 되므로, GPU 합성만으로 처리되는 ②(CSS transform)를 선택했다. 이렇게 하면 커서→그리드 셀 좌표 변환도 `getBoundingClientRect()`가 이미 transform이 반영된 값을 주기 때문에 별도 역행렬 계산 없이 그대로 쓸 수 있다는 부수 이점이 있었다.
- 파동을 "바다에서만" 적용하는 요구사항은 동시에 최적화 기회이기도 했다. 육지 칸을 계산에서 아예 건너뛰면 시각적 요구사항과 성능 개선을 한 번에 만족시킬 수 있었다.
- 기존 파동 로직이 느렸던 근본 원인을 다시 짚어보니, `"${col},${row}"` 형태의 **문자열 키 Map**을 프레임마다 새로 만들고 조회하던 부분이 가장 큰 비용이었다(문자열 생성·해싱은 숫자 연산보다 훨씬 비싸다). 이를 `row*cols+col` 형태의 **평면 정수 인덱스**로 바꾸고, 매 프레임 전체 격자를 훑는 대신 "지난 프레임에 건드린 칸만 기록해뒀다가 그 칸만 지우는" 방식(dirty-list)으로 바꾸면 문자열 연산 자체가 완전히 사라진다고 판단했다. 파도처럼 보이게 하는 부분은 이미 계산 중인 `distance` 값 하나로 감속 반경·2차 마루·제곱 감쇠를 추가할 수 있어 추가 루프 없이 처리 가능했다.
- 날씨 시각화는 "성능 최우선"과 정면으로 부딪힐 수 있는 요구라, 애니메이션 대상을 도시 도트(9개)로만 한정하고 전부 CSS 키프레임으로 처리하기로 했다 — 이러면 매 프레임 JS 비용이 0이고, 조건별 링 펄스·빗방울·명멸 등은 브라우저 컴포지터가 처리한다.

**해결 과정**
1. `src/components/practices/weather/KoreaMapDots.vue`에 줌 뷰포트(`.korea-map__viewport`)를 추가하고, 휠/트랙패드(`wheel` 이벤트, 트랙패드 핀치는 `ctrlKey`로 동일하게 들어옴)로 `scale`을 곱셈식(`Math.exp(-deltaY * k)`)으로 갱신하며 커서 아래 지점이 그대로 고정되도록 pan을 보정했다. `scale===1`일 때 pan 허용 범위가 `[0,0]`으로 자동으로 잠겨, 기존에 해결해둔 "가장자리 여백 없음" 요구사항이 최대 축소 상태에서도 그대로 유지된다.

   #### `src/components/practices/weather/KoreaMapDots.vue` (줌 앵커 보정)
   ```js
   function handleWheel(event) {
     event.preventDefault()
     const rect = rootRef.value.getBoundingClientRect()
     const cx = event.clientX - rect.left
     const cy = event.clientY - rect.top
     const newScale = clamp(scale * Math.exp(-event.deltaY * ZOOM_SENSITIVITY), MIN_SCALE, MAX_SCALE)
     if (newScale === scale) return
     // 커서 아래 지점이 확대/축소 후에도 그 자리에 그대로 머물도록 pan을 보정한다.
     panX = cx - (cx - panX) * (newScale / scale)
     panY = cy - (cy - panY) * (newScale / scale)
     scale = newScale
     clampPan()
     applyTransform()
   }
   ```
2. 커서가 화면 중심에서 벗어난 방향으로 지도가 살짝 끌려오는 효과는, 커서 위치 비율을 pan의 "목표값"으로 매핑해두고 기존 파동 애니메이션 루프 안에서 실제 pan을 그 목표값으로 매 프레임 보간(lerp)하는 식으로 구현했다. 새 애니메이션 루프를 따로 만들지 않고 기존 루프에 얹어, rAF 인스턴스가 늘어나지 않게 했다.
3. 커서→그리드 셀 좌표 변환을 `.korea-map__grid`의 `getBoundingClientRect()` 기준 비율 계산으로 바꿨다. 이 rect는 이미 줌/팬 transform이 반영된 화면상의 실제 위치이므로, 배율이 얼마든 별도 역변환 코드 없이 정확한 칸 좌표를 구할 수 있었다.
4. 픽셀 말풍선 툴팁을 새로 만들었다. 참고 이미지처럼 모서리가 한 칸씩 깎인 실루엣은 `clip-path` 계단형 폴리곤으로, 말풍선 꼬리는 잉크색·paper색 사각형 두 겹을 겹쳐 표현했다. 이모지 대신 `condition` 코드 → 한글 라벨 고정 맵(`맑음/구름/비/눈/뇌우/안개`)을 써서 "대구 맑음"처럼 짧고 길이가 일정한 텍스트만 넣었다 — API/더미 데이터의 `status` 문자열은 길이가 들쭉날쭉해 말풍선 폭이 흔들리는 문제가 있어 쓰지 않았다. 말풍선 자체는 줌 뷰포트 바깥(`.korea-map` 직계)에 둬서 배율과 무관하게 항상 같은 크기로 뜨게 했다.
5. 파동 엔진을 재작성해 문자열 키 `Map`/`Set`을 모두 없애고, `landMask`(`Uint8Array`)·`frameScratch`(`Float32Array`) 두 개의 평면 인덱스 배열로 바꿨다. 매 프레임 "지난 프레임에 건드린 인덱스"만 먼저 지우고, 이번 프레임에 새로 건드린 인덱스만 기록해두는 dirty-list 방식이라 전체 격자를 훑는 연산이 사라졌다. 루프 안에서 `if (landMask[idx]) continue`로 육지 칸을 완전히 건너뛰어 요구사항(파동은 바다에서만)과 계산량 절감을 동시에 만족시켰다.

   #### `src/components/practices/weather/KoreaMapDots.vue` (파동 계산 — 육지 스킵 + dirty-list)
   ```js
   for (const idx of prevTouched) {
     frameScratch[idx] = 0
     dotElements[idx]?.style.removeProperty('--intensity')
   }
   // ...
   for (let c = minCol; c <= maxCol; c++) {
     const idx = rowBase + c
     if (landMask[idx]) continue // 육지는 파동 계산에서 완전히 제외
     // ...거리 계산·강도 반영은 바다 칸에서만 실행
   }
   ```
6. "핑"처럼 보이던 파동을 "물결"처럼 보이게, 계산량을 늘리지 않고 형태만 바꿨다. 반경이 등속이 아니라 `MAX_R * (1 - exp(-t/τ))`로 감속하며 퍼지게 하고, 이미 계산 중인 `distance` 값에 위상이 살짝 어긋난 2차 마루를 더해 물결이 다발로 보이게 했으며, 감쇠도 선형이 아닌 제곱(`envelope²`)으로 바꿔 끝맺음을 부드럽게 했다.
7. 도시 도트에 조건별 클래스(`is-condition-sun` 등)와 기온을 파랑(추움)~빨강(더움)으로 매핑한 `--pulse-color` 변수를 부여하고, 나머지는 전부 CSS 키프레임으로 처리했다(맑음/구름 - 링 펄스, 비 - 물방울 낙하, 눈/안개 - 느린 명멸, 뇌우 - 불규칙 섬광). 도시가 9개뿐이라 이 경로는 매 프레임 JS 비용이 없다. `prefers-reduced-motion` 사용자에게는 애니메이션을 껐다.
8. `npx vite build`로 빌드 오류 여부를 먼저 확인한 뒤, 브라우저에서 실제 동작을 점검했다. 자동화 브라우저 탭은 `document.visibilityState`가 `hidden`으로 보고돼 `requestAnimationFrame`이 완전히 멈추는 제약(이전 작업에서도 겪은 문제)이 있어, 줌(동기적으로 transform을 쓰므로 rAF 불필요)은 실제 `WheelEvent`를 디스패치해 브라우저에서 직접 검증했고, rAF에 의존하는 파동 로직은 동일한 수식을 Node.js로 독립 실행해 육지 제외·감쇠 정확성을 수치로 검증했다.

**트러블슈팅**
- 문제: 링 스캔 범위를 넓힌 뒤(감속 반경이 최대치에 가까워질수록), 프레임당 순회하는 셀 수(scanned)가 기존 고정 반경 5 정사각 박스(121칸)보다 오히려 많아지는 구간(t≈400~900ms에서 최대 221칸)이 있었다.
- 원인: 감속 공식상 반경이 `WAVE_MAX_RADIUS(6)+BAND(1.6)`까지 커질 수 있어, 시간이 지날수록 스캔 바운딩 박스 자체가 옛 구현보다 커지기 때문이었다.
- 해결: 다만 이 "scanned" 수치는 저렴한 사전 필터(뺄셈·비교)일 뿐이고, 비용이 큰 `Math.sqrt`/`Math.cos` 연산은 실제로 강도가 반영되는 "touched" 셀(Node 검증 기준 프레임당 13~71개)에서만 실행된다. 옛 구현은 박스 안 121칸 전부에 대해 무조건 `Math.hypot`+`Math.cos`를 실행했으므로, 비싼 연산 횟수 기준으로는 여전히 뚜렷한 개선이다. `WAVE_MAX_RADIUS`/`BAND`를 억지로 더 줄여 "스캔 수까지 항상 옛 구현보다 작게" 만드는 것도 가능했지만, 저렴한 사전 필터 개수를 더 줄이는 것보다 시각적 자연스러움(파동이 충분히 넓게 퍼지는 느낌)을 우선했다 — CLAUDE.md의 단순성 우선 원칙에 따라, 실질적 이득이 없는 데까지 파고들어 코드를 더 복잡하게 만들지 않기로 했다.
- 문제: Chrome 자동화 탭으로 확대/축소를 검증하려 `computer` 도구의 `scroll` 액션을 썼는데, 화면은 바뀌는 것처럼 보였지만 실제로는 `wheel` DOM 이벤트가 전혀 발생하지 않고 있었다(직접 등록한 `window` 리스너의 카운터가 0으로 유지됨).
- 원인: 자동화 탭의 `scroll` 제스처가 페이지의 `wheel` 이벤트를 우회하는 방식으로 동작하는 것으로 보였다. 화면이 바뀌어 보인 건 이전에 수동으로 디스패치했던 `WheelEvent`의 잔여 상태였을 뿐, 새 `scroll` 액션의 효과가 아니었다.
- 해결: `new WheelEvent({ deltaY, clientX, clientY })`를 `.korea-map` 엘리먼트에 직접 `dispatchEvent`하는 방식으로 전환해 검증했다. 이 방식으로는 최대 축소 시 `translate(0px, 0px) scale(1)`, 최대 확대 시 정확히 `scale(2.4)`에서 멈추는 것을 확인했다.

**결과**
- 지도 진입 시 이미지 4 비율(2.4배)로 확대돼 있고, 휠/트랙패드로 축소하면 정확히 이미지 5(기존 화면, 여백 없음)에서 더 이상 축소되지 않으며, 확대도 진입 배율에서 멈추는 것을 `WheelEvent` 디스패치 + transform 값 검증으로 확인했다.
- 줌 앵커(커서 아래 지점 고정)를 좌표 역산으로 검증한 결과, 오차 10px 안팎(뷰포트 대비 1% 미만)으로 커서 아래 지점이 유지됨을 확인했다.
- 도시 도트 호버 시 "대전 맑음" 형태의 픽셀 말풍선이 뜨고, 줌 뷰포트 바깥에 위치해 배율과 무관하게 크기가 고정되는 것을 스크린샷으로 확인했다.
- 육지 중심에 파동을 쏘는 시나리오를 Node.js로 재현했을 때 육지 칸에는 단 하나도 강도가 반영되지 않음을 확인했고, 반대로 바다 칸에서는 시간에 따라 링이 정상적으로 퍼지고 감쇠함을 확인했다.
- 도시 클릭 → 팝업 오픈, ℃/℉ 토글이 기존과 동일하게 동작함을 회귀 확인했다.

![Day 4 지도 확대 — 기본 진입 배율](./images/day4/21-map-zoom-default.jpg)
![Day 4 지도 축소 — 최대 축소 상태(여백 없음)](./images/day4/22-map-zoom-min.jpg)
![Day 4 픽셀 말풍선 툴팁](./images/day4/23-map-pixel-bubble-tooltip.jpg)

**느낀점**
- "성능 최우선"이라는 제약이 걸리면 새 기능을 붙일 때마다 "이게 매 프레임 비용을 늘리는가"를 먼저 따지는 습관이 생긴다는 걸 느꼈다. 도시 도트 애니메이션을 CSS 키프레임으로만 처리한 것도, 줌을 transform 하나로 처리한 것도 결국 "JS가 매 프레임 할 일을 최대한 줄이자"는 같은 판단에서 나온 선택이었다.
- 자동화 브라우저로 인터랙션을 검증할 때 도구가 "그럴듯해 보이는" 화면을 만들어내더라도 실제로 의도한 이벤트 경로를 탔는지는 별도로 확인해야 한다는 걸 다시 배웠다 — `scroll` 제스처가 실제 `wheel` 이벤트를 발생시키지 않는다는 걸 카운터를 심어보고 나서야 알았고, 그 뒤로는 "화면이 바뀌었다"가 아니라 "이벤트가 발생했다"를 검증 기준으로 삼았다.

---

## 8. 지도 인터랙션 3차 개선 — 도시 도트 호버 전용 효과, 바다 흐름 레이어, 픽셀 커서, 대륙 확장

**요구사항**
- 도시 도트가 항상 크고 항상 펄스가 재생돼 부담스럽다는 피드백을 받았다. 평상시엔 주변 지형 도트와 같은 크기이되, 커서를 올렸을 때만 뚜렷하게 커지고 반짝여야 하며, 그 색도 기온이 아니라 지금 날씨(맑음/비/눈 등)를 더 잘 드러내야 한다는 요청을 받았다.
- 바다 전체에 "흐르는 파도" 같은 상시 효과를 원하지만, 스스로도 "최적화가 많이 필요"하다고 인지하고 있으니 기존 커서 파동과 타협해 최선의 결과를 내달라는 요청을 받았다.
- 기본 커서와 클릭 시 커서로 쓸 픽셀 손가락 이미지 2장을 제공받았다.
- 한반도 북쪽으로 이어지는 대륙을 참고 이미지를 바탕으로 픽셀화해 추가하고, 한반도보다 살짝 어두운 색으로 구분하며, 여기서도 파동 계산은 제외해달라는 요청을 받았다.

**사고 과정**
- 도시 도트 효과는 "평소엔 지형과 동일 크기, 호버 시에만 확대·펄스"라는 조건이 이미 존재하던 `.is-city:hover { transform: scale(1.9) }` 규칙 위에 자연스럽게 얹을 수 있었다. 기존엔 `hoveredDot`이라는 JS 상태를 말풍선 표시에 쓰고 있었지만, 시각 효과(확대·글로우·펄스)는 순수 CSS `:hover` 의사 클래스만으로 충분해 별도 JS 상태 추적을 늘리지 않았다. 색상도 기온 기반 hue 계산 함수를 조건(condition) → 강조색 매핑으로 바꿔치기만 하면 돼 변경 범위가 작았다.
- 바다 흐름 효과가 까다로운 지점은 "도트가 스크린 크기에 따라 최대 수천 개까지 생길 수 있다"는 것이었다. 도트마다 개별 애니메이션을 걸면 프레임마다 수천 개를 리페인트해야 해 사용자가 우려한 그대로 무거워진다. 대신 "그리드 밑에 깔리는 배경 레이어 하나만 흘려보내고, 바다 도트에 살짝 투명도를 줘서 그 흐름이 비쳐 보이게 하면 어떨까"라는 아이디어로 방향을 잡았다 — 이러면 애니메이션 대상이 도트 수와 무관하게 항상 "엘리먼트 1개"로 고정되고, 그마저도 `transform: translate()`만 쓰면 GPU 합성만으로 처리돼 리페인트 자체가 발생하지 않는다. 이게 "도트 단위 계산을 하나도 늘리지 않는" 타협안이라고 판단했다.
- 픽셀 커서는 CSS `cursor: url(...)`와 `:active` 의사 클래스만으로 JS 없이 구현 가능하다고 보고, 제공받은 이미지를 그대로 쓰기보다 Pillow로 32×32 NEAREST 리샘플링해 픽셀 느낌을 유지한 채 프로젝트 안에 자산으로 편입했다.
- 대륙 이미지를 직접 분석해보니(Pillow로 그리드 크기로 재래스터화) 정밀한 해안선이라기보다 "이 위가 대륙"이라는 대략적 참고에 가까웠다. 그대로 픽셀 단위 복제를 시도하기보다 같은 느낌(꽉 찬 덩어리 + 들쭉날쭉한 해안선)을 살려 새 매트릭스를 직접 설계하는 쪽을 택했다. 처음엔 대륙을 14행 높이로 크게 설계했는데, 실제 화면에서 확인해보니 한반도가 그리드 안에서 항상 세로 중앙에 배치되는 구조라 그 위 여백(`koreaOffsetRow`)이 생각보다 훨씬 좁아(테스트 환경에서 5행) 대부분이 화면 밖으로 잘려나갔다 — 높이를 줄이는 쪽으로 재설계했다.

**해결 과정**
1. `src/assets/cursors/`에 사용자가 제공한 두 이미지를 Pillow로 32×32 `NEAREST` 리샘플링해 저장했다.

   #### `/tmp/make_cursors.py` (일회성 스크립트)
   ```python
   from PIL import Image
   def make(src, dst, size=32):
       im = Image.open(src).convert("RGBA")
       im = im.resize((size, size), Image.Resampling.NEAREST)
       im.save(dst)
   ```
2. `src/components/practices/weather/KoreaMapDots.vue`의 `pulseColor(city)`를 기온 기반 hue 계산에서 조건(condition) 기반 강조색 매핑으로 바꿨다. 마커 자체 배경색(`CONDITION_COLORS`)은 날씨 아이콘 등 다른 화면과 값을 공유해서 그대로 두고, 호버 링 색만 채도 높은 새 팔레트로 분리했다.

   #### `src/components/practices/weather/KoreaMapDots.vue`
   ```js
   const CONDITION_ACCENT_COLORS = {
     sun: '#ff9d3d', cloud: '#8fa6ad', rain: '#2f80ed',
     snow: '#8fe3f0', thunderstorm: '#8e5bd6', fog: '#6b7b80',
   }
   function pulseColor(city) {
     return CONDITION_ACCENT_COLORS[city.condition] ?? CONDITION_ACCENT_COLORS.sun
   }
   ```
3. `.is-city`의 상시 `transform: scale(1.35)`와 상시 `box-shadow` 링을 제거해 평상시엔 일반 도트와 완전히 같은 크기가 되게 하고, 확대·글로우·조건별 펄스/명멸/빗방울 애니메이션을 전부 `:hover`(및 `.is-city.is-condition-X:hover::after`) 조건 아래로 옮겼다.
4. 바다 흐름 효과를 `.korea-map__grid` 바로 아래 깔리는 `.korea-map__sea-flow` 레이어 하나로 구현했다. 사선 반복 그라데이션을 `transform: translate()`로만 흘려보내고, 바다 도트 배경에 8%의 투명도(`rgba(124,192,203,0.92)`)를 줘서 이 흐름이 도트 표면에 은은하게 비쳐 보이게 했다. 커서 파동(`--intensity` → `filter: brightness()`)은 그대로 각 도트에 남아 있어 서로 다른 레이어로 자연스럽게 겹친다.

   #### `src/components/practices/weather/KoreaMapDots.vue`
   ```css
   .korea-map__sea-flow {
     position: absolute;
     inset: -50% -50%;
     background: repeating-linear-gradient(120deg,
       rgba(255,255,255,.14) 0, rgba(255,255,255,.14) 18px, transparent 18px, transparent 70px);
     animation: sea-flow-drift 14s linear infinite; /* transform만 사용 — GPU 합성, 도트 수와 무관하게 비용 상수 */
   }
   ```
5. `.korea-map`에 `cursor: url('.../point.png') 6 2, pointer;`, `.korea-map:active`에 `cursor: url('.../grab.png') 10 8, pointer;`를 걸어 기본/클릭 커서를 픽셀 이미지로 바꿨다. 버튼을 떼면 자동으로 기본 커서로 복귀해 별도 JS 상태 관리가 필요 없다.
6. 대륙 참고 이미지를 Pillow로 지도 그리드와 비슷한 해상도(34×18)로 재래스터화해 분석해보니 정밀한 해안선이 아니라 대략적인 덩어리 참고에 가까웠다. 이를 바탕으로 `CONTINENT_MATRIX`(32열×7행, 위쪽은 넓고 아래로 갈수록 한반도 북단 폭에 맞춰 좁아지는 쐐기 모양)를 직접 설계하고, `buildGrid()`의 셀 판정 로직에 "한반도 매트릭스 안인가"뿐 아니라 "대륙 매트릭스 안인가"도 함께 검사하도록 확장했다. 대륙에 속한 칸은 `isLand: true`(파동 계산 제외용), `isContinent: true`(색상 구분용)로 표시했다.

   #### `src/components/practices/weather/KoreaMapDots.vue`
   ```js
   const continentCol = col - continentOffsetCol
   const continentRow = row - continentOffsetRow
   const isContinent =
     !isKoreaLand && continentCol >= 0 && continentCol < CONTINENT_W &&
     continentRow >= 0 && continentRow < CONTINENT_H &&
     CONTINENT_MATRIX[continentRow][continentCol] === '1'
   const isLand = isKoreaLand || isContinent
   ```
7. `.is-continent`에 한반도 육지색(`#f3ebd9`)보다 약 14% 어둡게 계산한 `#d1cabb`를 지정해 색으로 구분되게 했다.
8. `npx vite build`로 오류 여부를 먼저 확인한 뒤, 실제 브라우저에서 `WheelEvent`/`MouseEvent`를 디스패치해 회귀 없음(도시 클릭 팝업, 줌 클램프)과 새 기능(대륙 위 파동 미발생, 커서 이미지 200 응답)을 함께 검증했다.

**트러블슈팅**
- 문제: `CONTINENT_MATRIX`를 처음 14행 높이로 설계했을 때, 최대 축소(스케일 1) 상태에서 대륙의 대부분이 화면 위로 잘려 보이지 않았다.
- 원인: 한반도가 그리드 안에서 항상 세로 중앙에 배치되는 구조라, 그 위쪽 여백(`koreaOffsetRow`)은 컨테이너 높이에 따라 달라지는데 흔한 가로로 넓은 창 비율에서는 5~10행 정도밖에 안 됐다. 게다가 최대 축소 상태에서는 팬(pan)이 `[0,0]`으로 잠기는 게 의도된 동작(가장자리 여백 없음 유지)이라, 사용자가 위로 스크롤해서 볼 수도 없었다.
- 해결: 대륙 높이를 7행으로 줄여 흔한 여백 안에 항상 들어오게 재설계했다.
- 문제: 대륙과 한반도를 재배치한 첫 시도에서, 두 매트릭스의 그리드 행이 서로 인접(대륙 마지막 행 바로 아래에 한반도 첫 행)하도록만 맞췄는데도 확대해서 보니 두 육지 사이에 바다색 틈이 뚜렷이 보였다.
- 원인: 원(circle) 그리드에서는 서로 다른 행에 있는 두 도트가 대각선으로만 걸쳐 있으면(직접 겹치는 열이 없으면) 원의 기하학적 특성상 시각적으로 떨어져 보인다. 실제로 두 매트릭스의 육지 열이 겹치지 않고 대각선으로 스치듯만 배치돼 있었다.
- 해결: 대륙의 마지막 3행이 한반도의 첫 3개 육지 행과 **같은 그리드 행**을 공유하도록(`CONTINENT_ROW_OVERLAP`) 오프셋을 바꾸고, 그 겹치는 행들의 열 범위를 넓은 통짜 밴드로 다시 그렸다. 셀 판정에서 한반도가 있으면 한반도 색이, 없으면 대륙 색이 채워지도록(`isContinent = !isKoreaLand && ...`) 만들어, 겹치는 행에서 두 색이 자연스럽게 이어 붙게 했다.

**결과**
- 도시 도트가 평상시엔 일반 지형 도트와 완전히 같은 크기로 보이다가, 호버 시에만 확대되며 조건에 맞는 색(예: 맑음 → 진한 주황)으로 반짝이는 것을 스크린샷으로 확인했다.
- 대륙이 한반도 북쪽과 끊긴 틈 없이 이어지고, 한반도보다 살짝 어두운 색으로 구분되는 것을 확인했다. 대륙 위에서 커서를 움직여도 파동 강도(`--intensity`)를 가진 도트가 0개임을 확인해 파동 계산 제외를 검증했다.
- 픽셀 커서 이미지 2장이 각각 200 응답으로 정상 로드되고, `getComputedStyle`로 `cursor` 속성이 의도한 이미지 URL을 가리키는 것을 확인했다(자동화 스크린샷에는 OS 커서 스프라이트 자체가 찍히지 않아, 실제 커서 모양은 사용자 화면에서 최종 확인이 필요하다).
- 줌 최소/최대 클램프, 도시 클릭 팝업이 기존과 동일하게 동작함을 회귀 확인했다.

![Day 4 지도 — 대륙 확장 전체 화면](./images/day4/24-map-continent-full-view.jpg)
![Day 4 지도 — 도시 호버 효과와 대륙 이음매 클로즈업](./images/day4/25-map-city-hover-continent-seam.png)

**느낀점**
- "평소엔 조용하고 호버할 때만 확실하게 반응한다"는 설계는 정보 밀도를 낮추면서도 필요한 순간엔 오히려 더 또렷해지는, 흔히 말하는 "절제된 인터랙션"의 좋은 예라고 느꼈다. 상시 애니메이션을 켜두는 것보다 사용자가 실제로 관심을 보인 대상에만 반응을 몰아주는 편이 시각적으로도 성능적으로도 이득이었다.
- 바다 흐름 효과를 구현하며 "애니메이션 대상 개수"와 "애니메이션에 쓰는 CSS 속성" 둘 다 성능에 영향을 준다는 걸 다시 확인했다. 도트 수천 개에 각각 걸기보다 배경 레이어 하나에 걸고 투명도로 비쳐 보이게 하는 우회로가, 요구사항("흐르는 느낌")을 놓치지 않으면서 비용을 상수로 만드는 실질적인 타협이었다.
- 참고 이미지를 다룰 때 "이미지를 그대로 재현하는 것"과 "이미지가 전달하려는 느낌을 코드로 재해석하는 것"은 다른 작업이라는 걸 체감했다. Pillow로 실제 픽셀 값을 뜯어봤을 때 예상과 다르다는 걸 먼저 확인하고 나서야, 무리하게 원본을 따라가기보다 같은 스타일의 새 모양을 설계하는 게 더 합리적이라는 판단을 내릴 수 있었다.

---

## 9. 지도 3차 개선 롤백 — 바다 흐름 레이어·픽셀 커서·대륙 확장 제거

**요구사항**
- 직전(8번) 작업에서 넣은 4가지 중 3가지가 요구사항과 어긋난다는 피드백을 받았다: ①바다 흐름 효과가 "인터랙티브 효과는 픽셀 단위에서 진행돼야 하는데 지금은 배경 이미지에서 사선이 지나갈 뿐"이라 롤백 요청, ②픽셀 커서가 "요구사항이랑 아예 다르다"며 롤백 요청, ③대륙 확장이 "내가 보낸 이미지랑 전혀 다르다"며 롤백 요청. ④네비게이션 메뉴가 동작하지 않는다는 버그 리포트도 함께 받았다.

**사고 과정**
- 3가지 롤백은 방향이 명확했다 — 직전 라운드의 1번 항목(도시 도트 호버 전용 효과·조건 기반 강조색)은 이번 피드백에서 언급되지 않았으므로 그대로 두고, 나머지 세 기능만 걷어내는 부분 롤백이 필요했다. 커밋 하나(`196e103`)에 네 기능이 함께 들어가 있어 `git revert`로 통째로 되돌릴 수는 없었고, 파일을 직접 편집해 세 기능의 코드만 골라 제거하는 방식을 택했다.
- 네비게이션 버그는 먼저 코드 리뷰(Explore 에이전트)로 원인을 찾아봤으나 `.app-nav`엔 z-index·position 충돌이 없었고, 지도 컴포넌트의 `.korea-map__sea-flow`도 `overflow: hidden`으로 감싸인 부모 안에 있어 `.app-nav`를 덮을 수 없는 구조였다. 실제 브라우저에서 재현을 시도했는데, 이번엔 자동화 도구의 클릭 이벤트 자체가 페이지에 전혀 전달되지 않는 현상을 발견했다(같은 요소에 `link.click()`을 JS로 직접 호출하면 정상 동작하지만, 자동화 도구의 클릭 액션으로는 `document`에 심어둔 캡처 리스너조차 호출 횟수가 0으로 유지됨) — 지난 세션에서 확인한 "자동화 탭의 `scroll` 액션이 실제 `wheel` 이벤트를 만들지 않는다"는 제약과 같은 계열의 도구 한계로 보였다. 재현에 실패한 채로 사용자에게 재현 방법을 물었더니, "지금은 해결됐다, 일시적 현상이었던 것 같다"는 답을 받아 코드 변경 없이 종료했다.

**해결 과정**
1. 더 이상 쓰이지 않는 커서 이미지 파일(`src/assets/cursors/point.png`, `grab.png`)과 빈 디렉터리를 삭제했다.
2. `src/components/practices/weather/KoreaMapDots.vue`에서 `CONTINENT_W`/`CONTINENT_H`/`CONTINENT_ROW_OVERLAP`/`CONTINENT_MATRIX`/`CONTINENT_OFFSET_FROM_KOREA_COL`/`CONTINENT_OFFSET_FROM_KOREA_ROW` 상수 전체와, `buildGrid()` 안의 `continentOffsetCol`/`continentOffsetRow` 계산 및 `isContinent` 판정 로직을 제거해 `isLand`가 다시 한반도 매트릭스만으로 결정되게 되돌렸다.

   #### `src/components/practices/weather/KoreaMapDots.vue`
   ```js
   // 되돌린 뒤
   const isLand = isKoreaLand
   const index = row * newCols + col
   newLandMask[index] = isLand ? 1 : 0
   newDots.push({ col, row, index, isLand, city: cityByKey.get(`${col},${row}`) ?? null })
   ```
3. 템플릿에서 `<div class="korea-map__sea-flow" />`와 `'is-continent': dot.isContinent` 클래스 바인딩을 제거했다.
4. `<style>`에서 `.korea-map`/`.korea-map:active`의 `cursor: url(...)` 규칙, `.korea-map__sea-flow` 규칙과 `@keyframes sea-flow-drift`, `.korea-map__dot.is-continent` 규칙을 모두 삭제하고, `.korea-map__dot`의 배경을 흐름이 비치도록 넣었던 반투명(`rgba(124,192,203,0.92)`)에서 원래의 불투명(`#7cc0cb`)으로 되돌렸다.
5. `npx vite build`로 오류 여부를 확인한 뒤, 브라우저에서 `WheelEvent`/`MouseEvent`를 디스패치해 세 기능이 실제로 사라졌는지(`--intensity` 파동만 남고 흐름 레이어·대륙 도트 없음, `getComputedStyle(...).cursor === 'auto'`)와 유지되는 기능(도시 클릭 팝업, 줌 클램프)이 회귀 없이 동작하는지 확인했다.

**트러블슈팅**
- 문제: 네비게이션 버그를 재현하려고 자동화 브라우저에서 `computer` 도구로 링크를 클릭했는데, 좌표 기반 클릭·요소 참조(ref) 기반 클릭 모두 페이지에 아무 변화도 일으키지 않았다. `document`에 캡처 단계 클릭 리스너를 심어도 호출 횟수가 0으로 유지됐다.
- 원인: 자동화 탭 환경 자체의 클릭 이벤트 전달 제약으로 보인다(같은 세션에서 이미 겪은 "`scroll` 액션이 실제 `wheel` 이벤트를 만들지 않는다"는 제약과 같은 계열). `link.click()`처럼 JS로 직접 호출하면 정상적으로 라우팅이 동작해, 앱 자체의 로직 문제는 아니라는 것을 확인했다.
- 해결: 자동화 도구로는 신뢰할 수 있게 재현할 수 없다고 판단해 사용자에게 직접 재현 방법을 질문했고, 사용자가 "지금은 해결됐다"고 확인해줘 코드 변경 없이 마무리했다.

**결과**
- `/map`에서 바다 배경에 흐름 그라데이션이 더 이상 보이지 않고, 커서 파동만 남아있음을 확인했다.
- `/map` 위에서 커서가 다시 기본 브라우저 커서(`cursor: auto`)로 보임을 확인했다.
- 한반도 북쪽에 대륙 픽셀이 더 이상 나타나지 않음을 확인했다.
- 도시 도트 호버 전용 효과, 줌 클램프, 도시 클릭 팝업 등 유지 대상 기능은 회귀 없이 그대로 동작함을 확인했다.

![Day 4 지도 — 3차 개선 롤백 후(대륙·흐름·커서 제거)](./images/day4/26-map-after-rollback.jpg)

**느낀점**
- 여러 기능을 한 커밋에 묶어서 넣으면, 그중 일부만 되돌려야 할 때 `git revert`처럼 깔끔한 되돌리기 도구를 쓸 수 없다는 걸 직접 겪었다. 기능 단위가 명확히 다르다면(이번처럼 "도시 도트 효과"와 "바다 흐름·커서·대륙"처럼) 커밋도 더 잘게 나눴으면 이번 롤백이 더 쉬웠을 것 같다.
- 자동화 도구로 버그를 재현하려다 오히려 도구 자체의 한계에 부딪혔을 때, 끝까지 도구로 재현을 밀어붙이기보다 "직접 호출로 앱 로직은 정상"이라는 사실을 먼저 확보하고 나서 사용자에게 재현 방법을 되묻는 편이 더 빨리 결론에 도달했다. 자동화로 확인할 수 없는 부분은 억지로 우회하지 말고 그 한계를 인정하는 것도 중요한 판단이라는 걸 배웠다.

---

## 10. 파동/프레스 발생 빈도 최적화 + 데모 토글·즐겨찾기 반응성 + 배경색 수정

**요구사항**
- 바다 파동이 커서가 같은 픽셀(원) 안에서 조금만 움직여도 계속 새로 발생해 낭비가 심하니, 커서가 한 픽셀에 머무는 동안은 파동이 한 번만 나도록 해달라는 요청을 받았다.
- 한반도 육지 픽셀에는 파동 대신 무거운 것이 지형을 누르는 느낌의 인터랙션을 원하며, 이것도 같은 픽셀에 머무는 동안 한 번만 발생해야 한다는 요청을 받았다.
- 실제/데모 데이터 토글을 눌러도 지도 페이지의 도시 도트·팝업이 실시간으로 안 바뀐다는 버그, 상단 즐겨찾기 칩의 "지도에서 보기"를 이미 `/map`에 있는 상태에서 누르면 팝업이 안 뜨는 버그, 도트 픽셀 뒤에 깔린 원색 배경(청록색)을 자연스러운 검은색으로 바꿔달라는 요청을 함께 받았다.

**사고 과정**
- 파동/프레스를 "칸에 머무는 동안 1회"로 제한하는 방법을 고민했다. 기존엔 `mousemove`마다 시간 기준(`RIPPLE_MIN_INTERVAL` 50ms)으로만 스팸을 막았는데, 이건 "같은 칸 안에서 흔들림"과 "다른 칸으로 이동"을 구분하지 못한다. "마지막으로 반응한 칸(col,row)"을 하나만 기억해뒀다가, 새로 계산한 칸이 그것과 다를 때만 반응하는 방식이면 정확히 요구사항대로 동작하면서 코드도 단순하다고 판단했다.
- 육지 프레스 효과를 구현하기 전 기존 파동 엔진 구조를 다시 봤는데, 파동 루프가 이미 `if (landMask[idx]) continue`로 육지를 완전히 건너뛰고 있어서 육지 도트의 `--intensity` CSS 변수와 그 값을 담는 `frameScratch`/`touchedThisFrame`/`prevTouched` 버퍼가 사실상 놀고 있었다. 육지·바다 칸은 서로 절대 겹치지 않으므로(한쪽 시스템이 건드리는 칸은 다른 쪽이 절대 안 건드림), 프레스를 위해 새 버퍼를 만들지 않고 이 기존 버퍼를 그대로 재사용하면 코드 중복 없이 같은 `tick()` 루프 안에 자연스럽게 얹을 수 있다고 봤다. "무거운 게 누른다"는 느낌은 파동과 달리 반경이 퍼지지 않는 고정 크기로, 빠르게 강해졌다가 서서히 풀리는 감쇠 곡선으로 표현하기로 했다.
- 데모 토글 버그는 `KoreaMapDots.vue`의 `buildGrid()`가 `onMounted`/리사이즈 시에만 실행되고 `props.cities`가 나중에 바뀌는 것을 감시하지 않는다는 게 원인이라고 판단해, `watch(() => props.cities, ...)`로 부모의 배열이 통째로 바뀔 때마다 다시 그리도록 하면 될 것 같았다.
- 즐겨찾기 팝업 버그는 `onMounted`가 `route.query.city`를 딱 한 번만 읽는 게 원인이라고 보고, `watch(() => route.query.city, ...)`를 추가하기로 했다. 다만 실제 확인 과정에서 팝업을 닫는 버튼이 자동화 브라우저에서 전혀 반응하지 않는 것처럼 보이는 현상을 발견해, 처음엔 `<Transition>`이 감시하는 `.popup-backdrop` 자신에 CSS 트랜지션이 없어서(트랜지션은 안쪽 `.weather-popup`에만 있음) `transitionend`가 감지되지 않아 leave가 영원히 끝나지 않는 버그로 의심하고 backdrop에도 트랜지션을 추가했었다. 하지만 고친 뒤에도 같은 현상이 재현돼, `document.visibilityState`가 `hidden`인 이 세션의 자동화 탭 특성상 `requestAnimationFrame`이 멈춰 있고 Vue의 `<Transition>` 클래스 전환도 내부적으로 `requestAnimationFrame`에 의존한다는 점이 진짜 원인이라고 다시 판단했다(같은 세션에서 이미 두 번 겪은 rAF 정지 문제와 같은 계열). 실제로 요청받은 증상(팝업이 "열리지" 않음)과는 무관한 곁가지였으므로, 검증되지 않은 backdrop 트랜지션 변경은 되돌리고 원래 계획했던 `route.query.city` watcher만 남겼다.

**해결 과정**
1. `src/components/practices/weather/KoreaMapDots.vue`에 `lastActiveCol`/`lastActiveRow`(마지막으로 파동·프레스를 발생시킨 칸)를 추가하고, `handleMouseMove`에서 새로 계산한 칸이 이전과 같으면 아무 것도 하지 않고, 다르면 육지/바다 여부에 따라 프레스 또는 파동을 1회만 발생시키도록 바꿨다. `.korea-map`에 `@mouseleave`를 추가해 지도를 벗어나면 추적값을 초기화해, 같은 칸에 다시 들어와도 새로 반응하게 했다.

   #### `src/components/practices/weather/KoreaMapDots.vue`
   ```js
   if (col >= 0 && col < cols.value && row >= 0 && row < rows.value) {
     if (col !== lastActiveCol || row !== lastActiveRow) {
       lastActiveCol = col
       lastActiveRow = row
       const idx = row * cols.value + col
       if (landMask[idx]) spawnPress(col, row)
       else spawnRipple(col, row)
     }
   }
   ```
2. 육지 프레스를 파동과 같은 `tick()` 루프 안에 추가했다. 반경이 퍼지지 않는 고정 크기(`PRESS_RADIUS`)와, 처음 15%는 빠르게 강해지고 나머지 85%는 거듭제곱으로 서서히 풀리는 감쇠 곡선(`PRESS_DURATION` ≈ 550ms)을 썼다. 기존 `frameScratch`/`touchedThisFrame`/`prevTouched` 버퍼를 그대로 재사용해 새 자료구조를 만들지 않았다.

   #### `src/components/practices/weather/KoreaMapDots.vue`
   ```js
   const envelope = t < 0.15 ? t / 0.15 : Math.pow(1 - (t - 0.15) / 0.85, 1.6)
   // ...반경 안 육지 칸에 대해 (1 - distance/PRESS_RADIUS) * envelope 를
   // 기존 frameScratch/touchedThisFrame에 그대로 합류시킨다(파동과 겹치지 않는 칸이라 안전)
   ```
3. 육지 도트 CSS를 밝아지는 방향에서 어두워지는 방향으로 바꾸고, 살짝 오그라드는 `transform: scale(...)`을 더해 "눌리는" 느낌을 강화했다.

   #### `src/components/practices/weather/KoreaMapDots.vue`
   ```css
   .korea-map__dot.is-land {
     background: var(--dot-lit);
     filter: brightness(calc(1 - var(--intensity, 0) * 0.4));
     transform: scale(calc(1 - var(--intensity, 0) * 0.12));
   }
   ```
4. `KoreaMapDots.vue`에 `watch(() => props.cities, () => { if (!containerW || !containerH) return; buildGrid(containerW, containerH) })`를 추가해, 데모/실제 데이터 토글로 부모의 `cityList`가 교체될 때마다 그리드를 다시 그리도록 했다(줌/팬 상태는 `buildGrid`가 건드리지 않아 유지된다).
5. `src/views/WeatherMapView.vue`에 `watch(() => route.query.city, (cityId) => { ...; selectCityById(city) })`를 추가해, 이미 `/map`에 마운트된 상태에서 즐겨찾기 칩으로 쿼리만 바뀌는 경우에도 팝업이 열리도록 했다. 최초 진입은 기존 `onMounted` 로직이 그대로 처리한다.
6. `.weather-map`의 `background-color`를 `var(--sea)`(청록)에서 테마에 이미 있는 근접-검정 토큰 `var(--ink)`로 바꿨다.
7. `npx vite build`로 오류 여부를 확인한 뒤, 브라우저에서 실제 도구 클릭 대신 앱 내부 `router.push`를 직접 호출해(자동화 탭의 rAF 제약과 무관하게 확인 가능한 경로) 즐겨찾기 흐름과 데모 토글 반응성을 검증했다.

**트러블슈팅**
- 문제: 항목 4를 검증하려고 팝업을 열고 닫는 흐름을 테스트하다가, 팝업 닫기 버튼을 아무리 클릭해도(좌표 클릭, `dispatchEvent`, 네이티브 `.click()` 모두) 팝업 DOM이 `opacity:0` 상태로 계속 남아있는 현상을 발견했다.
- 원인: 처음엔 `<Transition>`이 실제로 감시하는 루트가 `.popup-backdrop`인데 트랜지션 속성은 안쪽 `.weather-popup`에만 걸려있어 `transitionend`가 감지되지 않는 CSS 구조 버그로 판단하고 `.popup-backdrop` 자신에도 트랜지션을 추가했다. 하지만 고친 뒤에도 동일하게 재현돼, 이 세션의 자동화 탭이 `document.visibilityState: 'hidden'`이라 `requestAnimationFrame`이 정지돼 있고 Vue의 `<Transition>` 클래스 전환도 내부적으로 rAF에 의존한다는 진짜 원인을 다시 확인했다(같은 세션에서 `scroll`/`wheel`, 클릭 이벤트에 이어 세 번째로 겪은 같은 계열의 제약).
- 해결: 검증되지 않은 채 남겨두면 사용하지 않은 CSS 변경만 늘리는 셈이라, `.popup-backdrop` 트랜지션 추가는 되돌렸다. 대신 실제 요청 대상이었던 "쿼리 변경으로 팝업이 열리는지"는 앱의 `router` 인스턴스를 `document.querySelector('#app').__vue_app__`로 직접 얻어 `router.push({name:'weather-map', query:{city:...}})`를 호출하는 방식(rAF와 무관, 순수 상태 변경 확인)으로 검증해, 다른 두 도시에 대해 연달아 팝업이 정상적으로 바뀌는 것을 확인했다.

**결과**
- 파동/프레스 발생 빈도를 "칸 진입마다 1회"로 제한하는 로직과 육지용 프레스 감쇠 곡선을 Node.js로 독립 검증해, 곡선이 0→약 1(빠르게)→0(서서히)으로 정상적으로 움직임을 확인했다(rAF 의존 애니메이션 자체는 이 세션의 자동화 탭에서 시각적으로 재생되지 않는 기존 제약으로, 수치 검증으로 대체).
- 데모/실제 데이터 토글을 지도 페이지에 머문 채로 눌러 도시 도트 배경색이 토글 직후 바로 바뀌는 것을 확인했다.
- `/map`에 이미 있는 상태에서 `router.push`로 쿼리(`?city=...`)만 바꿔도 팝업이 즉시 열리고, 다른 도시로 다시 바꾸면 팝업 내용도 바로 갱신되는 것을 확인했다.
- 지도 배경이 청록색에서 검은 계열로 바뀐 것을 스크린샷으로 확인했다.

![Day 4 지도 — 검은 배경, 즐겨찾기로 연 팝업](./images/day4/27-map-dark-bg-favorite-popup.jpg)

**느낀점**
- "발생 빈도를 줄여달라"는 요청을 받았을 때, 계산 자체를 더 가볍게 만드는 것과 애초에 덜 자주 실행되게 만드는 것은 다른 최적화라는 걸 다시 확인했다. 이번엔 계산량은 지난 라운드에서 이미 최적화돼 있었으므로, "같은 칸이면 아예 트리거하지 않는다"는 발생 빈도 자체를 줄이는 접근이 훨씬 간단하고 효과적이었다.
- 버그를 재현하다 자동화 도구의 한계(rAF 정지)에 부딪혔을 때, 그 자리에서 바로 "원인일 수도 있겠다"며 코드를 고치기보다 고친 뒤에도 같은 증상이 재현되는지 먼저 재확인하는 습관이 중요하다는 걸 다시 느꼈다. 고치고 나서도 증상이 그대로라면 그건 내가 고친 부분이 원인이 아니라는 뜻이고, 검증되지 않은 변경은 남겨두지 않고 되돌리는 게 맞다.

---

## 11. 지도 배경색 롤백 + 한반도 영역 구분색 추가

**요구사항**
- 직전(10번) 작업에서 검은색으로 바꾼 지도 배경이 눈이 아프다는 피드백을 받아 롤백을 요청받았다. 대신 한반도 지형 부분만 육지색보다 조금 진한 색으로 영역을 구분해달라는 요청과, 바다 색상은 이전(청록) 그대로 유지해달라는 요청을 함께 받았다.

**사고 과정**
- `.weather-map`의 `background-color`는 지도 전체에 깔리는 단일 색이라, 이 값 하나로는 "바다는 청록, 육지 부분만 진한 색"처럼 칸 단위로 다른 색을 줄 수 없다는 게 핵심 제약이었다. 배경은 원래 색(`var(--sea)`)으로 단순히 되돌리고, "한반도 영역 구분"은 육지 도트 쪽에서 별도로 해결해야 했다.
- 육지 도트 하나하나에 자신의 색보다 살짝 진한 `box-shadow`를 둘러 그리드 간격(1px)까지 덮으면, 인접한 육지 칸들의 그림자가 서로 이어붙어 마치 하나의 연속된 영역처럼 보일 거라고 판단했다. 그림자는 도트의 실제 원형 경계보다 살짝 넓게 퍼지므로, 촘촘한 그리드에서는 사각형 셀 사이 빈틈(둥근 도트라 생기는 모서리 여백)도 자연스럽게 메워진다.
- 도시 마커는 지리적으로 대부분 육지 위에 있어 `is-land`와 `is-city` 클래스를 동시에 가진다. 지난 라운드에서 "도시 도트는 평상시엔 지형과 완전히 동일하게 보여야 한다"고 정해뒀던 걸 깨지 않으려면, 새로 추가한 육지 구분색 그림자가 도시 도트의 평상시 모습에 새어 들어가지 않도록 명시적으로 막아야 한다고 판단했다.

**해결 과정**
1. `src/views/WeatherMapView.vue`의 `.weather-map` 배경색을 `var(--ink)`에서 `var(--sea)`로 되돌렸다.
2. `src/components/practices/weather/KoreaMapDots.vue`의 `.korea-map__dot.is-land`에 `box-shadow: 0 0 0 2px #d1cabb`를 추가했다. 색은 육지색(`var(--dot-lit)` = `#f3ebd9`)을 약 14% 어둡게 계산한 값으로, 지난 라운드 대륙 확장 때 이미 같은 방식으로 계산해 검증해둔 값을 그대로 재사용했다.

   #### `src/components/practices/weather/KoreaMapDots.vue`
   ```css
   .korea-map__dot.is-land {
     background: var(--dot-lit);
     filter: brightness(calc(1 - var(--intensity, 0) * 0.4));
     transform: scale(calc(1 - var(--intensity, 0) * 0.12));
     box-shadow: 0 0 0 2px #d1cabb;
   }
   ```
3. `.korea-map__dot.is-city` 기본(호버 전) 상태에 `box-shadow: none`을 명시해, `is-land`와 동시에 걸리는 도시 도트가 평상시엔 여전히 장식 없는 일반 도트로 보이게 했다. 호버·선택 시의 기존 `box-shadow` 규칙은 더 구체적인 선택자라 자동으로 우선 적용된다.

**트러블슈팅**
- 없음.

**결과**
- `npx vite build` 통과를 확인했다.
- `/map`에서 바다 배경이 이전의 청록색으로 돌아왔고, 한반도 육지 도트들 사이가 육지색보다 진한 톤으로 채워져 육지 영역이 바다와 뚜렷이 구분되는 것을 스크린샷으로 확인했다.
- 도시 도트가 평상시(호버 전)엔 `box-shadow: none`으로 계산돼 여전히 장식 없이 일반 도트와 동일하게 보이고, 클릭 시 팝업도 정상적으로 열리는 것을 확인했다.

![Day 4 지도 — 바다 배경색 롤백, 한반도 영역 구분색 추가](./images/day4/28-map-sea-bg-rollback-land-region-color.jpg)

**느낀점**
- "배경색을 바꿔달라"는 요청이 두 번째로 반대 방향으로 뒤집혔는데, 처음 요청(검은색)만 보고 확정적으로 좋다고 판단하지 않고 실제 반응을 지켜보며 조정하는 흐름이 자연스럽다는 걸 느꼈다. 시각적 선호는 코드보다 훨씬 주관적이라, 이런 되돌림 자체를 실패로 여기기보다 반복 조정의 정상적인 일부로 받아들이는 게 맞다고 생각했다.
- "영역을 구분해달라"는 요청을 문자 그대로 "배경색을 칸마다 다르게 칠한다"로 풀려고 하면 CSS 구조상 막히는 지점(단일 배경색)이 있었는데, "인접한 원형 도트의 그림자를 서로 이어붙인다"는 약간 다른 각도로 접근하니 기존 구조를 거의 안 건드리고도 원하는 시각적 결과를 낼 수 있었다. 요구사항을 가장 직관적인 구현 방법 하나로만 고정해서 생각하지 않는 게 중요하다고 다시 느꼈다.

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
