# 종합과제 체크리스트 (최우선 기준 자료)

> ⚠️ **이 문서가 이 강의 전체에서 가장 우선순위가 높은 기준 자료입니다.** 158p 이론 교재(`vue-study-guide.md`/`vue-practice-exercises.md`)와 `pdf/day{N}.pdf`(그날의 강의안)는 배경 이론과 세부 구현 방법을 제공하지만, **제출 방식·범위·일정은 이 체크리스트를 따릅니다.** 세 자료가 서로 다르면 이 체크리스트가 우선합니다.
>
> 4일차 종합과제는 새로 만드는 것이 아니라 **1~3일차 결과물을 이어서 키운 것**을 제출합니다. 하루라도 밀리면 마지막 날 따라잡기 어려우므로, 매일 퇴근 전 1~2분만이라도 체크리스트를 확인합니다.

## 제출 방식 (수정됨)

- **GitHub Public 저장소**로 제출 (예: `skala-vue`)
- 시크릿 창(⌘+Shift+N)으로 열어 로그인 없이 소스가 보이는지 확인 필수
- (이전에 "이 분반은 Slack PDF 제출"이라고 잘못 판단했던 내용은 정정됨 — 실제로는 GitHub Public 저장소 제출이 맞음)

## 🔧 사전 준비 (1일차에 먼저 해둘 것 — 나중에 몰아서 하면 시간 소모)

- [ ] 본인 GitHub 계정에 Public 저장소 생성 (예: `skala-vue`)
- [ ] 시크릿 창(⌘+Shift+N)으로 열어 로그인 없이 소스가 보이는지 확인
- [ ] OpenWeatherMap 가입 → API Key 발급 (3일차에 사용, 승인에 시간이 걸릴 수 있음 — 미리 해둘 것)

## 📅 1일차 (7/31) — 1단계 「날씨 Mockup」

- [ ] `v-for`로 `weatherList`(id·name·temp·status) 렌더링 — `:key`에 `id` 바인딩
- [ ] `v-if` 조건부 — 25도 이상 '🔥 더움' / 25도 미만 '❄ 선선함'
- [ ] `:value`·`@input` 양방향 바인딩 — 한글(IME) 입력이 깨지지 않는지 확인
- [ ] 오늘 작업분 커밋 & 푸시

## 📅 2일차 (8/3) — 2단계 「컴포지션」 + 3단계 「컴포넌트 분리」

- [ ] 반응형 상태 3종 — `searchQuery` · `selectedCityInfo` · `weatherList`
- [ ] `computed`로 `filteredWeatherList` — 검색어가 도시 이름에 포함된 것만
- [ ] `watch(selectedCityInfo)` · `watchEffect(searchQuery)` 각각 콘솔 로그
- [ ] 검색어가 비면 원본 출력 / 일치하면 결과 출력
- [ ] 기능은 그대로 두고 4개 파일로 분리: `WeatherParent.vue` · `BaseDashboardCard.vue`(+slot) · `SearchBar.vue` · `WeatherCard.vue`
- [ ] `SearchBar`는 props 수신 + `update-query` emit / `WeatherCard`는 `select-card`·`click-detail` emit
- [ ] 오늘 작업분 커밋 & 푸시

## 📅 3일차 (8/4) — 4단계 「Router · Pinia · Axios」

- [ ] Router — 목록↔상세 라우팅, 지연 로딩, Catch-all Route
- [ ] Pinia `configStore` — `state.unit` / `getters.unitSymbol`(℃·℉) / `actions.toggleUnit`
- [ ] `UnitToggler.vue`를 Navigation Bar 옆에 배치, 메인·상세 양쪽 적용
- [ ] 온도 변환은 `computed`로 — `Math.round((rawTemp * 9) / 5 + 32)`
- [ ] Axios로 OpenWeatherMap 실제 데이터로 교체 + 로딩·에러 처리
- [ ] 오늘 작업분 커밋 & 푸시

## 📅 4일차 (8/5) — 마무리 + 제출

- [ ] Element Plus로 UI 정리
- [ ] Modern JS — 구조분해·전개·옵셔널 체이닝 적용
- [ ] `npm run build` · base 경로 확인 · 정적 배포(Vercel·Netlify·GitHub Pages)
- [ ] 저장소가 Public인지 시크릿 창으로 최종 확인
- [ ] 수업 종료 전까지 제출 (별도 안내)

## 진행 현황 요약

| 날짜 | 단계 | 상세 기록 | 상태 |
|---|---|---|---|
| 7/31 (1일차) | 날씨 Mockup | [day1.md](./reports/day1.md) | 완료 |
| 8/3 (2일차) | 컴포지션 + 컴포넌트 분리 | [day2.md](./reports/day2.md) | 완료 |
| 8/4 (3일차) | Router·Pinia·Axios | [day3.md](./reports/day3.md) | 완료 (8/3에 앞당겨 진행) |
| 8/5 (4일차) | 마무리 + 제출 | [day4.md](./reports/day4.md) | 예정 |

## 💡 점수가 갈리는 지점 (교수님 공지, 평가 유의사항)

- **Private 저장소는 감점 대상** — 소스 확인이 불가능하면 평가 기준상 61~70점(Poor) 구간이 됨. (현재 `wodnjs2020136144/skala-vue`는 Public 전환 완료, 로그인 없는 접근 확인됨 — [checklist.md 사전 준비](#-사전-준비-1일차에-먼저-해둘-것--나중에-몰아서-하면-시간-소모) 참고)
- **직접 손댄 흔적이 가산점** — 동일하게 동작해도 주석, 변수명, 작은 개선 등 본인이 직접 다듬은 흔적이 보이면 점수가 올라감. 시키지 않은 것을 하나라도 더 해봤다면 더 좋음(예: [Font Awesome 아이콘 도입](./vue-study-guide.md#부가-학습-ui-라이브러리--font-awesome), [카드 디자인 개편](./reports/day1.md) 같은 부가 실습).
- 막히면 강사 스레드에 질문하면 됨.
