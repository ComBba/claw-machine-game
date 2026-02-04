# 인형뽑기 게임 - 에이전트 설정

## 프로젝트 개요
네온 스타일 2D 인형뽑기 게임 (HTML/CSS/JS 단일 파일)

## 테스트 명령어 (백프레셔)
```bash
# 1. 파일 유효성 검사
python3 -c "open('index.html').read()"

# 2. Playwright 테스트 실행
npx playwright test --headed

# 3. 스크린샷 촬영
npx playwright screenshot file://$(pwd)/index.html screenshots/test.png
```

## 빌드/실행
```bash
open index.html  # 브라우저에서 열기
```

## 운영 학습
- grabRadius: 40px (넓은 범위로 설정)
- 좌표계: 집게는 %, 인형은 px → 변환 필요
- 2D 사이드뷰: X축(좌우), Y축(상하)만 사용
