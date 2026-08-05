import { computed, onUnmounted, ref } from 'vue'
import { GAME_REGION_LIST } from '../services/gameRegions'

const ROUNDS_PER_GAME = 10
const TIME_LIMIT_SEC = 30
const TOLERANCE = 2.5 // 칸 — 이 거리 안에 클릭하면 정답으로 인정
// TOLERANCE보다 멀지만 이 거리 안이면 "근접"으로 보고 부분 점수를 주되 감점하지 않는다.
// 정답 근처를 눌렀는데 하필 다른 지역과 겹쳐 완전 오답 처리되던 문제를 완화한다.
const NEAR_TOLERANCE = 5
const MAX_ROUND_SCORE = 200 // 정확히 맞췄을 때 만점
const LEADERBOARD_KEY = 'skala-weather-map-game-leaderboard'
const LEADERBOARD_SIZE = 10
// 오답일 때 정답과의 거리에 비례해 깎는 점수 — 멀리 찍을수록 더 많이 깎인다.
const PENALTY_PER_CELL = 8
// 오답 클릭 위치에서 이 거리(칸) 안에 있는 지역이 있으면 "그 지역이었어요"라고 알려준다.
// TOLERANCE보다 살짝 넉넉하게 둬서, 아깝게 틀린 경우 근처 지역 이름을 짚어줄 수 있게 한다.
const CLICK_LABEL_RADIUS = 3
// 한 라운드가 시작되고 이만큼(ms) 지나도록 답을 못 맞히면 정답 근처에 힌트를 보여준다.
const HINT_DELAY_MS = 5000

function loadLeaderboard() {
  try {
    const raw = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) ?? '[]')
    return Array.isArray(raw) ? raw.filter((n) => typeof n === 'number') : []
  } catch {
    return []
  }
}

