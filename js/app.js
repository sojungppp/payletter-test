// Created: 2026-03-16

/**
 * app.js
 * 화면 전환 및 앱 전체 흐름 관리
 * Engine.renderQuestion / Engine.renderResult 의존 없이 자체 구현
 */

/* ─────────────────────────────────────────
   전역 상태
───────────────────────────────────────── */
const appState = {
  currentScreen:   'intro',
  currentQuestion: 0,
  answers:         [],   // ['A', 'B', ...]
  result:          null, // 최종 캐릭터 코드
};

const STORAGE_KEY = 'pl_result';

/* ─────────────────────────────────────────
   화면 전환 (fadeIn 재실행 포함)
───────────────────────────────────────── */
/**
 * 모든 .screen을 숨기고 지정 화면만 표시 + fadeIn 애니메이션 재실행
 * @param {string} screenId  e.g. 'screen-intro'
 */
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(el => {
    el.style.display = 'none';
    el.classList.remove('screen--active');
  });

  const target = document.getElementById(screenId);
  if (!target) { console.warn(`showScreen: "${screenId}" 요소를 찾을 수 없습니다.`); return; }

  target.style.display = 'flex';
  // reflow → 애니메이션 재실행
  requestAnimationFrame(() => requestAnimationFrame(() => target.classList.add('screen--active')));

  appState.currentScreen = screenId.replace('screen-', '');
}

/* ─────────────────────────────────────────
   인트로 버튼 렌더링
───────────────────────────────────────── */
function renderIntroActions() {
  const container = document.getElementById('intro-actions');
  container.innerHTML = '';

  // 항상 노출: 테스트 시작하기
  const btnStart = document.createElement('button');
  btnStart.className   = 'btn btn--primary';
  btnStart.textContent = '테스트 시작하기';
  btnStart.addEventListener('click', startTest);
  container.appendChild(btnStart);

  // localStorage에 결과가 있을 때만 노출
  if (localStorage.getItem(STORAGE_KEY)) {
    const btnPrev = document.createElement('button');
    btnPrev.className   = 'btn btn--outline';
    btnPrev.textContent = '이전 결과 보기';
    btnPrev.addEventListener('click', showSavedResult);
    container.appendChild(btnPrev);
  }
}

/* ─────────────────────────────────────────
   질문 화면 렌더링
───────────────────────────────────────── */
/**
 * 질문 카드를 슬라이드 애니메이션으로 렌더링한다.
 *
 * @param {number}              index      0-based 질문 인덱스
 * @param {'forward'|'backward'} direction 전환 방향
 */
function renderQuestion(index, direction = 'forward') {
  const total    = QUESTIONS.length;
  const question = QUESTIONS[index];

  // ── 진행 표시 ──
  document.getElementById('question-counter').textContent =
    `Q${index + 1} / ${total}`;
  document.getElementById('progress-fill').style.width =
    `${(index / total) * 100}%`;

  // ── 이전으로 버튼: Q1에서 disabled ──
  document.getElementById('btn-back').disabled = (index === 0);

  // ── 새 카드 생성 ──
  const newCard = document.createElement('div');
  newCard.className = `question__card question__card--enter-${direction}`;

  // 질문 텍스트
  const qText       = document.createElement('p');
  qText.className   = 'question__text';
  qText.textContent = question.question;
  newCard.appendChild(qText);

  // 선택지 A / B
  const choicesDiv  = document.createElement('div');
  choicesDiv.className = 'question__choices';

  ['A', 'B'].forEach(key => {
    const btn       = document.createElement('button');
    btn.className   = 'choice-btn';
    btn.dataset.key = key;
    btn.innerHTML   =
      `<span class="choice-btn__key">${key}</span>` +
      `<span class="choice-btn__text">${question.options[key].text}</span>`;

    btn.addEventListener('click', () => {
      // 중복 클릭 방지
      choicesDiv.querySelectorAll('.choice-btn').forEach(b => (b.disabled = true));
      btn.classList.add('choice-btn--selected');
      // 0.2초 강조 후 다음 단계
      setTimeout(() => handleAnswer(key), 200);
    });

    choicesDiv.appendChild(btn);
  });
  newCard.appendChild(choicesDiv);

  // ── 슬라이드 전환 ──
  const wrap    = document.getElementById('question-slide-wrap');
  const oldCard = wrap.querySelector('.question__card');

  if (oldCard) {
    // 이전 카드를 absolute로 전환 후 슬라이드 아웃
    oldCard.style.width    = `${wrap.offsetWidth}px`;
    oldCard.style.position = 'absolute';
    oldCard.style.top      = '0';
    oldCard.classList.add(`question__card--exit-${direction}`);
    oldCard.addEventListener('animationend', () => oldCard.remove(), { once: true });
  }

  wrap.appendChild(newCard);
}

