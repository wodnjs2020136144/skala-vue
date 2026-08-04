import { onUnmounted, ref } from 'vue'
import { GAME_REGION_LIST } from '../services/gameRegions'

const ROUNDS_PER_GAME = 5
const TIME_LIMIT_SEC = 60
const TOLERANCE = 2.5 // 칸 — 이 거리 안에 클릭하면 정답으로 인정
const MAX_ROUND_SCORE = 200 // 정확히 맞췄을 때 만점
const BEST_SCORE_KEY = 'skala-weather-map-game-best-score'

// "한반도 지역 찾기" 미니게임의 상태 기계. WeatherMapView가 이미 지도·팝업·정보창 로직으로
// 커지고 있어, 게임 상태는 별도 컴포저블로 분리해 뷰 컴포넌트가 UI 배선에만 집중하게 한다.
export function useRegionGame() {
  const status = ref('idle') // 'idle' | 'playing' | 'finished'
  const roundIndex = ref(0) // 0-based, 진행 중 라운드 번호
  const currentRegion = ref(null)
  const score = ref(0)
  const combo = ref(0)
  const timeLeft = ref(TIME_LIMIT_SEC)
  const lastResult = ref(null) // { correct: boolean, points: number, region } | null
  const bestScore = ref(Number(localStorage.getItem(BEST_SCORE_KEY)) || 0)

  let rounds = []
  let timerId = null

  function pickRounds() {
    const shuffled = [...GAME_REGION_LIST].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, ROUNDS_PER_GAME)
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
  }

  function finishGame() {
    stopTimer()
    status.value = 'finished'
    if (score.value > bestScore.value) {
      bestScore.value = score.value
      localStorage.setItem(BEST_SCORE_KEY, String(bestScore.value))
    }
  }

  function startGame() {
    stopTimer()
    rounds = pickRounds()
    roundIndex.value = 0
    score.value = 0
    combo.value = 0
    timeLeft.value = TIME_LIMIT_SEC
    lastResult.value = null
    currentRegion.value = rounds[0]
    status.value = 'playing'

    timerId = setInterval(() => {
      timeLeft.value -= 1
      if (timeLeft.value <= 0) {
        timeLeft.value = 0
        finishGame()
      }
    }, 1000)
  }

  // 지도 클릭 지점(col,row)과 정답 칸의 거리로 채점한다. 정답 칸 좌표를 반환해 뷰가 그
  // 위치에 burst 이펙트를 띄울 수 있게 한다.
  function submitGuess(col, row, toColRow) {
    if (status.value !== 'playing' || !currentRegion.value) return null

    const region = currentRegion.value
    const answer = toColRow(region.mapX, region.mapY)
    const dx = col - answer.col
    const dy = row - answer.row
    const distance = Math.sqrt(dx * dx + dy * dy)

    const correct = distance <= TOLERANCE
    let points = 0
    if (correct) {
      // 정확할수록 높은 점수 — 거리 0이면 만점, TOLERANCE에 가까워질수록 선형으로 줄어든다.
      points = Math.round(MAX_ROUND_SCORE * (1 - distance / TOLERANCE))
      combo.value += 1
      score.value += points
    } else {
      combo.value = 0
    }

    lastResult.value = { correct, points, region }

    roundIndex.value += 1
    if (roundIndex.value >= rounds.length) {
      finishGame()
    } else {
      currentRegion.value = rounds[roundIndex.value]
    }

    return answer
  }

  onUnmounted(stopTimer)

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
    startGame,
    submitGuess,
  }
}
