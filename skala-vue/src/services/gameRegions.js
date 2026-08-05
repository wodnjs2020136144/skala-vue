import { CITY_LIST } from './weatherApi'

// "한반도 지역 찾기" 미니게임 + 지도의 "지명 픽셀"(장식용, 날씨 데이터 없음)이 함께 쓰는
// 지역 목록. CITY_LIST(실제 날씨 API 호출 대상)에 전부 추가하지 않는 이유: 항목이 늘어나면
// 화면 진입 시 API 요청 수가 그만큼 늘고(무료 티어 rate limit 위험) 홈 화면 카드 목록도
// 게임/지도 표시와 무관하게 길어진다. 이 목록은 좌표만 필요하고 날씨 데이터는 쓰지 않으므로
// API 호출 없는 별도 목록으로 관리한다.
//
// mapX/mapY는 KoreaMapDots의 KOREA_MATRIX(22x41 그리드) 위에서의 상대 위치(0~1)이며,
// CITY_LIST와 같은 좌표계다. 이 파일의 모든 좌표는 KOREA_MATRIX의 육지 칸('1')에 정확히
// 떨어지고 다른 지역과 칸이 겹치지 않는지 Node.js로 사전 검증했다(바다에 찍히거나 겹치면
// 게임 정답 판정·지도 마커가 이상해지므로 필수).
export const MAP_LANDMARKS = [
  { id: 'region_gangneung', name: '강릉', mapX: 0.705, mapY: 0.598 },
  { id: 'region_sokcho', name: '속초', mapX: 0.568, mapY: 0.451 },
  { id: 'region_wonju', name: '원주', mapX: 0.477, mapY: 0.646 },
  { id: 'region_yeosu', name: '여수', mapX: 0.432, mapY: 0.817 },
  { id: 'region_pohang', name: '포항', mapX: 0.75, mapY: 0.72 },
  { id: 'region_cheonan', name: '천안', mapX: 0.477, mapY: 0.671 },
  // 본토와 떨어진 섬(KOREA_MATRIX에서 육지 본토 덩어리와 분리된 고립 칸) — 반드시 포함해야
  // 해서 좌표를 매트릭스에서 직접 찾아 검증했다.
  { id: 'region_ulleungdo', name: '울릉도', mapX: 0.841, mapY: 0.573 },
  { id: 'region_dokdo', name: '독도', mapX: 0.977, mapY: 0.598 },
  { id: 'region_gumi', name: '구미', mapX: 0.659, mapY: 0.72 },
  { id: 'region_gyeongju', name: '경주', mapX: 0.75, mapY: 0.744 },
  { id: 'region_jinju', name: '진주', mapX: 0.477, mapY: 0.793 },
  { id: 'region_naju', name: '나주', mapX: 0.295, mapY: 0.817 },
  { id: 'region_gunsan', name: '군산', mapX: 0.341, mapY: 0.72 },
  { id: 'region_seosan', name: '서산', mapX: 0.295, mapY: 0.646 },
  { id: 'region_chungju', name: '충주', mapX: 0.614, mapY: 0.671 },
  { id: 'region_taebaek', name: '태백', mapX: 0.614, mapY: 0.549 },
  { id: 'region_samcheok', name: '삼척', mapX: 0.705, mapY: 0.622 },
  { id: 'region_geoje', name: '거제', mapX: 0.614, mapY: 0.841 },
  { id: 'region_tongyeong', name: '통영', mapX: 0.568, mapY: 0.817 },
  // 여기부터는 이번 라운드에 추가한 지명 픽셀 — CITY_LIST를 17개(17개 시·도 커버)로 늘리면서
  // 비게 된 자리를 최대한 채우되, 다른 지역과 최소 간격을 둬 호버 툴팁끼리 겹치지 않게 했다.
  { id: 'region_paju', name: '파주', mapX: 0.41, mapY: 0.52 },
  { id: 'region_dongducheon', name: '동두천', mapX: 0.4, mapY: 0.48 },
  { id: 'region_icheon', name: '이천', mapX: 0.5, mapY: 0.6 },
  { id: 'region_dangjin', name: '당진', mapX: 0.28, mapY: 0.56 },
  { id: 'region_jecheon', name: '제천', mapX: 0.63, mapY: 0.63 },
  { id: 'region_namwon', name: '남원', mapX: 0.5, mapY: 0.75 },
  { id: 'region_gwangyang', name: '광양', mapX: 0.42, mapY: 0.86 },
  { id: 'region_haenam', name: '해남', mapX: 0.28, mapY: 0.88 },
  { id: 'region_yangyang', name: '양양', mapX: 0.64, mapY: 0.49 },
  { id: 'region_cheorwon', name: '철원', mapX: 0.49, mapY: 0.43 },
]

// CITY_LIST의 17개 도시(좌표 검증 완료, 실제 앱에서 이미 정상 표시 중)에 위 29곳을 더해
// 총 46곳. 문제 지역을 CITY_LIST와 완전히 분리하지 않고 재사용하는 이유: 사용자에게
// 친숙한 주요 도시도 문제로 나와야 게임 난이도가 자연스럽다.
export const GAME_REGION_LIST = [
  ...CITY_LIST.map((city) => ({ id: `game_${city.id}`, name: city.name, mapX: city.mapX, mapY: city.mapY })),
  ...MAP_LANDMARKS,
]
