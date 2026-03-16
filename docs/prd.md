# PRD: 나는 어떤 페이레터 캐릭터일까?
**Product Requirements Document v1.0**

---

## 1. Product Overview

### 1.1 제품 요약
페이레터(Payletter) 브랜드 아이덴티티를 기반으로 한 MBTI 스타일의 캐릭터 진단 테스트 웹사이트.
사용자가 10개의 A/B 질문에 답하면 4개 축의 가중치 점수를 계산해 16개 동물 캐릭터 중 하나를 결과로 제공한다.

### 1.2 핵심 컨셉
- **브랜드 의미**: Pay + Letter → 편지를 배달하는 동물 캐릭터 테마
- **톤앤매너**: 가볍고 유쾌하며 따뜻한 직장인 친화적 분위기
- **목적**: 사내외 브랜드 경험 강화 + 바이럴 공유 유도
- **금지 주제**: 불편할 수 있는 직장 소재

### 1.3 제품 목표
1. 누구나 URL로 접근해 테스트를 완료할 수 있어야 한다
2. 결과를 쉽게 복사·공유할 수 있어야 한다
3. 관리자는 별도 대시보드에서 캐릭터별 결과 통계를 확인할 수 있어야 한다
4. 백엔드 없이 프론트엔드만으로 사용자 경험을 완결할 수 있어야 한다 (통계 제외)

---

## 2. Goals & Success Metrics

| 목표 | 측정 지표 | 목표값 |
|------|-----------|--------|
| 테스트 완료율 | 시작 대비 결과 도달 비율 | ≥ 80% |
| 공유 전환율 | 결과 복사 버튼 클릭 비율 | ≥ 40% |
| 재테스트율 | 다시 테스트하기 클릭 비율 | ≥ 20% |
| 모바일 사용성 | 모바일 완료율 | ≥ 75% |
| 관리자 활용 | 통계 대시보드 조회 가능 여부 | 100% 구현 |

---

## 3. Target Users

### 3.1 Primary User — 일반 테스트 참여자
- **대상**: 페이레터 임직원 및 브랜드에 관심 있는 외부 방문자
- **접근 방식**: URL 직접 공유, SNS 링크, 사내 공지
- **기기**: 모바일 50% / PC 50% 예상
- **기대 경험**: 빠르고 재미있는 테스트 → 나를 닮은 캐릭터 발견 → 동료에게 공유

### 3.2 Secondary User — 관리자
- **대상**: 페이레터 내부 담당자 (HR, 마케팅 등)
- **접근 방식**: 별도 관리자 URL 또는 패스워드 보호 페이지
- **기대 경험**: 캐릭터별 응답 분포 확인, 총 참여자 수 파악

---

## 4. User Flow

### 4.1 일반 사용자 플로우
```
[랜딩/인트로 화면]
    → 제목, 브랜드 설명, CTA 버튼
    → "테스트 시작하기" 클릭
        ↓
[질문 화면 Q1 ~ Q10]
    → 진행바 표시 (1/10 ~ 10/10)
    → A 또는 B 선택 → 자동으로 다음 질문 이동
    → 뒤로가기 버튼 제공 (이전 질문 수정 가능)
        ↓
[결과 계산 (프론트엔드)]
    → 4축 점수 합산 → 승자 결정 → 4자리 코드 생성 → 캐릭터 매핑
    → 결과를 localStorage에 저장
    → 통계 API 또는 localStorage 집계 업데이트
        ↓
[결과 화면]
    → 캐릭터 이모지 + 이름 + 결과 코드
    → 유사 MBTI, 한줄 소개
    → 설명 텍스트 (8~10줄)
    → 최고의 궁합 / 최악의 궁합 + 이유
    → 축 요약 (빠른 전달 / 사람 중심 / 유연 / 아이디어형 등)
    → [결과 복사하기] [다시 테스트하기] 버튼
        ↓
[새로고침 복원]
    → localStorage에 결과 있으면 결과 화면 바로 표시
    → "다시 테스트하기" 클릭 시 인트로로 이동
```

### 4.2 관리자 플로우
```
[관리자 페이지 /admin]
    → 패스워드 입력 화면
    → 인증 성공 시 대시보드 진입
        ↓
[통계 대시보드]
    → 총 테스트 완료 수
    → 캐릭터별 응답 수 + 비율 (막대 차트)
    → 4축별 분포 (Swift vs Careful 등)
    → 날짜별 참여 추이 (선택)
```

---

## 5. Feature Requirements

