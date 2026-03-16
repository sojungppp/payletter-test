// Created: 2026-03-16

/**
 * data.js
 * 질문 데이터(QUESTIONS)와 캐릭터 결과 맵(CHARACTERS) 정의
 *
 * 가중치 8개 키:
 *   swift / careful / people / task / flexible / structured / idea / execution
 *
 * 4축 결정 규칙:
 *   Axis1 (속도)   : swift vs careful      → S | C
 *   Axis2 (관계)   : people vs task        → P | T
 *   Axis3 (방식)   : flexible vs structured → F | S
 *   Axis4 (사고)   : idea vs execution     → I | E
 *
 * 16가지 캐릭터 코드 = Axis1 + Axis2 + Axis3 + Axis4
 *   예) SPFI = Swift · People · Flexible · Idea
 */

// ─────────────────────────────────────────
// 질문 데이터 (10문항)
// ─────────────────────────────────────────
const QUESTIONS = [
  {
    id: 1,
    question: "새로운 아이디어가 떠올랐을 때 나는",
    options: {
      A: { text: "바로 공유해본다",        weights: { swift: 1, people: 1 } },
      B: { text: "정리한 뒤 공유한다",     weights: { careful: 1, task: 1 } },
    },
  },
  {
    id: 2,
    question: "회의에서 의견을 낼 때 나는",
    options: {
      A: { text: "떠오르는 생각을 자유롭게 말한다", weights: { swift: 1, idea: 1 } },
      B: { text: "생각을 정리해서 말한다",           weights: { careful: 1, execution: 1 } },
    },
  },
  {
    id: 3,
    question: "협업할 때 나는",
    options: {
      A: { text: "다양한 사람과 소통하며 진행한다", weights: { people: 1 } },
      B: { text: "맡은 역할을 중심으로 진행한다",   weights: { task: 1 } },
    },
  },
  {
    id: 4,
    question: "프로젝트가 시작되면",
    options: {
      A: { text: "여러 방법을 시도하며 방향을 찾는다", weights: { flexible: 1, idea: 1 } },
      B: { text: "계획과 구조를 먼저 세운다",           weights: { structured: 1, execution: 1 } },
    },
  },
  {
    id: 5,
    question: "정보를 전달할 때 나는",
    options: {
      A: { text: "빠르게 공유하는 편이다",         weights: { swift: 1 } },
      B: { text: "정확하게 정리해서 전달한다",     weights: { careful: 1 } },
    },
  },
  {
    id: 6,
    question: "업무 진행 방식은",
    options: {
      A: { text: "상황에 맞게 유연하게 진행한다", weights: { flexible: 1 } },
      B: { text: "계획에 맞게 진행한다",           weights: { structured: 1 } },
    },
  },
  {
    id: 7,
    question: "문제를 해결할 때 나는",
    options: {
      A: { text: "다양한 가능성을 먼저 생각한다",  weights: { idea: 1 } },
      B: { text: "현실적인 해결을 바로 실행한다",  weights: { execution: 1 } },
    },
  },
  {
    id: 8,
    question: "새로운 사람과 협업할 때 나는",
    options: {
      A: { text: "먼저 대화를 시작한다",           weights: { people: 1, swift: 1 } },
      B: { text: "필요한 내용 중심으로 이야기한다", weights: { task: 1, careful: 1 } },
    },
  },
  {
    id: 9,
    question: "아이디어를 발전시킬 때 나는",
    options: {
      A: { text: "여러 아이디어를 연결한다",         weights: { idea: 1 } },
      B: { text: "실행 가능한 방법을 구체화한다",   weights: { execution: 1 } },
    },
  },
  {
    id: 10,
    question: "업무 스타일은",
    options: {
      A: { text: "다양한 방법을 시도한다",   weights: { flexible: 1 } },
      B: { text: "정해진 방식대로 진행한다", weights: { structured: 1 } },
    },
  },
];

