// Created: 2026-03-16

/**
 * engine.js
 * 점수 계산 · 결과 매핑 · UI 렌더링 로직
 *
 * 전역 노출 함수 (콘솔 직접 테스트용):
 *   calculateResult(['A','B',...])  → 캐릭터 객체 반환
 *   getAxisSummary(['A','B',...])   → 4축 점수·퍼센트 반환
 */

// ─────────────────────────────────────────
// 내부 유틸: 가중치 누적
// ─────────────────────────────────────────

/**
 * answers 배열('A'/'B' 10개)을 순회하며 8개 가중치를 합산한다.
 * @param {string[]} answers  e.g. ['A','B','A',...]
 * @returns {{ swift:n, careful:n, people:n, task:n,
 *             flexible:n, structured:n, idea:n, execution:n }}
 */
function _accumulateWeights(answers) {
  const w = {
    swift: 0, careful: 0,
    people: 0, task: 0,
    flexible: 0, structured: 0,
    idea: 0, execution: 0,
  };

  answers.forEach((choice, i) => {
    const q = QUESTIONS[i];
    if (!q) return;
    const option = q.options[choice];
    if (!option) return;
    for (const [key, val] of Object.entries(option.weights)) {
      if (key in w) w[key] += val;
    }
  });

  return w;
}

/**
 * 가중치 맵으로 4자리 코드를 결정한다.
 * 타이 브레이킹 규칙 (>=는 우측 승):
 *   swift > careful          → 'S'  else 'C'
 *   people > task            → 'P'  else 'T'
 *   flexible > structured    → 'F'  else 'T'  (S 충돌 방지를 위해 structured = 'T')
 *   idea > execution         → 'I'  else 'E'
 *
 * @param {{ swift:n, careful:n, ... }} w
 * @returns {string}  e.g. "SPFI"
 */
function _weightsToCode(w) {
  const a1 = w.swift      > w.careful     ? 'S' : 'C';
  const a2 = w.people     > w.task        ? 'P' : 'T';
  const a3 = w.flexible   > w.structured  ? 'F' : 'T';
  const a4 = w.idea       > w.execution   ? 'I' : 'E';
  return a1 + a2 + a3 + a4;
}

// ─────────────────────────────────────────
// 전역 공개 함수
// ─────────────────────────────────────────

/**
 * 10개 답변을 받아 해당하는 캐릭터 객체를 반환한다.
 *
 * @param {string[]} answers  'A' 또는 'B' 10개짜리 배열
 * @returns {{ code, emoji, name, tagline, desc } | null}
 *
 * @example
 *   calculateResult(['A','A','A','A','A','A','A','A','A','A'])
 *   // → { code: 'SPFI', emoji: '🚀', name: '아이디어 버즈', ... }
 */
function calculateResult(answers) {
  // 입력 유효성 검사
  if (!Array.isArray(answers) || answers.length !== QUESTIONS.length) {
    console.error(
      `[Engine] calculateResult: answers 배열 길이가 ${QUESTIONS.length}이어야 합니다. (받은 값: ${answers?.length})`
    );
    return null;
  }

  const invalidIdx = answers.findIndex(a => a !== 'A' && a !== 'B');
  if (invalidIdx !== -1) {
    console.error(
      `[Engine] calculateResult: answers[${invalidIdx}]의 값이 유효하지 않습니다. ('A' 또는 'B'만 허용)`
    );
    return null;
  }

  const w    = _accumulateWeights(answers);
  const code = _weightsToCode(w);

  if (!(code in CHARACTERS)) {
    console.error(`[Engine] calculateResult: 코드 "${code}"에 해당하는 캐릭터가 없습니다.`);
    return null;
  }

  return { code, ...CHARACTERS[code] };
}

/**
 * 4축별 점수와 퍼센트를 반환한다. (결과 화면 축 요약 칩에 사용)
 *
 * 반환 형태:
 * {
 *   speed:     { left:'swift',    right:'careful',    leftScore, rightScore, leftPct, rightPct, winner:'S'|'C' },
 *   relation:  { left:'people',   right:'task',       ... , winner:'P'|'T' },
 *   style:     { left:'flexible', right:'structured', ... , winner:'F'|'S' },
 *   thinking:  { left:'idea',     right:'execution',  ... , winner:'I'|'E' },
 * }
 *
 * @param {string[]} answers
 * @returns {Object | null}
 */