### Feature 1: 인트로 화면
| 항목 | 내용 |
|------|------|
| **목적** | 브랜드 첫인상 전달 및 테스트 진입 유도 |
| **User Story** | 방문자로서, 이 테스트가 무엇인지 한눈에 이해하고 바로 시작하고 싶다 |
| **구성 요소** | 브랜드 로고 텍스트, 앱 제목, 부제목(10문항 / 약 3분 소요), CTA 버튼 |
| **동작** | CTA 클릭 → Q1으로 이동, localStorage 기존 결과 있으면 "이전 결과 보기" 옵션 제공 |
| **엣지 케이스** | 이전 결과가 있을 때: "이전 결과 보기" + "새로 시작하기" 두 옵션 노출 |

---

### Feature 2: 질문 플로우
| 항목 | 내용 |
|------|------|
| **목적** | 10개 A/B 질문을 통해 사용자 성향 데이터 수집 |
| **User Story** | 사용자로서, 질문에 집중할 수 있는 깔끔한 화면에서 빠르게 선택하고 싶다 |
| **구성 요소** | 질문 번호 (N/10), 진행 바, 질문 텍스트, A버튼, B버튼, 이전으로 버튼 |
| **동작** | 선택 즉시 다음 질문으로 전환 (자동 스크롤), 10번 완료 시 결과 계산 진입 |
| **입력** | 각 질문에 대한 A 또는 B 선택값 (배열로 저장) |
| **출력** | 10개 답변 배열 |
| **엣지 케이스** | 뒤로가기 시 이전 선택값 유지, Q1에서 이전 버튼 비활성화 |

**질문 목록 (10개)**

| # | 질문 | A 가중치 | B 가중치 |
|---|------|----------|----------|
| Q1 | 새로운 아이디어가 떠올랐을 때 나는 | Swift+1, People+1 | Careful+1, Task+1 |
| Q2 | 회의에서 의견을 낼 때 나는 | Swift+1, Idea+1 | Careful+1, Execution+1 |
| Q3 | 협업할 때 나는 | People+1 | Task+1 |
| Q4 | 프로젝트가 시작되면 | Flexible+1, Idea+1 | Structured+1, Execution+1 |
| Q5 | 정보를 전달할 때 나는 | Swift+1 | Careful+1 |
| Q6 | 업무 진행 방식은 | Flexible+1 | Structured+1 |
| Q7 | 문제를 해결할 때 나는 | Idea+1 | Execution+1 |
| Q8 | 새로운 사람과 협업할 때 나는 | People+1, Swift+1 | Task+1, Careful+1 |
| Q9 | 아이디어를 발전시킬 때 나는 | Idea+1 | Execution+1 |
| Q10 | 업무 스타일은 | Flexible+1 | Structured+1 |

---

### Feature 3: 결과 계산 엔진
| 항목 | 내용 |
|------|------|
| **목적** | 답변 배열을 4축 점수로 변환하고 16개 캐릭터 중 1개를 결정 |
| **로직** | Swift vs Careful / People vs Task / Flexible vs Structured / Idea vs Execution 각각 합산 |
| **타이 브레이킹** | Careful ≥ Swift → C, Task ≥ People → T, Structured ≥ Flexible → S, Execution ≥ Idea → E |
| **출력** | 4자리 결과 코드 (예: SPFI) → 캐릭터 객체 반환 |
| **엣지 케이스** | 모든 동점 처리 규칙을 명확히 코드에 반영, 존재하지 않는 코드 방어 로직 포함 |

**결과 코드 매핑표 (16개)**

| 코드 | 캐릭터 | 유사 MBTI |
|------|--------|-----------|
| SPFI | 번개 제비 | ENFP |
| SPFE | 자유 갈매기 | ESFP |
| SPTI | 아이디어 여우 | ENTP |
| SPTE | 속도 토끼 | ESTP |
| CPFI | 연결 돌고래 | INFP |
| CPFE | 다정 판다 | ISFP |
| CPTI | 지혜 부엉이 | INTJ |
| CPTE | 기억 코끼리 | ISTJ |
| STFI | 탐험 사슴 | ENFJ |
| STFE | 정찰 독수리 | ENTJ |
| STTI | 전략 고양이 | INTP |
| STTE | 추진 치타 | ESTJ |
| CTFI | 꼼꼼 비버 | INFJ |
| CTFE | 성실 펭귄 | ISFJ |
| CTTI | 차분 고슴도치 | INTP |
| CTTE | 안정 거북이 | ISTJ |

---

