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
  resultSaved:     false, // 이중 제출 방지 플래그
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
    `${((index + 1) / total) * 100}%`;

  const btnBack = document.getElementById('btn-back');
  btnBack.disabled = (index === 0);
  btnBack.style.visibility = index === 0 ? 'hidden' : 'visible';

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
  appState.resultSaved     = false;

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
   비차단 토스트 알림
───────────────────────────────────────── */
function showToast(message, type = 'error') {
  // 기존 토스트가 있으면 제거
  const existing = document.getElementById('pl-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'pl-toast';
  toast.className = `pl-toast pl-toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;

  document.body.appendChild(toast);

  // 등장 애니메이션 트리거
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('pl-toast--visible')));

  // 4초 후 자동 제거
  setTimeout(() => {
    toast.classList.remove('pl-toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 4000);
}

/* ─────────────────────────────────────────
   Supabase 결과 저장 (fire-and-forget)
───────────────────────────────────────── */
async function saveResult(code, nickname) {
  try {
    const res = await fetch('/.netlify/functions/save-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result_code: code, nickname }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error('[saveResult] 결과 저장 실패:', err);
    showToast('결과 저장 중 문제가 발생했어요. 결과는 정상적으로 확인할 수 있습니다.');
  }
}

/* ─────────────────────────────────────────
   테스트 완료 → 결과 저장 + 렌더링
───────────────────────────────────────── */
function finishTest() {
  if (appState.resultSaved) return; // 이중 제출 방지
  appState.resultSaved = true;

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

  history.replaceState(null, '', `?result=${character.code}`);

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

  // 캐릭터 이미지 (CSP 호환 — inline onerror 대신 addEventListener 사용)
  const charImg = document.createElement('img');
  charImg.className = 'result__char-img';
  charImg.src = `images/${encodeURIComponent(character.characterName)}.png`;
  charImg.alt = character.characterName;

  const emojiDiv = document.createElement('div');
  emojiDiv.className = 'result__emoji';
  emojiDiv.style.display = 'none';
  emojiDiv.textContent = character.emoji;

  charImg.addEventListener('error', () => {
    charImg.style.display = 'none';
    emojiDiv.style.display = 'block';
  }, { once: true });

  header.appendChild(charImg);
  header.appendChild(emojiDiv);

  if (appState.nickname) {
    const nicknameTag = document.createElement('span');
    nicknameTag.className = 'result__nickname-tag';
    nicknameTag.textContent = `${appState.nickname}님의 결과`;
    header.appendChild(nicknameTag);
  }

  const charNameEl = document.createElement('p');
  charNameEl.className = 'result__char-name';
  charNameEl.textContent = character.characterName;
  header.appendChild(charNameEl);

  const badgesDiv = document.createElement('div');
  badgesDiv.className = 'result__badges';
  const typeBadge = document.createElement('span');
  typeBadge.className = 'badge badge--type';
  typeBadge.textContent = `${character.axes[0]} · ${character.axes[1]}`;
  badgesDiv.appendChild(typeBadge);
  header.appendChild(badgesDiv);

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
    // html2canvas를 처음 사용할 때만 동적 로드 (lazy-load)
    if (typeof html2canvas === 'undefined') {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload  = resolve;
        script.onerror = () => reject(new Error('html2canvas 로드 실패'));
        document.head.appendChild(script);
      });
    }

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
   키보드 선택지 단축키 (질문 화면 전용)
   1 또는 A → A 선택지 / 2 또는 B → B 선택지
───────────────────────────────────────── */
function _handleQuizKeydown(e) {
  if (appState.currentScreen !== 'question') return;

  const key = e.key.toUpperCase();
  let targetKey = null;

  if (key === 'A' || key === '1') targetKey = 'A';
  else if (key === 'B' || key === '2') targetKey = 'B';
  else return;

  const wrap = document.getElementById('question-slide-wrap');
  const btn  = wrap?.querySelector(`.choice-btn[data-key="${targetKey}"]`);

  // 이미 disabled(선택 직후 잠금 상태)면 무시
  if (!btn || btn.disabled) return;

  // 시각적 선택 피드백 + 답변 처리
  wrap.querySelectorAll('.choice-btn').forEach(b => (b.disabled = true));
  btn.classList.add('choice-btn--selected');
  setTimeout(() => handleAnswer(targetKey), 200);
}

document.addEventListener('keydown', _handleQuizKeydown);

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
    history.replaceState(null, '', location.pathname);
    // 닉네임 입력 + 카운터 초기화
    const ni = document.getElementById('nickname-input');
    if (ni) ni.value = '';
    const nc = document.getElementById('nickname-counter');
    if (nc) { nc.textContent = '0 / 20'; nc.classList.remove('intro__name-counter--warn'); }
    showScreen('screen-intro');
    renderIntroActions();
  });

  // 결과 복사하기
  document.getElementById('btn-copy').addEventListener('click', () => {
    const char = CHARACTERS[appState.result];
    if (!char) return;

    const nicknameStr = appState.nickname ? `${appState.nickname}님은 ` : '';
    const shareUrl = `${location.origin}${location.pathname}?result=${appState.result}`;
    const text =
      `${nicknameStr}페이레터 캐릭터 테스트 결과 [${char.characterName}]!\n` +
      `한줄 소개: '${char.title}'\n` +
      `최고의 궁합은 ${char.chemistry.best.name}, 주의가 필요한 궁합은 ${char.chemistry.worst.name}!\n\n` +
      `▶ 나도 테스트하기: ${shareUrl}`;

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

  // 닉네임 입력 필드: 글자 수 카운터 + Enter 키
  const nicknameInput   = document.getElementById('nickname-input');
  const nicknameCounter = document.getElementById('nickname-counter');
  const MAX_NICKNAME    = 20;

  nicknameInput.addEventListener('input', () => {
    const len = nicknameInput.value.length;
    nicknameCounter.textContent = `${len} / ${MAX_NICKNAME}`;
    nicknameCounter.classList.toggle('intro__name-counter--warn', len >= MAX_NICKNAME);
  });

  nicknameInput.addEventListener('keydown', e => {
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
   URL ?result=CODE 로 직접 진입 처리
───────────────────────────────────────── */
function _checkResultFromURL() {
  const code = new URLSearchParams(location.search).get('result');
  if (!code) return;

  const character = CHARACTERS[code];
  if (!character) return;

  appState.result   = code;
  appState.nickname = '';

  renderResult(character);
  showScreen('screen-result');
}

/* ─────────────────────────────────────────
   초기화
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderIntroActions();
  _initButtons();
  _checkResultFromURL();
});
