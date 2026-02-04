# Ralph BUILDING Loop - 2D 인형뽑기 게임

## 목표 (JTBD)
사이드뷰 2D 인형뽑기 게임을 완벽하게 작동하도록 수정

## 현재 문제
1. 집게가 안 내려가고 줄만 내려감
2. 인형 올라올 때 틀어짐
3. 충돌 감지 불안정

## 컨텍스트
- specs/game-mechanics.md - 게임 메카닉 명세
- AGENTS.md - 테스트 명령어
- IMPLEMENTATION_PLAN.md - 구현 계획

## 작업
1. specs/game-mechanics.md 읽고 요구사항 파악
2. index.html 분석하여 버그 원인 찾기
3. 2D 게임 베스트 프랙티스 적용하여 수정:
   - 집게 전체가 함께 내려가도록
   - 인형이 집게 중심에 고정되어 올라오도록
   - 충돌 감지 정확하게
4. 테스트 실행 (Playwright headed 모드)
5. 스크린샷으로 시각적 확인
6. IMPLEMENTATION_PLAN.md 업데이트 (완료 표시)
7. 커밋

## 완료 조건
모든 검증 기준 통과 후 IMPLEMENTATION_PLAN.md에 다음 추가:
STATUS: COMPLETE
