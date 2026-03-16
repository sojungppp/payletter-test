// Created: 2026-03-16

/**
 * app.js
 * 화면 전환 및 앱 전체 흐름 관리
 */

/* ─────────────────────────────────────────
   전역 상태
───────────────────────────────────────── */
const appState = {
  currentScreen:   'intro',
  currentQuestion: 0,
  answers:         [],   // ['A', 'B', ...]
  result:          null, // 최종 캐릭터 코드
  nickname:        '',
};

const STORAGE_KEY = 'pl_result';

/* ─────────────────────────────────────────
   화면 전환 (fadeIn 재실행 포함)
───────────────────────────────────────── */
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(el => {
    el.style.display = 'none';
    el.classList.remove('screen--active');
  });

  const target = document.getElementById(screenId);
  if (!target) { console.warn(`showScreen: "${screenId}" 요소를 찾을 수 없습니다.`); return; }

  target.style.display = 'flex';
  requestAnimationFrame(() => requestAnimationFrame(() => target.classList.add('screen--active')));

  appState.currentScreen = screenId.replace('screen-', '');
}

/* ─────────────────────────────────────────
   인트로 버튼 렌더링
───────────────────────────────────────── */
function renderIntroActions() {
  const container = document.getElementById('intro-actions');
  container.innerHTML = '';

  const btnStart = document.createElement('button');
  btnStart.className   = 'btn btn--primary';
  btnStart.textContent = '테스트 시작하기';
  btnStart.addEventListener('click', startTest);
  container.appendChild(btnStart);

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
function renderQuestion(index, direction = 'forward') {
  const total    = QUESTIONS.length;
  const question = QUESTIONS[index];

  document.getElementById('question-counter').textContent =
    `Q${index + 1} / ${total}`;
  document.getElementById('progress-fill').style.width =
    `${(index / total) * 100}%`;

  document.getElementById('btn-back').disabled = (index === 0);

  const newCard = document.createElement('div');
  newCard.className = `question__card question__card--enter-${direction}`;

  const qText       = document.createElement('p');
  qText.className   = 'question__text';
  qText.textContent = question.question;
  newCard.appendChild(qText);

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
      choicesDiv.querySelectorAll('.choice-btn').forEach(b => (b.disabled = true));
      btn.classList.add('choice-btn--selected');
      setTimeout(() => handleAnswer(key), 200);
    });

    choicesDiv.appendChild(btn);
  });
  newCard.appendChild(choicesDiv);

  const wrap    = document.getElementById('question-slide-wrap');
  const oldCard = wrap.querySelector('.question__card');

  if (oldCard) {
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
  // 닉네임 유효성 검사
  const nicknameInput = document.getElementById('nickname-input');
  const nicknameError = document.getElementById('nickname-error');
  const nickname      = nicknameInput.value.trim();

  if (!nickname) {
    nicknameError.textContent = '닉네임을 입력해 주세요.';
    nicknameInput.focus();
    return;
  }

  nicknameError.textContent = '';
  appState.nickname        = nickname;
  appState.currentQuestion = 0;
  appState.answers         = [];
  appState.result          = null;

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
    document.getElementById('progress-fill').style.width = '100%';
    setTimeout(finishTest, 300);
  }
}

/* ─────────────────────────────────────────
   Supabase 결과 저장 (fire-and-forget)
───────────────────────────────────────── */
async function saveResult(code, nickname) {
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
      body: JSON.stringify({ result_code: code, nickname }),
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

  saveResult(character.code, appState.nickname);

  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    code:          character.code,
    characterName: character.characterName,
    nickname:      appState.nickname,
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

    appState.result   = saved.code;
    appState.answers  = [];
    appState.nickname = saved.nickname || '';

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
function renderResult(character) {
  const container = document.getElementById('result-content');
  container.innerHTML = '';

  // 1. 헤더: 캐릭터 이미지 + 닉네임 + 캐릭터명 + 타입 뱃지
  const header = document.createElement('div');
  header.className = 'result__header';

  const nicknameTag = appState.nickname
    ? `<span class="result__nickname-tag">${appState.nickname}님의 결과</span>`
    : '';

  header.innerHTML = `
    <img
      class="result__char-img"
      src="images/${encodeURIComponent(character.characterName)}.png"
      alt="${character.characterName}"
      onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
    />
    <div class="result__emoji" style="display:none;">${character.emoji}</div>
    ${nicknameTag}
    <p class="result__char-name">${character.characterName}</p>
    <div class="result__badges">
      <span class="badge badge--type">${character.axes[0]} · ${character.axes[1]}</span>
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
   이미지 저장
───────────────────────────────────────── */
async function saveAsImage() {
  const btn = document.getElementById('btn-save-image');
  btn.disabled    = true;
  btn.textContent = '저장 중…';

  try {
    const el = document.getElementById('result-content');
    const canvas = await html2canvas(el, {
      backgroundColor: '#F0FAFA',
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const link      = document.createElement('a');
    const charName  = CHARACTERS[appState.result]?.characterName || 'result';
    link.download   = `payletter_${charName}.png`;
    link.href       = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error('[saveAsImage]', err);
    alert('이미지 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.');
  } finally {
    btn.disabled    = false;
    btn.textContent = '이미지로 저장';
  }
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
    appState.nickname        = '';
    // 닉네임 입력 초기화
    const ni = document.getElementById('nickname-input');
    if (ni) ni.value = '';
    showScreen('screen-intro');
    renderIntroActions();
  });

  // 결과 복사하기
  document.getElementById('btn-copy').addEventListener('click', () => {
    const char = CHARACTERS[appState.result];
    if (!char) return;

    const nicknameStr = appState.nickname ? `${appState.nickname}님은 ` : '';
    const text =
      `${nicknameStr}페이레터 캐릭터 테스트 결과 [${char.characterName}]!\n` +
      `한줄 소개: '${char.title}'\n` +
      `최고의 궁합은 ${char.chemistry.best.name}, 주의가 필요한 궁합은 ${char.chemistry.worst.name}!`;

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => alert('결과가 클립보드에 복사되었습니다!'))
        .catch(() => _fallbackCopy(text));
    } else {
      _fallbackCopy(text);
    }
  });

  // 이미지 저장
  document.getElementById('btn-save-image').addEventListener('click', saveAsImage);

  // 닉네임 입력 필드 Enter 키
  document.getElementById('nickname-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') startTest();
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