// ─────────────────────────────────────────
// 캐릭터 결과 맵 (16가지)
// 코드 = [S|C] + [P|T] + [F|S] + [I|E]
// ─────────────────────────────────────────
const CHARACTERS = {
  // ── Swift + People ──────────────────────
  SPFI: {
    emoji: "🚀",
    name: "아이디어 버즈",
    tagline: "빠르게 연결하고, 넓게 퍼뜨린다",
    desc: "새로운 아이디어를 누구보다 먼저 팀에 공유하고, 사람들을 자연스럽게 연결하는 소통의 중심입니다. 유연한 사고로 예상치 못한 아이디어 조합을 만들어내는 데 탁월하죠.",
  },
  SPFE: {
    emoji: "🏄",
    name: "어댑티브 러너",
    tagline: "파도처럼 유연하게, 팀과 함께 달린다",
    desc: "변화하는 상황에 빠르게 적응하며 팀원들과 함께 실행을 이끕니다. 딱딱한 규칙보다 현장의 흐름을 읽고 유연하게 움직이는 것이 강점이에요.",
  },
  SPSI: {
    emoji: "📢",
    name: "비전 캐스터",
    tagline: "체계적인 아이디어를 빠르게 전파한다",
    desc: "정리된 생각을 빠르게 팀에 전달하는 설득력 있는 커뮤니케이터입니다. 사람들을 하나의 방향으로 모으고 아이디어에 구조를 입히는 것을 즐깁니다.",
  },
  SPSE: {
    emoji: "⚓",
    name: "드라이브 리더",
    tagline: "추진력과 체계로 팀을 이끈다",
    desc: "명확한 계획 아래 팀원들을 이끌며 목표를 향해 빠르게 나아갑니다. 사람에 대한 따뜻한 관심과 실행에 대한 강한 의지가 균형을 이루는 리더예요.",
  },

  // ── Swift + Task ─────────────────────────
  STFI: {
    emoji: "💡",
    name: "플렉시블 해커",
    tagline: "빠르고 창의적으로 문제를 돌파한다",
    desc: "고정된 방식에 얽매이지 않고, 빠르게 여러 가능성을 탐색해 최적의 해결책을 찾아냅니다. 과제 집중력과 유연한 아이디어가 시너지를 내는 문제 해결의 달인이에요.",
  },
  STFE: {
    emoji: "⚡",
    name: "애자일 스프린터",
    tagline: "민첩하게 실행하는 스피드의 아이콘",
    desc: "계획보다 실행이 먼저입니다. 빠른 판단과 즉각적인 행동으로 결과를 만들어내며, 변화하는 환경에도 유연하게 대응하는 고성능 실행가예요.",
  },
  STSI: {
    emoji: "🏗️",
    name: "스트래티직 빌더",
    tagline: "체계적인 설계 위에 빠르게 쌓는다",
    desc: "과제를 구조화하고 아이디어에 탄탄한 뼈대를 만드는 것을 즐깁니다. 빠른 실행력과 체계적인 사고가 결합돼 기획부터 초기 실행까지 속도감 있게 진행해요.",
  },
  STSE: {
    emoji: "🔥",
    name: "하이퍼 이그제큐터",
    tagline: "빠르고 체계적인 완전 실행가",
    desc: "정해진 방향이 생기면 가장 빠르게 실행하는 조직의 추진 엔진입니다. 계획과 속도, 과제 집중력이 한데 모여 목표 달성률이 매우 높은 유형이에요.",
  },

  // ── Careful + People ─────────────────────
  CPFI: {
    emoji: "🌍",
    name: "크리에이티브 커넥터",
    tagline: "신중하게 사람과 아이디어를 연결한다",
    desc: "서두르지 않고 여러 사람의 시각을 모아 풍부한 아이디어를 엮어냅니다. 관계를 소중히 여기며 다양한 관점을 하나의 창의적인 결과물로 만들어내는 역할을 합니다.",
  },
  CPFE: {
    emoji: "🌱",
    name: "공감 실행가",
    tagline: "배려와 유연함으로 함께 실행한다",
    desc: "팀원 한 명 한 명의 상황을 파악하며 신중하게 나아갑니다. 강요보다는 공감으로 팀을 움직이고, 상황에 따라 유연하게 실행 방식을 조정하는 따뜻한 실행가예요.",
  },
  CPSI: {
    emoji: "🎨",
    name: "인사이트 큐레이터",
    tagline: "사람들을 위해 아이디어를 체계적으로 다듬는다",
    desc: "다양한 사람들의 의견을 신중하게 수집하고, 체계적으로 구조화해 가치 있는 인사이트를 만들어냅니다. 아이디어의 가능성을 최대한 끌어올리는 큐레이터 역할을 합니다.",
  },
  CPSE: {
    emoji: "🛡️",
    name: "든든한 팀 앵커",
    tagline: "신중함과 체계로 팀의 기반을 지킨다",
    desc: "흔들리지 않는 안정감으로 팀을 지원합니다. 실수 없이 계획대로 실행하고, 팀원들이 믿고 기댈 수 있는 조직의 든든한 버팀목이에요.",
  },

  // ── Careful + Task ───────────────────────
  CTFI: {
    emoji: "🔮",
    name: "딥 씽커",
    tagline: "신중하게 가능성의 깊이를 탐구한다",
    desc: "성급한 결론 대신 충분히 생각하고 다양한 가능성을 탐색합니다. 과제에 집중하면서도 유연한 사고로 숨겨진 해법을 찾아내는 깊이 있는 탐구자예요.",
  },
  CTFE: {
    emoji: "🔧",
    name: "퀄리티 크래프터",
    tagline: "꼼꼼하게 완성도를 높이는 장인",
    desc: "결과물 하나하나에 공을 들이며 높은 완성도를 추구합니다. 정해진 틀 안에서 최선의 방법을 유연하게 찾아 실행하는, 믿을 수 있는 장인 기질의 소유자예요.",
  },
  CTSI: {
    emoji: "📐",
    name: "마스터 플래너",
    tagline: "완벽한 설계로 아이디어를 현실로 만든다",
    desc: "머릿속의 아이디어를 철저한 계획과 논리적 구조로 변환하는 데 탁월합니다. 신중한 준비와 체계적인 설계가 결합돼 프로젝트의 완성도를 높이는 설계의 달인이에요.",
  },
  CTSE: {
    emoji: "💎",
    name: "퍼펙셔니스트",
    tagline: "철두철미한 완벽주의 완성자",
    desc: "계획, 실행, 마무리까지 어느 단계도 허투루 넘기지 않습니다. 신중한 판단과 체계적인 실행이 결합돼 오류 없는 결과물을 만들어내는 조직의 품질 보증 유형이에요.",
  },
};
