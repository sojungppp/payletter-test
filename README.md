# 페이레터 캐릭터 진단 테스트

> Payletter 브랜드 MBTI 스타일 캐릭터 진단 웹 서비스

**🔗 배포 URL: [taupe-taiyaki-ec73ab.netlify.app](https://taupe-taiyaki-ec73ab.netlify.app/)**

10가지 질문에 답하면 16가지 페이레터 편지 배달 캐릭터 중 자신과 닮은 유형을 알려주는 진단 테스트입니다.

---

## 화면 소개

### 사용자 화면

| 인트로 | 질문 | 결과 |
|--------|------|------|
| 닉네임 입력 · 이전 결과 보기 | A/B 선택 · 진행 바 · 이전으로 | 캐릭터 카드 · 궁합 · 공유 |
|<img src="https://github.com/user-attachments/assets/c1ccd107-af28-4bff-be35-c41e90ba50b2" style="height:400px;">|<img src="https://github.com/user-attachments/assets/6a6f740e-683d-4dcb-993a-21d8647f0d2b" style="height:400px;">|<img src="https://github.com/user-attachments/assets/6e05717f-cd8c-40c4-8f16-2fb7ebf53d49" style="height:400px;">|

### 관리자 화면

| 비밀번호 인증 | 캐릭터 분포 차트 | 최근 참여자 목록 |
|--------------|----------------|----------------|
|<img src="https://github.com/user-attachments/assets/f8f01406-303b-441b-88fd-e6e8cd0ed67a" width="400px;">|<img src="https://github.com/user-attachments/assets/41ccac25-301d-47ea-890b-98378fcd9d6a" width="400px;">|<img src="https://github.com/user-attachments/assets/eb7ece97-b905-42ae-8592-fc7a05934cf3" width="400px;">|

---

## 기능 소개

### 사용자 기능

| 기능 | 설명 |
|------|------|
| **캐릭터 진단** | 10개 A/B 질문으로 16가지 캐릭터 중 하나를 도출 |
| **닉네임 입력** | 최대 20자, 실시간 글자 수 카운터, Enter 키 제출 지원 |
| **진행 바** | Q1부터 진행률 표시, 이전 문항 이동 가능 |
| **키보드 단축키** | `A` / `1` → A 선택지, `B` / `2` → B 선택지 |
| **결과 공유** | URL 파라미터(`?result=XXXX`) 기반 공유 링크 자동 생성 |
| **결과 복사** | 캐릭터 정보 + 공유 링크를 클립보드에 복사 |
| **이미지 저장** | 결과 화면을 PNG로 캡처해 다운로드 (html2canvas 지연 로딩) |
| **이전 결과 보기** | localStorage에 저장된 마지막 결과 재확인 |

### 관리자 기능 (`/admin.html`)

| 기능 | 설명 |
|------|------|
| **비밀번호 인증** | sessionStorage 기반 로그인 유지 |
| **총 참여자** | 누적 테스트 완료 인원 |
| **캐릭터별 분포** | 16종 결과 막대 차트 (내림차순) |
| **4축 분포** | 속도·관계·스타일·사고 축별 좌우 비율 |
| **최근 참여자** | 닉네임·캐릭터·참여 일시 (최대 20명) |

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| 유형 | 정적 웹 SPA (Single Page Application) |
| 프론트엔드 | HTML5 · CSS3 · Vanilla JavaScript (프레임워크 없음) |
| 백엔드 | Netlify Functions (서버리스) |
| DB | Supabase (PostgreSQL) |
| 배포 | Netlify |
| 외부 라이브러리 | html2canvas (이미지 저장, 지연 로딩) |

---

## 진단 로직

### 4축 스코어링

10개 질문 각각의 선택(A/B)에 8개 가중치(`swift · careful · people · task · flexible · structured · idea · execution`)가 누적됩니다.

| 축 | 비교 | 결과 코드 |
|----|------|-----------|
| 속도 | swift vs careful | `S` vs `C` |
| 관계 | people vs task | `P` vs `T` |
| 방식 | flexible vs structured | `F` vs `T` |
| 사고 | idea vs execution | `I` vs `E` |

### 16가지 캐릭터

각 축의 우세 방향 조합으로 4자리 코드(예: `SPFI`)가 결정됩니다.

| | | | |
|--|--|--|--|
| 번개 제비 | 자유 갈매기 | 아이디어 여우 | 속도 토끼 |
| 연결 돌고래 | 다정 판다 | 지혜 부엉이 | 기억 코끼리 |
| 탐험 사슴 | 정찰 독수리 | 전략 고양이 | 추진 치타 |
| 꼼꼼 비버 | 성실 펭귄 | 차분 고슴도치 | 안정 거북이 |

---

## 파일 구조

```
payletter/
├── index.html                  # 진단 테스트 SPA (인트로·질문·결과)
├── admin.html                  # 관리자 대시보드
├── netlify.toml                # Netlify 빌드 설정
├── css/
│   └── style.css               # 전체 스타일 (CSS 변수, 슬라이드 애니메이션)
├── images/
│   └── *.png                   # 캐릭터 일러스트 (16종)
├── js/
│   ├── config.js               # 런타임 설정 (빌드 시 자동 생성, git 제외)
│   ├── config.example.js       # config.js 템플릿
│   ├── data.js                 # QUESTIONS · CHARACTERS 데이터
│   ├── engine.js               # calculateResult() — 답변 → 캐릭터 코드 계산
│   ├── app.js                  # 화면 전환, 렌더링, Netlify Function 호출
│   └── admin.js                # 관리자 인증, 통계 조회·렌더링
├── netlify/
│   └── functions/
│       ├── save-result.js      # 결과 저장 프록시 (POST)
│       └── get-stats.js        # 통계 조회 프록시 (GET)
└── scripts/
    └── build-config.js         # 빌드 시 config.js 자동 생성
```

---

## 로컬 실행

```bash
# Python 3
python3 -m http.server 8080

# Node.js
npx serve .
```

`http://localhost:8080` 접속. (로컬에서는 Netlify Functions가 동작하지 않아 Supabase 저장은 비활성화됩니다.)

---

## 배포 설정 (Netlify)

### 1단계 — Supabase 테이블 생성

Supabase 대시보드 → **SQL Editor** → 실행:

```sql
create table results (
  id          bigserial    primary key,
  result_code text         not null,
  nickname    text,
  created_at  timestamptz  not null default now()
);

alter table results enable row level security;

create policy "allow anon insert"
  on results for insert to anon
  with check (true);

create policy "allow anon select"
  on results for select to anon
  using (true);
```

### 2단계 — Netlify 환경변수 설정

Netlify 대시보드 → **Site settings → Environment variables** 에서 추가:

| 변수명 | 값 |
|--------|-----|
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_KEY` | Supabase `anon` public 키 |
| `ADMIN_PASSWORD` | 관리자 페이지 비밀번호 |

> `SUPABASE_URL` / `SUPABASE_KEY` 는 Netlify Functions(서버사이드)에서만 사용되며 브라우저에 노출되지 않습니다.

### 3단계 — 배포

환경변수 저장 후 **Deploys → Trigger deploy** 또는 `main` 브랜치에 push.

---

## 결과 URL 직접 공유

`?result=캐릭터코드` 파라미터로 특정 캐릭터 결과를 바로 공유할 수 있습니다.

```
https://taupe-taiyaki-ec73ab.netlify.app/?result=SPFI
```

테스트 완료 시 URL이 자동으로 업데이트되고, "결과 복사하기" 버튼 텍스트에 공유 링크가 포함됩니다.

---

## 개발 참고

### 특정 캐릭터 결과 확인 (브라우저 콘솔)

```javascript
// 전체 캐릭터 코드 목록
Object.keys(CHARACTERS)

// 특정 캐릭터 결과 화면으로 이동
appState.nickname = '테스트';
appState.result   = 'SPFI';
renderResult(CHARACTERS['SPFI']);
showScreen('screen-result');
```
