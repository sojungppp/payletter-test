// Created: 2026-03-16

/**
 * admin.js
 * 관리자 페이지: 인증 / Supabase 데이터 조회 / 통계 렌더링
 */

/* ─────────────────────────────────────────
   인증 (sessionStorage 기반)
───────────────────────────────────────── */
const AUTH_KEY = 'pl_admin_auth';

function isAuthed() {
  return sessionStorage.getItem(AUTH_KEY) === '1';
}

function checkAuth() {
  if (isAuthed()) {
    showDashboard();
    loadStats();
  }
  // 인증 안 됐으면 #view-auth 기본 표시 (HTML 기본값)
}

function handleLogin() {
  const input   = document.getElementById('pw-input');
  const errorEl = document.getElementById('auth-error');

  if (input.value === ADMIN_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, '1');
    errorEl.textContent = '';
    showDashboard();
    loadStats();
  } else {
    errorEl.textContent = '패스워드가 올바르지 않습니다.';
    input.value = '';
    input.focus();
  }
}

function handleLogout() {
  sessionStorage.removeItem(AUTH_KEY);
  document.getElementById('view-dashboard').style.display = 'none';
  document.getElementById('view-auth').style.display      = 'flex';
  document.getElementById('pw-input').value               = '';
  document.getElementById('auth-error').textContent       = '';
}

function showDashboard() {
  document.getElementById('view-auth').style.display      = 'none';
  document.getElementById('view-dashboard').style.display = 'block';
}

/* ─────────────────────────────────────────
   상태 박스 전환
───────────────────────────────────────── */
function setDashboardState(state) {
  // state: 'loading' | 'error' | 'empty' | 'content'
  document.getElementById('state-loading').style.display      = state === 'loading' ? 'flex'  : 'none';
  document.getElementById('state-error').style.display        = state === 'error'   ? 'flex'  : 'none';
  document.getElementById('state-empty').style.display        = state === 'empty'   ? 'flex'  : 'none';
  document.getElementById('dashboard-content').style.display  = state === 'content' ? 'block' : 'none';
}

