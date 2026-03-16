<!-- Created: 2026-03-16 -->

# [페이레터 캐릭터 진단 테스트](https://69b7da1b1bdc2b0008391dd2--taupe-taiyaki-ec73ab.netlify.app/)

> Payletter 브랜드 MBTI 스타일 캐릭터 진단 웹 서비스

직원·고객 대상 브랜드 체험 콘텐츠로, 10가지 질문에 답하면 16가지 페이레터 편지 배달 캐릭터 중 자신과 닮은 유형을 알려주는 진단 테스트입니다.

---

## 서비스 소개

### 사용자 화면

<p align="center">
  <img src="https://github.com/user-attachments/assets/c1ccd107-af28-4bff-be35-c41e90ba50b2" style="height:400px;">
  <img src="https://github.com/user-attachments/assets/6a6f740e-683d-4dcb-993a-21d8647f0d2b" style="height:400px;">
  <img src="https://github.com/user-attachments/assets/6e05717f-cd8c-40c4-8f16-2fb7ebf53d49" style="height:400px;">
</p>

### 관리자 화면
<p align="center">
  <img src="https://github.com/user-attachments/assets/f8f01406-303b-441b-88fd-e6e8cd0ed67a" width="32%">
  <img src="https://github.com/user-attachments/assets/41ccac25-301d-47ea-890b-98378fcd9d6a" width="32%">
  <img src="https://github.com/user-attachments/assets/eb7ece97-b905-42ae-8592-fc7a05934cf3" width="32%">
</p>


| 항목 | 내용 |
|------|------|
| 유형 | 정적 웹 SPA (Single Page Application) |
| 기술 스택 | HTML5 · CSS3 · Vanilla JavaScript (프레임워크 없음) |
| 외부 의존성 | Supabase (결과 저장, 선택) · html2canvas (이미지 저장) |
| 화면 수 | 3개 (인트로 → 질문 → 결과) |
| 질문 수 | 10문항 (A/B 선택형) |
| 캐릭터 수 | 16종 |

### 주요 기능

- **캐릭터 진단** — 10개의 A/B 질문으로 16가지 캐릭터 중 하나를 도출
- **닉네임 입력** — 테스트 시작 전 닉네임을 입력해 결과 화면에 이름이 표시됨
- **결과 공유** — 결과 텍스트 클립보드 복사 / 결과 화면 이미지(PNG) 저장
- **이전 결과 보기** — 브라우저 localStorage에 저장된 마지막 결과를 재확인
- **관리자 대시보드** — 비밀번호 인증 후 참여자 통계(캐릭터 분포, 4축 분포, 최근 참여자) 확인

---

## 진단 로직

### 4축 스코어링

10개 질문 각각의 선택(A/B)에 8개 가중치(`swift · careful · people · task · flexible · structured · idea · execution`)가 누적됩니다.

| 축 | 비교 | 결과 |
|----|------|------|
| 속도 | swift vs careful | 신속형 vs 신중형 |
| 관계 | people vs task | 사람형 vs 과제형 |
| 방식 | flexible vs structured | 유연형 vs 구조형 |
| 사고 | idea vs execution | 아이디어형 vs 실행형 |

### 16가지 캐릭터

각 축의 우세 방향 조합으로 4자리 내부 코드(예: `SPFI`)가 결정되고, 이에 대응하는 캐릭터가 반환됩니다.

| 캐릭터 | 캐릭터 | 캐릭터 | 캐릭터 |
|--------|--------|--------|--------|
| 번개 제비 | 자유 갈매기 | 아이디어 여우 | 속도 토끼 |
| 연결 돌고래 | 다정 판다 | 지혜 부엉이 | 기억 코끼리 |
| 탐험 사슴 | 정찰 독수리 | 전략 고양이 | 추진 치타 |
| 꼼꼼 비버 | 성실 펭귄 | 차분 고슴도치 | 안정 거북이 |

---

## 파일 구조

```
payletter/
├── index.html          # 진단 테스트 SPA (인트로·질문·결과 3개 화면)
├── admin.html          # 관리자 대시보드
├── css/
│   └── style.css       # 전체 스타일 (CSS 변수, 슬라이드 애니메이션)
├── images/
│   └── *.png           # 캐릭터별 일러스트 이미지 (16종, 투명 배경)
└── js/
    ├── config.js       # Supabase URL·KEY, 관리자 비밀번호 ⚠️ git 제외 권장
    ├── data.js         # QUESTIONS(10문항) · CHARACTERS(16종) 데이터
    ├── engine.js       # calculateResult() — 답변 배열 → 캐릭터 코드 계산
    ├── app.js          # 화면 전환, 질문·결과 렌더링, 이미지 저장, Supabase 저장
    └── admin.js        # 관리자 인증(sessionStorage), 통계 조회·렌더링
```

