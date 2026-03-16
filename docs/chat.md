<!-- Created: 2026-03-16 -->

# 페이레터 캐릭터 진단 테스트 — 개발 대화 로그

> Claude Code와의 전체 작업 내역을 정리한 문서입니다.

---

## 1. 프로젝트 초기 설정 (`/init`)

**작업 내용**
- 기존 코드베이스를 분석하여 `CLAUDE.md` 생성
- 프로젝트 구조 파악 및 문서화

---

## 2. 프로젝트 뼈대 생성

**요청**
> 다음 조건에 맞는 웹 프로젝트 뼈대를 생성해 줘.

**생성된 파일**
| 파일 | 설명 |
|------|------|
| `index.html` | 진단 테스트 SPA (인트로·질문·결과 3개 화면) |
| `admin.html` | 관리자 대시보드 |
| `css/style.css` | 공통 스타일 (CSS 변수, 애니메이션) |
| `js/data.js` | 질문·캐릭터 데이터 |
| `js/engine.js` | 결과 계산 엔진 |
| `js/app.js` | 화면 전환 및 앱 흐름 |
| `js/admin.js` | 관리자 페이지 로직 |

**주요 설계 결정**
- 프레임워크 없는 순수 Vanilla JS SPA
- CSS Custom Properties로 브랜드 컬러 관리
- `touch-action: manipulation`으로 모바일 300ms 탭 딜레이 제거

---

## 3. 데이터 및 엔진 구현

**요청**
> `js/data.js`와 `js/engine.js`를 완성해 줘.

**구현 내용**

### 4축 스코어링 시스템
| 축 | 가중치 비교 | 결과 |
|----|-----------|------|
| 속도 | swift vs careful | S / C |
| 관계 | people vs task | P / T |
| 방식 | flexible vs structured | F / T |
| 사고 | idea vs execution | I / E |

### 주요 함수
- `calculateResult(answers)` — 10개 답변 배열 → 캐릭터 객체 반환
- `getAxisSummary(answers)` — 4축별 점수·비율 반환
- `_weightsToCode(w)` — 가중치 → 4자리 코드 변환

**버그 수정**
- Axis3 코드 충돌: `structured`의 결과값을 `'S'` → `'T'`로 수정 (Axis1의 swift `'S'`와 충돌 방지)

---

## 4. 16가지 캐릭터 데이터 + 결과 화면

**요청**
> `js/data.js`에 CHARACTERS 객체를 추가하고, 결과 화면을 완성해 줘.

**캐릭터 스키마**
```javascript
{
  code,           // 내부 4자리 코드 (SPFI 등)
  characterName,  // 캐릭터 이름 (번개 제비 등)
  emoji,          // 대표 이모지
  similarMBTI,    // 유사 MBTI
  title,          // 한줄 소개
  description[],  // 상세 설명 (9줄)
  axes[],         // 4축 요약 칩
  chemistry: {
    best:  { name, reason },  // 최고 궁합
    worst: { name, reason },  // 주의 궁합
  }
}
```

**16종 캐릭터**

| | | | |
|--|--|--|--|
| 번개 제비 🐦 | 자유 갈매기 🕊️ | 아이디어 여우 🦊 | 속도 토끼 🐇 |
| 연결 돌고래 🐬 | 다정 판다 🐼 | 지혜 부엉이 🦉 | 기억 코끼리 🐘 |
| 탐험 사슴 🦌 | 정찰 독수리 🦅 | 전략 고양이 🐱 | 추진 치타 🐆 |
| 꼼꼼 비버 🦫 | 성실 펭귄 🐧 | 차분 고슴도치 🦔 | 안정 거북이 🐢 |

---

## 5. 질문 화면 + 전체 플로우 연결

**요청**
> 질문 화면을 완성하고, 인트로 → 질문 → 결과 전체 플로우를 연결해 줘.

