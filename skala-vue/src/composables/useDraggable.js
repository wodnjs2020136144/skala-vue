import { ref } from 'vue'

const MARGIN = 8 // 창을 화면 밖으로 완전히 던져 잃어버리지 않도록 최소한 남겨두는 여백(px)

// 뷰포트 밖으로 나가지 않도록 좌표를 clamp하는 순수 함수. useDraggable 내부(드래그 중)와
// 외부(예: 팝업이 창 리사이즈 후 실제 렌더 크기로 다시 clamp해야 하는 경우)에서 공유한다.
export function clampToViewport(x, y, width, height) {
  const maxX = window.innerWidth - width - MARGIN
  const maxY = window.innerHeight - height - MARGIN
  return {
    x: Math.min(Math.max(x, MARGIN), Math.max(MARGIN, maxX)),
    y: Math.min(Math.max(y, MARGIN), Math.max(MARGIN, maxY)),
  }
}

// 헤더를 잡고 끄는 것만으로 창을 옮길 수 있게 하는 공용 드래그 로직.
// 정보창/게임창/도시 팝업 세 곳에서 재사용한다. 팝업처럼 이미 자체 위치 계산(실측 기반
// fit-scale)을 가진 경우에도 쓸 수 있도록, 좌표만 들고 있고 렌더링 방식은 강요하지 않는다.
export function useDraggable(initial = { x: 0, y: 0 }) {
  const position = ref({ x: initial.x, y: initial.y })
  // 사용자가 직접 한 번이라도 옮겼는지 — 자동 재배치 로직(팝업 fit-scale 등)이 이 값을
  // 보고 "사용자가 옮긴 위치는 덮어쓰지 않는다"를 판단할 수 있게 한다.
  const hasMoved = ref(false)

  let pointerId = null
  let startPointerX = 0
  let startPointerY = 0
  let startX = 0
  let startY = 0
  let elWidth = 0
  let elHeight = 0

  function handlePointerMove(event) {
    if (event.pointerId !== pointerId) return
    const dx = event.clientX - startPointerX
    const dy = event.clientY - startPointerY
    position.value = clampToViewport(startX + dx, startY + dy, elWidth, elHeight)
  }

  function handlePointerUp(event) {
    if (event.pointerId !== pointerId) return
    pointerId = null
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
    window.removeEventListener('pointercancel', handlePointerUp)
  }

  // 헤더(드래그 핸들)의 @pointerdown에 연결한다. 헤더 안의 버튼 클릭과 겹치지 않도록,
  // 호출하는 쪽에서 버튼 요소 자체에는 이 핸들러를 걸지 않으면 된다.
  function startDrag(event) {
    const target = event.currentTarget
    const rect = target.closest('[data-draggable-window]')?.getBoundingClientRect() ?? target.getBoundingClientRect()
    elWidth = rect.width
    elHeight = rect.height
    pointerId = event.pointerId
    startPointerX = event.clientX
    startPointerY = event.clientY
    startX = position.value.x
    startY = position.value.y
    hasMoved.value = true

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    // 브라우저가 드래그 도중 포인터를 취소하는 경우(예: 다른 제스처와 충돌)까지 잡아 리스너가
    // 계속 남아있는 걸 막는다 — 안 잡으면 포인터를 뗀 뒤에도 창이 마우스를 계속 따라다닐 수 있다.
    window.addEventListener('pointercancel', handlePointerUp)
  }

  // 자동 배치(예: 팝업이 클릭 지점 기준으로 위치를 다시 잡는 경우) 쪽에서 호출한다.
  // width/height를 생략하면 마지막 드래그 시점에 측정된 크기로 clamp한다.
  function setPosition(x, y, width = elWidth, height = elHeight) {
    position.value = clampToViewport(x, y, width, height)
  }

  return { position, hasMoved, startDrag, setPosition }
}