/* ─────────────────────────────────────────
   Supabase 데이터 조회
───────────────────────────────────────── */
async function fetchStats() {
  if (!SUPABASE_URL || SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    return _devDummyData();
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/results?select=result_code`,
    {
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    }
  );

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // [{ result_code: 'SPFI' }, ...]
}

/** config 미설정 시 보여줄 더미 데이터 */
function _devDummyData() {
  const codes = Object.keys(CHARACTERS);
  const rows  = [];
  codes.forEach((code, i) => {
    const count = Math.max(0, 14 - i + Math.round(Math.random() * 5));
    for (let j = 0; j < count; j++) rows.push({ result_code: code });
  });
  return rows;
}

/* ─────────────────────────────────────────
   통계 집계
───────────────────────────────────────── */
/**
 * @param  {Array<{result_code: string}>} rows
 * @returns {{ total, byCode, axes }}
 */
function aggregateStats(rows) {
  const total = rows.length;

  // 캐릭터별 카운트 (모든 키 0으로 초기화)
  const byCode = {};
  Object.keys(CHARACTERS).forEach(k => (byCode[k] = 0));
  rows.forEach(r => {
    if (byCode[r.result_code] !== undefined) byCode[r.result_code]++;
  });

  // 4축 분포
  const axes = {
    speed:    { left: 'S (신속형)',      right: 'C (신중형)',   leftScore: 0, rightScore: 0 },
    relation: { left: 'P (사람형)',      right: 'T (과제형)',   leftScore: 0, rightScore: 0 },
    style:    { left: 'F (유연형)',      right: 'T (구조형)',   leftScore: 0, rightScore: 0 },
    thinking: { left: 'I (아이디어형)', right: 'E (실행형)',   leftScore: 0, rightScore: 0 },
  };

  Object.entries(byCode).forEach(([code, count]) => {
    if (count === 0) return;
    axes.speed.leftScore     += code[0] === 'S' ? count : 0;
    axes.speed.rightScore    += code[0] === 'C' ? count : 0;
    axes.relation.leftScore  += code[1] === 'P' ? count : 0;
    axes.relation.rightScore += code[1] === 'T' ? count : 0;
    axes.style.leftScore     += code[2] === 'F' ? count : 0;
    axes.style.rightScore    += code[2] === 'T' ? count : 0;
    axes.thinking.leftScore  += code[3] === 'I' ? count : 0;
    axes.thinking.rightScore += code[3] === 'E' ? count : 0;
  });

  return { total, byCode, axes };
}

/* ─────────────────────────────────────────
   차트 — 캐릭터별 막대 (내림차순)
───────────────────────────────────────── */
function renderCharacterChart(byCode, total) {
  const container = document.getElementById('chart-characters');
  container.innerHTML = '';

  const sorted = Object.entries(byCode).sort((a, b) => b[1] - a[1]);
  const max    = sorted[0]?.[1] || 1;

  sorted.forEach(([code, count]) => {
    const char   = CHARACTERS[code];
    if (!char) return;

    const pct    = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
    const barPct = ((count / max) * 100).toFixed(1);

    const row = document.createElement('div');
    row.className = `bar-row${count === 0 ? ' bar-row--zero' : ''}`;
    row.innerHTML = `
      <div class="bar-row__meta">
        <span class="bar-row__emoji">${char.emoji}</span>
        <span class="bar-row__name">${char.characterName}</span>
        <span class="bar-row__code">${code}</span>
      </div>
      <div class="bar-row__track">
        <div class="bar-row__fill" data-pct="${barPct}"></div>
      </div>
      <div class="bar-row__stat">
        ${count}<span class="bar-row__pct"> (${pct}%)</span>
      </div>
    `;
    container.appendChild(row);
  });

  // rAF로 width 적용 → CSS transition 동작
  requestAnimationFrame(() => {
    container.querySelectorAll('.bar-row__fill').forEach(el => {
      el.style.width = `${el.dataset.pct}%`;
    });
  });
}

/* ─────────────────────────────────────────
   차트 — 4축 분포 (좌우 분할 막대)
───────────────────────────────────────── */
function renderAxesChart(axes, total) {
  const container = document.getElementById('chart-axes');
  container.innerHTML = '';

  const labels = {
    speed:    '속도 축',
    relation: '관계 축',
    style:    '스타일 축',
    thinking: '사고 축',
  };

  Object.entries(axes).forEach(([key, ax]) => {
    const sum      = (ax.leftScore + ax.rightScore) || 1;
    const leftPct  = ((ax.leftScore  / sum) * 100).toFixed(1);
    const rightPct = ((ax.rightScore / sum) * 100).toFixed(1);

    const row = document.createElement('div');
    row.className = 'axis-row';
    row.innerHTML = `
      <div class="axis-row__header">
        <span class="axis-row__label">${labels[key]}</span>
        <span class="axis-row__sides">${ax.left} vs ${ax.right}</span>
      </div>
      <div class="axis-row__bar">
        <div class="axis-row__fill--left"  data-pct="${leftPct}"></div>
        <div class="axis-row__fill--right" data-pct="${rightPct}"></div>
      </div>
      <div class="axis-row__labels">
        <span>${ax.left} ${leftPct}%</span>
        <span>${rightPct}% ${ax.right}</span>
      </div>
    `;
    container.appendChild(row);
  });

  requestAnimationFrame(() => {
    container.querySelectorAll('.axis-row__fill--left, .axis-row__fill--right').forEach(el => {
      el.style.width = `${el.dataset.pct}%`;
    });
  });
}

/* ─────────────────────────────────────────
   대시보드 렌더링
───────────────────────────────────────── */
function renderDashboard(rows) {
  const { total, byCode, axes } = aggregateStats(rows);
  document.getElementById('total-count').textContent = total;
  renderCharacterChart(byCode, total);
  renderAxesChart(axes, total);
  setDashboardState('content');
}

/* ─────────────────────────────────────────
   데이터 로드
───────────────────────────────────────── */
async function loadStats() {
  setDashboardState('loading');
  try {
    const rows = await fetchStats();
    if (!rows || rows.length === 0) {
      setDashboardState('empty');
      return;
    }
    renderDashboard(rows);
  } catch (err) {
    console.error('[loadStats] 실패:', err);
    setDashboardState('error');
  }
}

/* ─────────────────────────────────────────
   버튼 바인딩
───────────────────────────────────────── */
function _initAdminButtons() {
  document.getElementById('btn-auth').addEventListener('click', handleLogin);

  document.getElementById('pw-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });

  document.getElementById('btn-refresh').addEventListener('click', loadStats);
  document.getElementById('btn-retry').addEventListener('click', loadStats);
  document.getElementById('btn-logout').addEventListener('click', handleLogout);
}

/* ─────────────────────────────────────────
   초기화
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  _initAdminButtons();
  checkAuth();
});
