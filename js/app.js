// Created: 2026-03-16

/**
 * app.js
 * 화면 전환 및 앱 전체 흐름 관리
 */

/* ─────────────────────────────────────────
   전역 상태
───────────────────────────────────────── */
const appState = {
  currentScreen:   "intro",
  currentQuestion: 0,
  answers:         [],
  result:          null,
};

const STORAGE_KEY = "pl_result";

/* ─────────────────────────────────────────
   화면 전환
───────────────────────────────────────── */
/**
 * 모든 .screen을 숨기고 지정된 화면만 표시 + fadeIn 애니메이션 재실행
 * @param {string} screenId  e.g. "screen-intro"
 */
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(el => {
    el.style.display = "none";
    el.classList.remove("screen--active");
  });

  const target = document.getElementById(screenId);
  if (!target) {
    console.warn(`showScreen: "${screenId}" 요소를 찾을 수 없습니다.`);
    return;
  }

  target.style.display = "flex";
  // reflow 후 클래스 추가해야 애니메이션 재실행
  requestAnimationFrame(() => {
    requestAnimationFrame(() => target.classList.add("screen--active"));
  });

  appState.currentScreen = screenId.replace("screen-", "");
}

/* ─────────────────────────────────────────
   인트로 버튼 렌더링
───────────────────────────────────────── */
function renderIntroActions() {
  const container = document.getElementById("intro-actions");
  container.innerHTML = "";

  // 항상 노출: 테스트 시작하기
  const btnStart = document.createElement("button");
  btnStart.className   = "btn btn--primary";
  btnStart.textContent = "테스트 시작하기";
  btnStart.addEventListener("click", startTest);
  container.appendChild(btnStart);

  // 이전 결과가 있을 때만 추가 노출
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const btnPrev = document.createElement("button");
    btnPrev.className   = "btn btn--outline";
    btnPrev.textContent = "이전 결과 보기";
    btnPrev.addEventListener("click", showSavedResult);
    container.appendChild(btnPrev);
  }
}

/* ─────────────────────────────────────────
   테스트 진행
───────────────────────────────────────── */
function startTest() {
  appState.currentQuestion = 0;
  appState.answers         = [];
  appState.result          = null;
  showScreen("screen-question");
  Engine.renderQuestion(appState.currentQuestion, handleAnswer);
}

// choiceKey: 'A' | 'B'
function handleAnswer(choiceKey) {
  appState.answers.push(choiceKey);

  const next = appState.currentQuestion + 1;

  if (next < QUESTIONS.length) {
    appState.currentQuestion = next;
    Engine.renderQuestion(next, handleAnswer);
  } else {
    finishTest();
  }
}

function finishTest() {
  const character = calculateResult(appState.answers);
  if (!character) return;

  appState.result = character.code;

  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    code:      character.code,
    answers:   appState.answers,
    timestamp: Date.now(),
  }));

  renderResult(character);
  showScreen("screen-result");
}

/* ─────────────────────────────────────────
   이전 결과 보기
───────────────────────────────────────── */
function showSavedResult() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !saved.code) throw new Error("invalid");
    const character = CHARACTERS[saved.code];
    if (!character) throw new Error("unknown code");
    appState.result  = saved.code;
    appState.answers = saved.answers || [];
    renderResult(character);
    showScreen("screen-result");
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    renderIntroActions();
    alert("저장된 결과를 불러올 수 없습니다. 다시 테스트해 주세요.");
  }
}

/* ─────────────────────────────────────────
   결과 화면 렌더링
───────────────────────────────────────── */
/**
 * #result-content를 캐릭터 데이터로 채운다.
 * @param {Object} character  CHARACTERS 맵의 항목
 */
function renderResult(character) {
  const container = document.getElementById("result-content");
  container.innerHTML = "";

  // 1. 헤더: 이모지 + 캐릭터명 + 코드 뱃지 + 유사 MBTI 뱃지
  const header = document.createElement("div");
  header.className = "result__header";
  header.innerHTML = `
    <div class="result__emoji">${character.emoji}</div>
    <p class="result__char-name">${character.characterName}</p>
    <div class="result__badges">
      <span class="badge badge--code">${character.code}</span>
      <span class="badge badge--mbti">유사 MBTI ${character.similarMBTI}</span>
    </div>
  `;
  container.appendChild(header);

  // 2. 한줄 소개 (title)
  const titleEl = document.createElement("p");
  titleEl.className = "result__title";
  titleEl.textContent = character.title;
  container.appendChild(titleEl);

  // 3. 설명 텍스트 블록
  const descEl = document.createElement("div");
  descEl.className = "result__description";
  character.description.forEach(line => {
    const p = document.createElement("p");
    p.textContent = line;
    descEl.appendChild(p);
  });
  container.appendChild(descEl);

  // 4. 축 요약 칩 4개
  const axesEl = document.createElement("div");
  axesEl.className = "result__axes";
  character.axes.forEach(axis => {
    const chip = document.createElement("span");
    chip.className = "axis-chip";
    chip.textContent = axis;
    axesEl.appendChild(chip);
  });
  container.appendChild(axesEl);

  // 5. 궁합 카드 2개
  const chemEl = document.createElement("div");
  chemEl.className = "result__chemistry";

  [
    { type: "best",  icon: "💚", label: "최고의 궁합",      data: character.chemistry.best  },
    { type: "worst", icon: "❌", label: "주의가 필요한 궁합", data: character.chemistry.worst },
  ].forEach(({ type, icon, label, data }) => {
    const card = document.createElement("div");
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
   결과 화면 버튼
───────────────────────────────────────── */
function initResultButtons() {
  // 다시 테스트하기
  document.getElementById("btn-retry").addEventListener("click", () => {
    appState.currentQuestion = 0;
    appState.answers         = [];
    appState.result          = null;
    showScreen("screen-intro");
    renderIntroActions();
  });

  // 결과 복사하기
  document.getElementById("btn-copy").addEventListener("click", () => {
    const char = CHARACTERS[appState.result];
    if (!char) return;

    const text =
      `나는 페이레터 편지 배달 캐릭터 테스트 결과 [${char.characterName}]!\n` +
      `유사 MBTI는 ${char.similarMBTI},\n` +
      `한줄 소개는 '${char.title}'\n` +
      `최고의 궁합은 ${char.chemistry.best.name}, 최악의 궁합은 ${char.chemistry.worst.name}!`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => alert("결과가 클립보드에 복사되었습니다!"))
        .catch(() => _fallbackCopy(text));
    } else {
      _fallbackCopy(text);
    }
  });
}

/** clipboard API 미지원 환경용 textarea 폴백 */
function _fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    alert("결과가 클립보드에 복사되었습니다!");
  } catch {
    alert(`아래 텍스트를 직접 복사해 주세요:\n\n${text}`);
  }
  document.body.removeChild(ta);
}

/* ─────────────────────────────────────────
   이전 버튼 (질문 화면)
───────────────────────────────────────── */
function initBackButton() {
  document.getElementById("btn-back").addEventListener("click", () => {
    if (appState.currentQuestion > 0) {
      appState.currentQuestion -= 1;
      appState.answers.pop();
      Engine.renderQuestion(appState.currentQuestion, handleAnswer);
    } else {
      showScreen("screen-intro");
      renderIntroActions();
    }
  });
}

/* ─────────────────────────────────────────
   초기화
───────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  renderIntroActions();
  initBackButton();
  initResultButtons();
});