**구현 내용**
- `renderQuestion(index, direction)` — 슬라이드 애니메이션으로 질문 카드 전환
- A/B 선택지 버튼 (원형 키 레이블)
- 이전으로 버튼 (Q1에서 disabled)
- localStorage에 결과 저장 / 이전 결과 보기
- 결과 복사하기 (Clipboard API + textarea 폴백)

---

## 6. 관리자 페이지 + Supabase 연동

**요청**
> `admin.html`과 `js/admin.js`를 완성하고, 결과 저장 API 연동까지 구현해 줘.

**구현 내용**

### `js/config.js` 신규 생성
```javascript
const SUPABASE_URL   = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY   = 'YOUR_SUPABASE_ANON_KEY';
const ADMIN_PASSWORD = 'YOUR_ADMIN_PASSWORD';
```

### Supabase 테이블 스키마
```sql
create table results (
  id          bigserial    primary key,
  result_code text         not null,
  nickname    text,
  created_at  timestamptz  not null default now()
);
```

### 관리자 대시보드 기능
- 비밀번호 인증 (sessionStorage)
- 총 참여자 수
- 캐릭터별 분포 막대 차트 (CSS 애니메이션)
- 4축 분포 좌우 분할 바
- 최근 참여자 20명 테이블 (닉네임·캐릭터·일시)
- config 미설정 시 더미 데이터로 레이아웃 미리보기

---

## 7. 디자인 개선 4가지

**요청**
1. 임의로 만든 MBTI 형식의 영어 코드 노출 제거 (SPFI, CPFE 등)
2. 페이레터 로고 색상으로 디자인 변경
3. 결과를 이미지로 저장하는 기능 추가
4. 닉네임 입력 기능 추가

### 1) 영어 코드 제거
- 결과 화면에서 `badge--code` (SPFI 등), `badge--mbti` (ENFP 등) 제거
- 대신 `badge--type`으로 첫 두 축 특성만 표시 (예: "빠른 전달 · 사람 중심")
- 관리자 차트에서도 코드 뱃지 제거

### 2) 브랜드 컬러 적용
| 변경 전 | 변경 후 |
|--------|--------|
| `--color-primary: #5B4FE8` (보라) | `--color-primary: #00B7AA` (teal) |
| `--color-secondary: #FF6B9D` (핑크) | `--color-secondary: #00284D` (네이비) |
| `--color-bg: #F0F4FF` | `--color-bg: #F0FAFA` |
| `--color-text: #1A1A2E` | `--color-text: #00284D` |

결과 헤더 카드 → 네이비 그라데이션 배경으로 변경

### 3) 이미지 저장
- `html2canvas` CDN 추가
- "이미지로 저장" 버튼 (`btn--navy`) 추가
- `saveAsImage()` — `#result-content`를 2x 해상도로 캡처 → PNG 다운로드
- 파일명: `payletter_캐릭터명.png`

### 4) 닉네임 입력
- 인트로 화면에 닉네임 입력 필드 추가 (빈 채로 시작 시 에러 메시지)
- 결과 헤더에 "○○님의 결과" 표시
- Supabase INSERT에 `nickname` 필드 추가
- `appState.nickname` 및 localStorage 저장

---

## 8. 관리자 로그인 에러 수정

**문제**
> 로그인하면 결과 화면이 나오지 않고 데이터를 불러오지 못했다는 화면이 뜸

**원인**
- Supabase에 `nickname` 컬럼이 없는 경우, `select=result_code,nickname,created_at` 쿼리가 **400 에러** 반환
- `SUPABASE_KEY` 미설정 체크 누락

**수정 내용**
```javascript
// 변경 전
if (!SUPABASE_URL || SUPABASE_URL === 'YOUR_SUPABASE_URL') { ... }
`select=result_code,nickname,created_at`

// 변경 후
if (!SUPABASE_URL || SUPABASE_URL === 'YOUR_SUPABASE_URL' ||
    !SUPABASE_KEY || SUPABASE_KEY === 'YOUR_SUPABASE_ANON_KEY') { ... }
`select=*`  // 없는 컬럼 요청 시 에러 방지
```

