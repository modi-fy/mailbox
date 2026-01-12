# 익명 칭찬 우체통

> "누가 보냈는지는 모르지만, 누군가 나를 응원하고 있어요"

온보딩 기간 동안 동기들에게 익명으로 칭찬과 응원 메시지를 전달하는 디지털 롤링페이퍼 서비스입니다.

## 주요 기능

### 메시지 작성
- 동기의 우편함을 클릭하여 익명 메시지 전송
- **빠른 문구 템플릿** 5종 제공
- **편지지 디자인** 6종 (꽃, 별, 구름, 하트, 레트로, 심플)
- **손글씨 폰트** 3종 (기본, 귀여운, 정갈한)
- **스티커** 6종 선택 가능

### 내 우편함
- 받은 메시지를 카드 형태로 확인
- 메시지 클릭 시 상세 보기
- **색종이 축하 효과** (Canvas 파티클 애니메이션)
- **이미지 저장** 기능 (PNG 다운로드)

### 날아다니는 편지들
- 해리포터 스타일의 3D 편지 비행 애니메이션
- 최근 메시지들이 화면을 날아다니며 표시
- 5가지 고유한 비행 경로

### 사용자 경험
- 첫 방문 시 환영 모달로 본인 선택
- 선택한 사용자 정보 자동 저장
- 반응형 디자인 (모바일 대응)

## 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **데이터 저장**: LocalStorage
- **배포**: GitHub Pages
- **라이브러리**:
  - Google Fonts (Gaegu, Nanum Pen Script, Noto Sans KR)
  - html2canvas (이미지 저장)

## 로컬 실행

```bash
# 저장소 클론
git clone https://github.com/[username]/random-mailbox.git

# 디렉토리 이동
cd random-mailbox

# 브라우저에서 열기 (또는 Live Server 사용)
open index.html
```

## 파일 구조

```
random-mailbox/
├── index.html      # 메인 HTML
├── styles.css      # 스타일시트
├── app.js          # 애플리케이션 로직
├── PRD.md          # 기획서
└── README.md       # 프로젝트 설명
```

## 커스터마이징

### 멤버 수정
`app.js`의 `MEMBERS` 배열을 수정하세요:

```javascript
const MEMBERS = [
    { id: 'member_1', name: '이름', avatar: '🐻' },
    // ...
];
```

### 편지지/스티커 추가
`app.js`의 `PAPERS`, `STICKERS` 객체와 `styles.css`의 해당 클래스를 수정하세요.

## 라이선스

MIT License