### Feature 4: 결과 화면
| 항목 | 내용 |
|------|------|
| **목적** | 결과를 시각적으로 보여주고 공유 욕구를 자극 |
| **구성 요소** | 캐릭터 이모지+이름, 결과 코드 뱃지, 유사 MBTI, 한줄 소개, 설명 블록, 궁합 카드(최고/최악), 축 요약 칩 4개, 버튼 2개 |
| **공유 복사 포맷** | `나는 페이레터 편지 배달 캐릭터 테스트 결과 [번개 제비]!\n유사 MBTI는 ENFP,\n한줄 소개는 '아이디어를 가장 먼저 물어오는 초고속 소식통'\n최고의 궁합은 꼼꼼 비버, 최악의 궁합은 안정 거북이!` |
| **localStorage** | 결과 코드 + 타임스탬프 저장 (새로고침 복원용) |
| **엣지 케이스** | 클립보드 API 미지원 브라우저 → textarea fallback 복사 처리 |

---

### Feature 5: 관리자 통계 대시보드
| 항목 | 내용 |
|------|------|
| **목적** | 내부 담당자가 캐릭터별 응답 분포를 확인 |
| **접근 경로** | `/admin` 또는 `?page=admin` 파라미터 |
| **인증 방식** | 환경변수 또는 하드코딩 패스워드 (MVP 기준) |
| **표시 데이터** | 총 완료 수, 캐릭터별 응답 수 + %, 4축별 분포 비율 |
| **데이터 수집 방법** | 결과 확정 시 서버리스 함수(Vercel Function) 또는 외부 무료 DB(예: Supabase, Firebase)에 결과 코드 + 타임스탬프 저장 |
| **엣지 케이스** | 데이터 없을 때 빈 상태 UI 표시, 잘못된 패스워드 시 에러 메시지 |

> **Note**: 통계 기능은 최소한의 백엔드(서버리스 함수 or 외부 DB)가 필요합니다. 프론트엔드 단독으로는 여러 기기 간 집계가 불가능합니다.

---

## 6. Technical Architecture

### 6.1 전체 구조
```
[사용자 브라우저]
    ↕ HTML/CSS/JS (정적 파일)
[정적 호스팅 — Vercel / Netlify / GitHub Pages]
    ↕ API 호출 (결과 저장 시만)
[서버리스 함수 or 외부 DB]
    - 결과 코드 + timestamp 저장
    - 통계 집계 API 제공
```

### 6.2 프론트엔드 구조
- **기술**: 순수 HTML5 + CSS3 + Vanilla JavaScript (ES6+)
- **단일 파일 구성** 또는 아래 파일 분리 권장:

```
/
├── index.html          # 메인 진입점 (모든 화면 포함)
├── admin.html          # 관리자 대시보드
├── css/
│   └── style.css       # 전체 스타일
├── js/
│   ├── data.js         # 질문 데이터 + 캐릭터 결과 데이터
│   ├── engine.js       # 점수 계산 + 결과 매핑 로직
│   ├── app.js          # 화면 전환 + 이벤트 핸들러
│   └── admin.js        # 관리자 통계 렌더링
└── assets/
    └── (이모지 or 캐릭터 이미지)
```

### 6.3 백엔드 구조 (통계용 최소 구성)
- **옵션 A (권장)**: Supabase 무료 플랜
  - `results` 테이블: `id, result_code, created_at`
  - REST API로 INSERT / SELECT
- **옵션 B**: Vercel Serverless Function
  - `POST /api/result` → DB 저장
  - `GET /api/stats` → 집계 반환
- **옵션 C (오프라인 fallback)**: localStorage 집계 (단일 기기 한정)

### 6.4 State Management
```javascript
// 앱 상태 객체 (메모리)
const appState = {
  currentScreen: 'intro',   // 'intro' | 'question' | 'result'
  currentQuestion: 0,        // 0~9
  answers: [],               // ['A','B','A', ...]
  result: null               // 결과 캐릭터 객체
}

// 영구 저장 (localStorage)
localStorage.setItem('pl_result', JSON.stringify({
  code: 'SPFI',
  characterName: '번개 제비',
  timestamp: Date.now()
}))
```

---

## 7. Data Model

### 7.1 질문 데이터 구조
```javascript
{
  id: 1,
  question: "새로운 아이디어가 떠올랐을 때 나는",
  options: {
    A: { text: "바로 공유해본다", weights: { swift: 1, people: 1 } },
    B: { text: "정리한 뒤 공유한다", weights: { careful: 1, task: 1 } }
  }
}
```

### 7.2 캐릭터 결과 데이터 구조
```javascript
{
  code: "SPFI",
  characterName: "번개 제비",
  emoji: "🐦",
  similarMBTI: "ENFP",
  title: "아이디어를 가장 먼저 물어오는 초고속 소식통",
  description: ["번개 제비는 페이레터의 초고속 편지 배달부입니다.", ...],
  axes: ["빠른 전달", "사람 중심", "유연한 방식", "아이디어형"],
  chemistry: {
    best: { name: "꼼꼼 비버", reason: "제비가 던진 반짝이는 아이디어를 비버가 탄탄하게 다듬어 주면 완성도가 확 올라갑니다." },
    worst: { name: "안정 거북이", reason: "제비는 바로 날고 싶고 거북이는 충분히 확인하고 싶어서 출발 타이밍이 자주 어긋납니다." }
  }
}
```