**기존 테이블에 nickname 컬럼 추가**
```sql
alter table results add column if not exists nickname text;
```

---

## 9. 4축 분포 알파벳 제거

**요청**
> 4축 분포 요약에서 S, C, P, T 등 알파벳 모두 없애줘.

**수정 내용**
```javascript
// 변경 전
{ left: 'S (신속형)', right: 'C (신중형)' }

// 변경 후
{ left: '신속형', right: '신중형' }
```

---

## 10. 캐릭터 이미지 연동

**요청**
> 캐릭터별 이미지 파일(PNG)을 결과 화면에 띄워줘.

**구현 내용**
- `images/` 폴더에 16종 PNG 파일 (파일명 = 캐릭터 이름, 띄어쓰기 포함)
- `encodeURIComponent(character.characterName)` 로 파일명 URL 인코딩
- `onerror` 폴백: 이미지 로드 실패 시 이모지로 대체

```javascript
`<img
  class="result__char-img"
  src="images/${encodeURIComponent(character.characterName)}.png"
  alt="${character.characterName}"
  onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
/>`
```

---

## 11. 이미지 배경 투명화 + 닉네임 정렬

**요청**
> 이미지 배경이 흰색인데 모두 투명으로 바꿔줘. 닉네임도 가운데 정렬해줘.

**배경 투명화 (Python / Pillow)**
- 4개 모서리에서 BFS flood-fill로 흰색 영역(RGB 230+) 탐색
- 해당 픽셀을 alpha=0으로 처리
- 16개 PNG 파일 모두 덮어쓰기

**닉네임 정렬**
```css
.result__nickname-tag {
  display: block;
  text-align: center;
}
```

---

## 12. 이미지 크기 정규화

**요청**
> 이미지마다 캐릭터 크기가 각기 다른 것 같아. 동일한 이미지 크기로 나오도록 해줘.

**원인**
이미지별로 투명 여백이 달라 같은 `width/height`를 줘도 캐릭터 실제 크기가 달라 보임

**Python 정규화 처리**
1. 불투명 픽셀의 bounding box 계산 (`img.getbbox()`)
2. 잘라낸 캐릭터를 최대 352px로 스케일 (24px 패딩 확보)
3. 400×400 투명 캔버스 정중앙에 배치

| 파일 | 원본 크기 | 캔버스 |
|------|---------|--------|
| 기억 코끼리 | 615×476 | 400×400 |
| 꼼꼼 비버 | 818×846 | 400×400 |
| … | … | 400×400 |

---

## 13. 캐릭터별 결과 화면 테스트 방법

**요청**
> 캐릭터마다 결과 페이지가 정상적으로 잘 나오는지 테스트할 수 있는 방법 알려줘.

**브라우저 콘솔 명령어**

```javascript
// 전체 캐릭터 코드 목록
Object.keys(CHARACTERS)

// 특정 캐릭터 결과 화면으로 이동
appState.nickname = '테스트';
appState.result   = 'SPFI';
renderResult(CHARACTERS['SPFI']);
showScreen('screen-result');

// 3초 간격으로 16개 전체 자동 순환
const codes = Object.keys(CHARACTERS);
let i = 0;
const t = setInterval(() => {
  appState.result = codes[i];
  appState.nickname = '테스트';
  renderResult(CHARACTERS[codes[i]]);
  showScreen('screen-result');
  console.log(`[${i+1}/16] ${CHARACTERS[codes[i]].characterName}`);
  if (++i >= codes.length) clearInterval(t);
}, 3000);
```

---

## 14. README.md 작성

**요청**
> 프로젝트를 아무것도 모르는 사람이 보았을 때 알 수 있도록 README.md를 작성해줘.

**포함 내용**
- 서비스 소개 및 기술 스택
- 진단 로직 (4축 스코어링, 16가지 캐릭터)
- 파일 구조 및 각 파일별 역할 설명
- 로컬 실행 방법
- Supabase 연동 3단계 가이드
- 관리자 페이지 안내
- 콘솔 테스트 명령어