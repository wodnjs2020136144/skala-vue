import { CITY_LIST } from './weatherApi'

// "한반도 지역 찾기" 미니게임 전용 지역 목록. CITY_LIST(실제 날씨 API 호출 대상)에 지역을
// 추가하지 않는 이유: 항목이 늘어나면 지도/홈 화면 진입 시 API 요청 수가 그만큼 늘고 홈 화면
// 카드 목록도 게임과 무관하게 길어진다. 게임은 좌표만 필요하고 날씨 데이터는 쓰지 않으므로
// 별도 목록으로 관리한다.
//
// mapX/mapY는 KoreaMapDots의 KOREA_MATRIX(22x41 그리드) 위에서의 상대 위치(0~1)이며,
// CITY_LIST와 같은 좌표계다. 이 파일의 모든 좌표는 KOREA_MATRIX의 육지 칸('1')에 정확히
// 떨어지는지 Node.js로 사전 검증했다(바다에 찍히면 게임 정답 판정이 이상해지므로 필수).
const EXTRA_REGIONS = [
  { id: 'region_chuncheon', name: '춘천', mapX: 0.568, mapY: 0.524 },
  { id: 'region_gangneung', name: '강릉', mapX: 0.705, mapY: 0.598 },
  { id: 'region_sokcho', name: '속초', mapX: 0.568, mapY: 0.451 },
  { id: 'region_wonju', name: '원주', mapX: 0.477, mapY: 0.646 },
  { id: 'region_cheongju', name: '청주', mapX: 0.523, mapY: 0.671 },
  { id: 'region_jeonju', name: '전주', mapX: 0.432, mapY: 0.744 },
  { id: 'region_mokpo', name: '목포', mapX: 0.25, mapY: 0.841 },
  { id: 'region_yeosu', name: '여수', mapX: 0.432, mapY: 0.817 },
  { id: 'region_pohang', name: '포항', mapX: 0.75, mapY: 0.72 },
  { id: 'region_andong', name: '안동', mapX: 0.659, mapY: 0.695 },
  { id: 'region_changwon', name: '창원', mapX: 0.568, mapY: 0.793 },
  { id: 'region_cheonan', name: '천안', mapX: 0.477, mapY: 0.671 },
]

// CITY_LIST의 9개 도시(좌표 검증 완료, 실제 앱에서 이미 정상 표시 중)에 위 12곳을 더해
// 총 21곳. 문제 지역을 CITY_LIST와 완전히 분리하지 않고 재사용하는 이유: 사용자에게
// 친숙한 주요 도시도 문제로 나와야 게임 난이도가 자연스럽다.
export const GAME_REGION_LIST = [
  ...CITY_LIST.map((city) => ({ id: `game_${city.id}`, name: city.name, mapX: city.mapX, mapY: city.mapY })),
  ...EXTRA_REGIONS,
]