function getAxisSummary(answers) {
  if (!Array.isArray(answers) || answers.length !== QUESTIONS.length) {
    console.error('[Engine] getAxisSummary: 유효하지 않은 answers 배열');
    return null;
  }

  const w = _accumulateWeights(answers);

  function axisStat(leftKey, rightKey, winnerIfLeft, winnerIfRight) {
    const leftScore  = w[leftKey];
    const rightScore = w[rightKey];
    const total      = leftScore + rightScore;
    const leftPct    = total === 0 ? 50 : Math.round((leftScore  / total) * 100);
    const rightPct   = total === 0 ? 50 : 100 - leftPct;
    const winner     = leftScore > rightScore ? winnerIfLeft : winnerIfRight;
    return { left: leftKey, right: rightKey, leftScore, rightScore, leftPct, rightPct, winner };
  }

  return {
    speed:    axisStat('swift',    'careful',    'S', 'C'),
    relation: axisStat('people',   'task',       'P', 'T'),
    style:    axisStat('flexible', 'structured', 'F', 'S'),
    thinking: axisStat('idea',     'execution',  'I', 'E'),
  };
}

// ─────────────────────────────────────────
// Engine 모듈 (UI 렌더링 담당)
// ─────────────────────────────────────────
const Engine = (() => {

  /** 진행률(0~100) 계산 */
  function _calcProgress(currentIndex, total) {
    return Math.round((currentIndex / total) * 100);
  }

  /**
   * 선택지 버튼을 #question-choices에 렌더링한다.
   * onSelect 콜백에 'A' 또는 'B' 문자열을 전달한다.
   *
   * @param {Object}   question  QUESTIONS 배열 항목
   * @param {Function} onSelect  (choiceKey: 'A'|'B') => void
   */
  function _renderChoices(question, onSelect) {
    const container = document.getElementById('question-choices');
    container.innerHTML = '';

    ['A', 'B'].forEach(key => {
      const option = question.options[key];
      const btn    = document.createElement('button');
      btn.className    = 'choice-btn';
      btn.dataset.key  = key;
      btn.textContent  = option.text;

      btn.addEventListener('click', () => {
        container.querySelectorAll('.choice-btn')
          .forEach(b => b.classList.remove('choice-btn--selected'));
        btn.classList.add('choice-btn--selected');
        setTimeout(() => onSelect(key), 220);
      });

      container.appendChild(btn);
    });
  }

  /**
   * 질문 화면 전체 UI를 갱신한다.
   *
   * @param {number}   index     0-based 질문 인덱스
   * @param {Function} onSelect  (choiceKey: 'A'|'B') => void
   */
  function renderQuestion(index, onSelect) {
    const question = QUESTIONS[index];
    const total    = QUESTIONS.length;

    document.getElementById('question-text').textContent    = question.question;
    document.getElementById('question-counter').textContent = `${index + 1} / ${total}`;
    document.getElementById('progress-fill').style.width   = `${_calcProgress(index, total)}%`;

    _renderChoices(question, onSelect);
  }

  /**
   * 결과 화면 UI를 갱신한다.
   *
   * @param {string} code  4자리 캐릭터 코드 e.g. 'SPFI'
   */
  // 결과 화면 렌더링은 app.js의 renderResult(character)가 담당합니다.
  // 이 함수는 하위 호환용으로만 유지합니다.
  function renderResult(code) {
    const char = CHARACTERS[code];
    if (!char) {
      console.error(`[Engine] renderResult: 코드 "${code}"에 해당하는 캐릭터가 없습니다.`);
      return;
    }
    if (typeof renderResult_app === 'function') {
      renderResult_app(char);
    }
  }

  return { renderQuestion, renderResult };
})();

// ─────────────────────────────────────────
// 개발용 임시 콘솔 테스트 (배포 전 제거)
// ─────────────────────────────────────────
(function _devTest() {
  const allA = Array(QUESTIONS.length).fill('A');
  const allB = Array(QUESTIONS.length).fill('B');

  const resultA = calculateResult(allA);
  const resultB = calculateResult(allB);
  const summary = getAxisSummary(allA);

  console.group('[Engine Dev Test]');
  console.log('전체 A 결과 →', resultA);   // 기대: SPFI 번개 제비
  console.log('전체 B 결과 →', resultB);   // 기대: CTTE 안정 거북이
  console.log('전체 A 축 요약 →', summary);

  // 유효성 테스트
  const badLength = calculateResult(['A', 'B']);           // 길이 오류
  const badValue  = calculateResult([...allA.slice(0, 9), 'X']); // 값 오류
  console.log('잘못된 길이 →', badLength);   // null 기대
  console.log('잘못된 값  →', badValue);     // null 기대
  console.groupEnd();
})();
