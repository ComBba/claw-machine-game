# 구현 계획

## 작업 목록

### 1. [DONE] 집게 하강 버그 수정
- 원인: render() 함수에서 집게 몸체 위치 미업데이트
- 해결: `els.clawBody.style.top = state.claw.y + 'px';` 추가하여 집게 몸체가 줄과 함께 남아가도록 수정

### 2. [DONE] 인형 고정 버그 수정
- 원인: CSS transition으로 인해 인형이 틀어짐, 위치 계산 미세 오차
- 해결: 
  - `.doll.caught`에 `transition: none !important` 및 `transform: none !important` 추가
  - `updateHeldDoll()`에서 인형 중심 정렬 개선 (`dollY = clawCenter.y - config.dollSize / 2`)

### 3. [DONE] 충돌 감지 개선
- 기존 grabRadius 기반 충돌 감지가 정상 작동함 (추가 수정 불필요)

### 4. [DONE] 테스트 통과
- Playwright 테스트 3회 연속 성공
- 인형 3개 이상 잡기 완료

---
STATUS: COMPLETE
