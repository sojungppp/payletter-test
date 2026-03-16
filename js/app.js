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

  Engine.renderResult(character.code);
  showScreen("screen-result");
}

/* ─────────────────────────────────────────
   이전 결과 보기
───────────────────────────────────────── */
function showSavedResult() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !saved.code) throw new Error("invalid");
    appState.result  = saved.code;
    appState.answers = saved.answers || [];
    Engine.renderResult(saved.code);
    showScreen("screen-result");
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    renderIntroActions(); // 버튼 재렌더
    alert("저장된 결과를 불러올 수 없습니다. 다시 테스트해 주세요.");
  }
}

/* ─────────────────────────────────────────
   결과 화면 버튼
───────────────────────────────────────── */
function initResultButtons() {
  document.getElementById("btn-retry").addEventListener("click", () => {
    showScreen("screen-intro");
    renderIntroActions();
  });

  document.getElementById("btn-share").addEventListener("click", () => {
    const code = appState.result;
    const char = CHARACTERS[code];
    const text = `나는 페이레터 ${code} 유형 — "${char?.name}" 🎉\n결제 성향 테스트 해보기: ${location.href}`;

    if (navigator.share) {
      navigator.share({ title: "페이레터 캐릭터 진단", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert("결과가 클립보드에 복사되었습니다!");
      }).catch(() => {
        alert(`공유 텍스트:\n\n${text}`);
      });
    }
  });
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
  initResultButtons();
  initBackButton();
});
