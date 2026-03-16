// Created: 2026-03-16

/**
 * engine.js
 * 점수 집계 및 결과 유형 산출 로직
 */

const Engine = (() => {
  /**
   * 모든 답변의 scores를 합산해 MBTI 4축 점수를 계산한다.
   * @param {Array<Object>} answers - appState.answers 배열
   *   각 요소: { questionId, choiceIndex, scores: { E?:n, I?:n, ... } }
   * @returns {{ E:n, I:n, S:n, N:n, T:n, F:n, J:n, P:n }}
   */
  function calcScores(answers) {
    const total = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    for (const answer of answers) {
      for (const [axis, val] of Object.entries(answer.scores)) {
        if (axis in total) total[axis] += val;
      }
    }
    return total;
  }

  /**
   * 점수 맵으로 MBTI 4글자 코드를 결정한다.
   * @param {{ E:n, I:n, S:n, N:n, T:n, F:n, J:n, P:n }} scores
   * @returns {string} e.g. "ENFP"
   */
  function scoresToMbti(scores) {
    const ei = scores.E >= scores.I ? "E" : "I";
    const sn = scores.S >= scores.N ? "S" : "N";
    const tf = scores.T >= scores.F ? "T" : "F";
    const jp = scores.J >= scores.P ? "J" : "P";
    return ei + sn + tf + jp;
  }

  /**
   * answers 배열로부터 RESULTS 객체의 키를 반환한다.
   * RESULTS에 해당 키가 없으면 가장 유사한 기본 타입으로 폴백.
   * @param {Array<Object>} answers
   * @returns {string} MBTI 코드
   */
  function resolveResult(answers) {
    const scores = calcScores(answers);
    const mbti   = scoresToMbti(scores);
    // RESULTS에 없는 타입이면 첫 번째 키로 폴백
    return (mbti in RESULTS) ? mbti : Object.keys(RESULTS)[0];
  }

  /**
   * 진행률(0~100) 계산
   * @param {number} currentIndex 현재 0-based 질문 인덱스
   * @param {number} total        전체 질문 수
   * @returns {number}
   */
  function calcProgress(currentIndex, total) {
    return Math.round((currentIndex / total) * 100);
  }

  /**
   * 선택지 버튼 HTML을 생성해 #question-choices에 렌더링한다.
   * @param {Object} question QUESTIONS 배열의 항목
   * @param {Function} onSelect 선택 시 콜백 (choiceIndex: number) => void
   */
  function renderChoices(question, onSelect) {
    const container = document.getElementById("question-choices");
    container.innerHTML = "";
    question.choices.forEach((choice, idx) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = choice.label;
      btn.addEventListener("click", () => {
        // 선택 피드백
        container.querySelectorAll(".choice-btn").forEach(b => b.classList.remove("choice-btn--selected"));
        btn.classList.add("choice-btn--selected");
        // 짧은 딜레이 후 다음 단계로
        setTimeout(() => onSelect(idx), 220);
      });
      container.appendChild(btn);
    });
  }

  /**
   * 질문 화면 UI 전체를 업데이트한다.
   * @param {number} index 0-based 질문 인덱스
   * @param {Function} onSelect
   */
  function renderQuestion(index, onSelect) {
    const question = QUESTIONS[index];
    const total    = QUESTIONS.length;

    document.getElementById("question-text").textContent    = question.text;
    document.getElementById("question-counter").textContent = `${index + 1} / ${total}`;
    document.getElementById("progress-fill").style.width   = `${calcProgress(index, total)}%`;

    renderChoices(question, onSelect);
  }

  /**
   * 결과 화면 UI를 업데이트한다.
   * @param {string} mbtiCode e.g. "ENFP"
   */
  function renderResult(mbtiCode) {
    const data = RESULTS[mbtiCode];
    document.getElementById("result-emoji").textContent = data.emoji;
    document.getElementById("result-type").textContent  = mbtiCode;
    document.getElementById("result-name").textContent  = data.name;
    document.getElementById("result-desc").textContent  = data.desc;
  }

  return { resolveResult, renderQuestion, renderResult };
})();
