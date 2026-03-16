// Created: 2026-03-16

/**
 * admin.js
 * 관리자 페이지: localStorage 통계 대시보드
 */

const STORAGE_KEY   = "pl_result";
const STATS_KEY     = "pl_stats";   // 다수 세션 통계용 (선택적 확장)

/* ─────────────────────────────────────────
   데이터 로드
───────────────────────────────────────── */
function loadStats() {
  // 현재는 단일 사용자 localStorage 기반
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* ─────────────────────────────────────────
   통계 요약 렌더링
───────────────────────────────────────── */
function renderStatGrid(data) {
  const grid = document.getElementById("stat-grid");
  grid.innerHTML = "";

  const stats = data
    ? [
        { label: "내 유형",       value: data.mbti },
        { label: "완료 질문 수",  value: `${(data.answers || []).length}문항` },
        { label: "테스트 일시",   value: data.timestamp ? formatDate(data.timestamp) : "-" },
      ]
    : [{ label: "저장된 결과 없음", value: "—" }];

  stats.forEach(({ label, value }) => {
    const card = document.createElement("div");
    card.className = "stat-card";
    card.innerHTML = `
      <div class="stat-card__value">${value}</div>
      <div class="stat-card__label">${label}</div>
    `;
    grid.appendChild(card);
  });
}

/* ─────────────────────────────────────────
   유형별 분포 테이블
───────────────────────────────────────── */
function renderResultTable(data) {
  const tbody = document.getElementById("result-table-body");
  tbody.innerHTML = "";

  // 현재는 단일 결과 → 향후 다중 결과로 확장 가능
  if (!data) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="4" style="color:var(--color-muted); text-align:center; padding:24px;">
      저장된 데이터가 없습니다.
    </td>`;
    tbody.appendChild(tr);
    return;
  }

  const resultInfo = RESULTS[data.mbti] || { emoji: "❓", name: "알 수 없음" };
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><strong>${data.mbti}</strong></td>
    <td>${resultInfo.emoji} ${resultInfo.name}</td>
    <td>1</td>
    <td>100%</td>
  `;
  tbody.appendChild(tr);
}

/* ─────────────────────────────────────────
   버튼 이벤트
───────────────────────────────────────── */
function initButtons(data) {
  document.getElementById("btn-export").addEventListener("click", () => {
    if (!data) { alert("내보낼 데이터가 없습니다."); return; }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `payletter_result_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("btn-clear").addEventListener("click", () => {
    if (!confirm("로컬 저장 데이터를 모두 삭제하시겠습니까?")) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });
}

/* ─────────────────────────────────────────
   유틸
───────────────────────────────────────── */
function formatDate(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

/* ─────────────────────────────────────────
   초기화
───────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  const data = loadStats();
  renderStatGrid(data);
  renderResultTable(data);
  initButtons(data);
});
