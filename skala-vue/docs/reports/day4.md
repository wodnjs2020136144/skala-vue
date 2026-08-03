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
