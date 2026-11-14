# UP & DOWN 웹앱

바닐라 JavaScript로 구현한 반응형 숫자 맞히기 게임입니다.

## 주요 기능

- 쉬움, 보통, 어려움 난이도
- UP/DOWN 판정 및 실시간 유효 범위 갱신
- 남은 기회 및 입력 기록 표시
- 승리·실패 결과 화면
- 난이도별 최고 기록 `localStorage` 저장
- Web Share API 및 클립보드 공유
- Web Audio API 기반 효과음
- 모바일 진동 피드백
- 키보드 조작 및 스크린 리더 접근성
- 모바일·태블릿·데스크톱 반응형 UI

## 프로젝트 구조

```text
updown-game/
├── index.html
├── assets/
│   └── favicon.svg
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── style.css
│   └── responsive.css
├── js/
│   ├── main.js
│   ├── game.js
│   ├── ui.js
│   ├── storage.js
│   ├── share.js
│   ├── audio.js
│   └── constants.js
└── README.md
```

## 실행 방법

이 프로젝트는 ES Modules를 사용하므로 `index.html`을 파일로 직접 여는 대신 로컬 서버를 실행해야 합니다.

### Python 사용

```bash
cd updown-game
python -m http.server 8000
```

브라우저에서 `http://localhost:8000`으로 접속합니다.

### Node.js 사용

```bash
npx serve .
```

명령 실행 후 터미널에 표시되는 주소로 접속합니다.

## 배포

정적 웹앱이므로 다음 서비스에 프로젝트 폴더를 그대로 배포할 수 있습니다.

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

## 참고

- 최고 기록과 사운드 설정은 브라우저의 `localStorage`에 저장됩니다.
- 브라우저 데이터를 삭제하면 기록도 삭제됩니다.
- 경쟁형 랭킹 기능을 추가할 경우 서버 기반 정답 생성 및 결과 검증이 필요합니다.