### 7.3 통계 DB 테이블 (Supabase 예시)
```sql
CREATE TABLE results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  result_code VARCHAR(4) NOT NULL,   -- 'SPFI'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 집계 쿼리
SELECT result_code, COUNT(*) as count
FROM results
GROUP BY result_code
ORDER BY count DESC;
```

---

## 8. Implementation Plan

### Phase 1 — MVP (프론트엔드 완성) [우선순위: 높음]
- [ ] HTML 뼈대 + 화면 전환 로직
- [ ] 질문 데이터 10개 + 렌더링
- [ ] 점수 계산 엔진 + 16개 결과 매핑
- [ ] 16개 캐릭터 결과 데이터 전체 입력
- [ ] 결과 화면 UI (궁합, 축 요약 포함)
- [ ] 결과 복사 기능 (클립보드 API + fallback)
- [ ] localStorage 결과 저장 + 복원
- [ ] 반응형 CSS (모바일 우선)
- [ ] 이전으로 버튼 (질문 수정 가능)

### Phase 2 — 통계 대시보드 [우선순위: 중간]
- [ ] Supabase 또는 Firebase 프로젝트 셋업
- [ ] 결과 저장 API 연동 (POST)
- [ ] admin.html 패스워드 인증 화면
- [ ] 캐릭터별 결과 분포 차트 (Chart.js 또는 순수 CSS 바)
- [ ] 4축 분포 표시
- [ ] 총 참여자 수 표시

### Phase 3 — 개선 사항 [우선순위: 낮음]
- [ ] 카카오톡 공유 API 연동
- [ ] 결과 페이지 OG 메타태그 (SNS 미리보기)
- [ ] 날짜별 참여 추이 그래프
- [ ] 캐릭터 일러스트 이미지 추가 (디자인팀 협업)
- [ ] 다국어 지원 (영어)

---

## 9. UI/UX Specifications

### 디자인 원칙
- 귀엽지만 유치하지 않은 모던 카드형 UI
- 둥근 모서리 (border-radius: 16~24px)
- 부드러운 그림자 (box-shadow)
- 충분한 여백 (padding 넉넉히)
- 한국어 가독성 최적화 서체

### 색상 팔레트 (권장)
| 용도 | 색상 |
|------|------|
| Primary | `#5B4FE8` (보라) |
| Secondary | `#FF6B9D` (핑크) |
| Background | `#F0F4FF` (연보라) |
| Card | `#FFFFFF` |
| Text | `#1A1A2E` |
| Muted | `#666680` |

### 반응형 중단점
- Mobile: `< 480px`
- Tablet: `480px ~ 768px`
- Desktop: `> 768px`
- 최대 콘텐츠 너비: `520px` (중앙 정렬)

---

## 10. Future Expansion

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 팀 궁합 테스트 | 두 명의 결과 코드를 비교해 팀 케미 점수 산출 | 중간 |
| 결과 이미지 생성 | Canvas API로 공유용 이미지 자동 생성 | 높음 |
| 랭킹 페이지 | 사내에서 가장 많이 나온 캐릭터 실시간 순위 | 낮음 |
| 이벤트 모드 | 특정 기간 한정 캐릭터 or 질문 세트 변경 | 낮음 |
| 다국어 지원 | 영어 버전 추가 (글로벌 직원 대상) | 낮음 |
| 캐릭터 일러스트 | 전문 디자이너 제작 캐릭터 이미지 적용 | 중간 |

---

## 11. Constraints & Risks

| 항목 | 내용 | 대응 방안 |
|------|------|-----------|
| 클립보드 API 미지원 | 구형 브라우저에서 복사 불가 | textarea fallback 구현 |
| 통계 DB 비용 | 트래픽 급증 시 무료 플랜 한계 | Supabase 무료 티어 (500MB) 모니터링 |
| 관리자 보안 | 하드코딩 패스워드는 노출 위험 | 환경변수 처리 or 간단한 해시 비교 |
| 캐릭터 저작권 | 이모지 사용은 무료, 일러스트는 별도 제작 필요 | MVP는 이모지로 대체 |
| 모바일 한글 렌더링 | 일부 기기에서 폰트 깨짐 | 시스템 폰트 스택 명시 |

---

*이 PRD는 Claude Code를 활용한 구현을 전제로 작성되었습니다.*
*Phase 1 MVP는 백엔드 없이 즉시 구현 가능하며, Phase 2부터 외부 서비스 연동이 필요합니다.*