### 각 파일의 역할

**`js/data.js`**
- `QUESTIONS` — 질문 텍스트와 A/B 선택지별 가중치 정의
- `CHARACTERS` — 16개 캐릭터의 이름·설명·궁합·축 요약 정의

**`js/engine.js`**
- `calculateResult(answers)` — 답변 배열을 받아 가중치를 합산하고 캐릭터 객체를 반환
- `getAxisSummary(answers)` — 4축별 점수와 비율 반환

**`js/app.js`**
- `showScreen(id)` — 화면 전환 (fadeIn 애니메이션)
- `renderQuestion(index, direction)` — 슬라이드 애니메이션과 함께 질문 카드 렌더링
- `renderResult(character)` — 결과 화면 동적 구성 (이미지·닉네임·설명·궁합 포함)
- `saveResult(code, nickname)` — Supabase에 결과 비동기 저장 (fire-and-forget)
- `saveAsImage()` — html2canvas로 결과 화면을 PNG로 캡처·다운로드

**`js/admin.js`**
- `handleLogin()` — 비밀번호 검증 후 sessionStorage에 인증 상태 저장
- `fetchStats()` — Supabase에서 전체 결과 조회 (미설정 시 더미 데이터 반환)
- `aggregateStats(rows)` — 캐릭터별 카운트, 4축 분포 집계
- `renderCharacterChart()` — CSS 막대 차트 렌더링 (응답 수 내림차순)
- `renderRecentList()` — 최근 참여자 20명 테이블 렌더링

---

## 로컬 실행

빌드 없이 바로 실행됩니다. CORS 이슈 방지를 위해 정적 서버를 사용하세요.

```bash
# Python 3
python3 -m http.server 8080

# Node.js
npx serve .
```

브라우저에서 `http://localhost:8080` 접속.

---

## Supabase 연동 (선택)

Supabase를 연결하면 테스트 결과가 DB에 누적되고 관리자 페이지에서 실시간 통계를 확인할 수 있습니다. **연결하지 않아도 진단 테스트는 정상 동작합니다.**

### 1단계 — Supabase 프로젝트 생성

[supabase.com](https://supabase.com) 에서 계정 생성 후 **New project** 클릭.

### 2단계 — results 테이블 생성

Supabase 대시보드 → **SQL Editor** → 아래 SQL 실행:

```sql
create table results (
  id          bigserial    primary key,
  result_code text         not null,
  nickname    text,
  created_at  timestamptz  not null default now()
);

-- 익명 사용자 읽기/쓰기 허용 (RLS 정책)
alter table results enable row level security;

create policy "allow anon insert"
  on results for insert to anon
  with check (true);

create policy "allow anon select"
  on results for select to anon
  using (true);
```

### 3단계 — config.js에 키 입력

Supabase 대시보드 → **Project Settings → API** 에서 URL과 anon key를 확인하고 `js/config.js`에 입력:

```javascript
const SUPABASE_URL  = 'https://<project-id>.supabase.co';
const SUPABASE_KEY  = 'eyJ...';
const ADMIN_PASSWORD = '원하는_관리자_비밀번호';
```

> `js/config.js`는 `.gitignore`에 추가해 키가 공개 저장소에 노출되지 않도록 주의하세요.

---

## 관리자 페이지

`/admin.html` 접속 → 설정한 `ADMIN_PASSWORD` 입력

| 섹션 | 내용 |
|------|------|
| 총 참여자 | 누적 테스트 완료 인원 |
| 캐릭터별 분포 | 16종 결과 막대 차트 (내림차순) |
| 4축 분포 요약 | 속도·관계·스타일·사고 축별 좌우 비율 |
| 최근 참여자 | 닉네임·캐릭터·참여 일시 (최대 20명) |

Supabase 미설정 상태에서는 랜덤 더미 데이터로 레이아웃을 미리 확인할 수 있습니다.

---

## 특정 캐릭터 결과 테스트

`index.html` 브라우저 콘솔에서 바로 확인:

```javascript
// 전체 캐릭터 코드 목록
Object.keys(CHARACTERS)

// 특정 캐릭터 결과 화면으로 이동
appState.nickname = '테스트';
appState.result   = 'SPFI';
renderResult(CHARACTERS['SPFI']);
showScreen('screen-result');

// 3초 간격으로 16개 전체 순환
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