// "한반도 지역 찾기" 미니게임의 상태 기계. WeatherMapView가 이미 지도·팝업·정보창 로직으로
// 커지고 있어, 게임 상태는 별도 컴포저블로 분리해 뷰 컴포넌트가 UI 배선에만 집중하게 한다.
export function useRegionGame() {
  const status = ref('idle') // 'idle' | 'playing' | 'finished'
  const roundIndex = ref(0) // 0-based, 진행 중 라운드 번호
  const currentRegion = ref(null)
  const score = ref(0)
  const combo = ref(0)
  const timeLeft = ref(TIME_LIMIT_SEC)
  // { tier: 'correct'|'near'|'wrong', correct, points, region, clickedRegionName, penalty } | null
  const lastResult = ref(null)
  // 상위 10개 점수 기록. localStorage에는 숫자 배열만 저장하고, "최고 기록"은 그 1등을 그대로 쓴다.
  const leaderboard = ref(loadLeaderboard())
  const bestScore = computed(() => leaderboard.value[0] ?? 0)
  // 이번 게임 점수가 리더보드 몇 번째로 들어갔는지(동점이 여러 개여도 이번 기록만 강조하기 위함).
  // 10위 밖으로 밀려나면 null.
  const lastRankIndex = ref(null)
  // 현재 라운드에서 5초 동안 답을 못 맞히면 채워지는 힌트 대상 지역. 다음 라운드로 넘어가거나
  // 답을 맞히면 다시 null로 돌아간다 — 뷰가 이 값을 watch해서 지도에 힌트를 켜고 끈다.
  const hintRegion = ref(null)

  let rounds = []
  let timerId = null
  let hintTimerId = null

  function clearHintTimer() {
    if (hintTimerId) {
      clearTimeout(hintTimerId)
      hintTimerId = null
    }
  }

  // 새 라운드가 시작될 때마다 호출 — 힌트를 먼저 지우고, 5초 뒤에도 여전히 같은 라운드라면
  // (즉 그 사이에 답을 안 맞혔다면) 힌트를 켠다.
  function scheduleHint(region) {
    clearHintTimer()
    hintRegion.value = null
    hintTimerId = setTimeout(() => {
      if (status.value === 'playing' && currentRegion.value === region) {
        hintRegion.value = region
      }
    }, HINT_DELAY_MS)
  }

  function pickRounds() {
    const shuffled = [...GAME_REGION_LIST].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, ROUNDS_PER_GAME)
  }

  // 오답 클릭 위치와 가장 가까운 게임 지역을 찾는다 — "당신이 클릭한 곳은 OO였어요"용.
  // 전체 지역이 많아야 30여 개라 매 클릭마다 전수 조사해도 비용은 무시할 만하다.
  function nearestRegionName(col, row, toColRow) {
    let closest = null
    let closestDist = Infinity
    for (const region of GAME_REGION_LIST) {
      const pos = toColRow(region.mapX, region.mapY)
      const d = Math.hypot(col - pos.col, row - pos.row)
      if (d < closestDist) {
        closestDist = d
        closest = region
      }
    }
    return closestDist <= CLICK_LABEL_RADIUS ? (closest?.name ?? null) : null
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
  }

  function finishGame() {
    stopTimer()
    clearHintTimer()
    hintRegion.value = null
    status.value = 'finished'
    const updated = [...leaderboard.value, score.value].sort((a, b) => b - a).slice(0, LEADERBOARD_SIZE)
    leaderboard.value = updated
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated))
    // 동점 기록이 여러 개 섞여도 "이번 기록"만 강조할 수 있도록, 처음 등장하는(=가장 앞쪽) 자리를
    // 이번 기록의 자리로 삼는다. 10위 밖으로 밀려났으면 -1이 되어 null 처리한다.
    const rank = updated.indexOf(score.value)
    lastRankIndex.value = rank >= 0 ? rank : null
  }

  function startGame() {
    stopTimer()
    rounds = pickRounds()
    roundIndex.value = 0
    score.value = 0
    combo.value = 0
    timeLeft.value = TIME_LIMIT_SEC
    lastResult.value = null
    lastRankIndex.value = null
    currentRegion.value = rounds[0]
    status.value = 'playing'
    scheduleHint(rounds[0])

    timerId = setInterval(() => {
      timeLeft.value -= 1
      if (timeLeft.value <= 0) {
        timeLeft.value = 0
        finishGame()
      }
    }, 1000)
  }

  // 클릭 위치와 정답의 거리로 셀을 뭐라고 부를지 못 찾았을 때(nearestRegionName이 null),
  // describeCell(북한/육지/바다 판정)로 최소한의 설명을 만든다.
  function describeClick(col, row, describeCell) {
    switch (describeCell?.(col, row)) {
      case 'north':
        return '북한'
      case 'land':
        return '그 근처엔 문제 지역이 없어요'
      default:
        return '바다'
    }
  }

  // 지도 클릭 지점(col,row)과 정답 칸의 거리로 3단계 채점한다: 정확히 맞으면 정답(만점에
  // 가까움), 조금 벗어났지만 NEAR_TOLERANCE 안이면 "근접"(부분 점수, 감점 없음), 그보다
  // 멀면 오답(거리 비례 감점). 정답 칸 좌표와 클릭 좌표를 함께 반환해 뷰가 정답 위치(항상)·
  // 클릭 위치(완전 오답일 때만, 빨간 이펙트용)에 burst를 띄울 수 있게 한다.
  function submitGuess(col, row, toColRow, describeCell) {
    if (status.value !== 'playing' || !currentRegion.value) return null

    const region = currentRegion.value
    const answer = toColRow(region.mapX, region.mapY)
    const dx = col - answer.col
    const dy = row - answer.row
    const distance = Math.sqrt(dx * dx + dy * dy)

    let tier
    let points = 0
    let penalty = 0
    if (distance <= TOLERANCE) {
      tier = 'correct'
      // 정확할수록 높은 점수 — 거리 0이면 만점, TOLERANCE에 가까워질수록 선형으로 줄어든다.
      points = Math.round(MAX_ROUND_SCORE * (1 - distance / TOLERANCE))
      combo.value += 1
      score.value += points
    } else if (distance <= NEAR_TOLERANCE) {
      tier = 'near'
      // 정답 근처인데 하필 다른 지역과 겹쳐 완전 오답 처리되면 억울하므로, 감점 없이 부분
      // 점수만 준다 — TOLERANCE 경계에서 최대 40%(=80점), NEAR_TOLERANCE 경계에서 0으로 선형 감소.
      points = Math.round(
        MAX_ROUND_SCORE * 0.4 * (1 - (distance - TOLERANCE) / (NEAR_TOLERANCE - TOLERANCE)),
      )
      combo.value = 0
      score.value += points
    } else {
      tier = 'wrong'
      combo.value = 0
      // 멀리 찍을수록 비례해서 감점하되, 점수가 0 밑으로 내려가지는 않는다.
      penalty = Math.round(distance * PENALTY_PER_CELL)
      score.value = Math.max(0, score.value - penalty)
    }

    lastResult.value = {
      tier,
      correct: tier === 'correct',
      points,
      penalty,
      region,
      // 완전 오답일 때만: 클릭한 곳이 무슨 지역이었는지(가까운 문제 지역이 없으면 북한/육지/
      // 바다 여부로 설명한다). 정답·근접일 땐 필요 없다.
      clickedRegionName: tier === 'wrong' ? (nearestRegionName(col, row, toColRow) ?? describeClick(col, row, describeCell)) : null,
    }

    roundIndex.value += 1
    if (roundIndex.value >= rounds.length) {
      finishGame()
    } else {
      currentRegion.value = rounds[roundIndex.value]
      scheduleHint(currentRegion.value)
    }

    return { tier, correct: tier === 'correct', answer, clicked: { col, row } }
  }

  onUnmounted(() => {
    stopTimer()
    clearHintTimer()
  })

  return {
    status,
    roundIndex,
    totalRounds: ROUNDS_PER_GAME,
    currentRegion,
    score,
    combo,
    timeLeft,
    timeLimit: TIME_LIMIT_SEC,
    lastResult,
    bestScore,
    leaderboard,
    lastRankIndex,
    hintRegion,
    startGame,
    submitGuess,
  }
}