/* ─────────────────────────────────────────
   테스트 시작
───────────────────────────────────────── */
function startTest() {
  appState.currentQuestion = 0;
  appState.answers         = [];
  appState.result          = null;

  // 슬라이드 랩 초기화
  document.getElementById('question-slide-wrap').innerHTML = '';

  showScreen('screen-question');
  renderQuestion(0, 'forward');
}

/* ─────────────────────────────────────────
   답변 처리
───────────────────────────────────────── */
function handleAnswer(choiceKey) {
  appState.answers.push(choiceKey);

  const next = appState.currentQuestion + 1;

  if (next < QUESTIONS.length) {
    appState.currentQuestion = next;
    renderQuestion(next, 'forward');
  } else {
    // 마지막 질문 완료: 프로그레스 바 100% 채운 뒤 결과로
    document.getElementById('progress-fill').style.width = '100%';
    setTimeout(finishTest, 300);
  }
}

/* ─────────────────────────────────────────
   Supabase 결과 저장 (fire-and-forget)
───────────────────────────────────────── */
/**
 * 결과 코드를 Supabase results 테이블에 저장한다.
 * config.js 미설정 시 조용히 스킵. 실패해도 UX에 영향 없음.
 * @param {string} code  e.g. 'SPFI'
 */
async function saveResult(code) {
  // config.js 미설정 시 스킵
  if (!SUPABASE_URL || SUPABASE_URL === 'YOUR_SUPABASE_URL') return;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/results`, {
      method: 'POST',
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal',
      },
      body: JSON.stringify({ result_code: code }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error('[saveResult] 결과 저장 실패:', err);
  }
}

/* ─────────────────────────────────────────
   테스트 완료 → 결과 저장 + 렌더링
───────────────────────────────────────── */
function finishTest() {
  const character = calculateResult(appState.answers);
  if (!character) return;

  appState.result = character.code;

  // Supabase 저장 (비동기 — 결과 렌더링 차단하지 않음)
  saveResult(character.code);

  // localStorage 저장: { code, characterName, timestamp }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    code:          character.code,
    characterName: character.characterName,
    timestamp:     Date.now(),
  }));

  renderResult(character);
  showScreen('screen-result');
}

/* ─────────────────────────────────────────
   이전 결과 불러오기
───────────────────────────────────────── */
function showSavedResult() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved?.code) throw new Error('invalid');
    const character = CHARACTERS[saved.code];
    if (!character) throw new Error('unknown code');

    appState.result  = saved.code;
    appState.answers = [];

    renderResult(character);
    showScreen('screen-result');
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    renderIntroActions();
    alert('저장된 결과를 불러올 수 없습니다. 다시 테스트해 주세요.');
  }
}

/* ─────────────────────────────────────────
   결과 화면 렌더링
───────────────────────────────────────── */
/**
 * #result-content를 캐릭터 데이터로 채운다.
 * @param {Object} character  CHARACTERS 맵 항목
 */
function renderResult(character) {
  const container = document.getElementById('result-content');
  container.innerHTML = '';

  // 1. 헤더: 이모지 + 캐릭터명 + 코드 뱃지 + 유사 MBTI 뱃지
  const header = document.createElement('div');
  header.className = 'result__header';
  header.innerHTML = `
    <div class="result__emoji">${character.emoji}</div>
    <p class="result__char-name">${character.characterName}</p>
    <div class="result__badges">
      <span class="badge badge--code">${character.code}</span>
      <span class="badge badge--mbti">유사 MBTI ${character.similarMBTI}</span>
    </div>
  `;
  container.appendChild(header);

  // 2. 한줄 소개
  const titleEl       = document.createElement('p');
  titleEl.className   = 'result__title';
  titleEl.textContent = character.title;
  container.appendChild(titleEl);

  // 3. 설명 텍스트 블록
  const descEl = document.createElement('div');
  descEl.className = 'result__description';
  character.description.forEach(line => {
    const p       = document.createElement('p');
    p.textContent = line;
    descEl.appendChild(p);
  });
  container.appendChild(descEl);

  // 4. 축 요약 칩 4개
  const axesEl = document.createElement('div');
  axesEl.className = 'result__axes';
  character.axes.forEach(axis => {
    const chip       = document.createElement('span');
    chip.className   = 'axis-chip';
    chip.textContent = axis;
    axesEl.appendChild(chip);
  });
  container.appendChild(axesEl);

  // 5. 궁합 카드 2개
  const chemEl = document.createElement('div');
  chemEl.className = 'result__chemistry';
  [
    { type: 'best',  icon: '💚', label: '최고의 궁합',       data: character.chemistry.best  },
    { type: 'worst', icon: '❌', label: '주의가 필요한 궁합', data: character.chemistry.worst },
  ].forEach(({ type, icon, label, data }) => {
    const card = document.createElement('div');
    card.className = `chemistry-card chemistry-card--${type}`;
    card.innerHTML = `
      <div class="chemistry-card__header">
        <span class="chemistry-card__icon">${icon}</span>
        <span class="chemistry-card__label">${label} &mdash; <strong>${data.name}</strong></span>
      </div>
      <p class="chemistry-card__reason">${data.reason}</p>
    `;
    chemEl.appendChild(card);
  });
  container.appendChild(chemEl);
}

/* ─────────────────────────────────────────
   버튼 이벤트 바인딩 (DOMContentLoaded 1회)
───────────────────────────────────────── */
function _initButtons() {
  // 이전으로 (질문 화면 하단)
  document.getElementById('btn-back').addEventListener('click', () => {
    if (appState.currentQuestion === 0) return;
    appState.answers.pop();
    appState.currentQuestion -= 1;
    renderQuestion(appState.currentQuestion, 'backward');
  });

  // 다시 테스트하기 → localStorage 삭제 + 인트로
  document.getElementById('btn-retry').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    appState.currentQuestion = 0;
    appState.answers         = [];
    appState.result          = null;
    showScreen('screen-intro');
    renderIntroActions();
  });

  // 결과 복사하기
  document.getElementById('btn-copy').addEventListener('click', () => {
    const char = CHARACTERS[appState.result];
    if (!char) return;

    const text =
      `나는 페이레터 편지 배달 캐릭터 테스트 결과 [${char.characterName}]!\n` +
      `유사 MBTI는 ${char.similarMBTI},\n` +
      `한줄 소개는 '${char.title}'\n` +
      `최고의 궁합은 ${char.chemistry.best.name}, 최악의 궁합은 ${char.chemistry.worst.name}!`;

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => alert('결과가 클립보드에 복사되었습니다!'))
        .catch(() => _fallbackCopy(text));
    } else {
      _fallbackCopy(text);
    }
  });
}

/** Clipboard API 미지원 환경용 textarea 폴백 */
function _fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    alert('결과가 클립보드에 복사되었습니다!');
  } catch {
    alert(`아래 텍스트를 직접 복사해 주세요:\n\n${text}`);
  }
  document.body.removeChild(ta);
}

/* ─────────────────────────────────────────
   초기화
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderIntroActions();
  _initButtons();
});
