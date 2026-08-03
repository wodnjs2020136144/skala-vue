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
