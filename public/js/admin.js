const boardEl = document.getElementById('adminBoard');
const toastEl = document.getElementById('toast');
let players = [];
let toastTimer;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function showToast(message, type = 'success') {
  toastEl.textContent = message;
  toastEl.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.className = 'toast';
  }, 2000);
}

async function fetchPlayers() {
  try {
    const res = await fetch('/api/players');
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.error(err);
    showToast('მონაცემები ვერ ჩაიტვირთა', 'error');
    return null;
  }
}

async function updateScore(playerId, delta) {
  const card = boardEl.querySelector(`[data-id="${playerId}"]`);
  const scoreEl = card?.querySelector('.player-score');
  const previousScore = Number(scoreEl?.textContent);

  if (scoreEl) {
    const optimistic = Math.max(0, previousScore + delta);
    scoreEl.textContent = optimistic;
    scoreEl.classList.add('bump');
    setTimeout(() => scoreEl.classList.remove('bump'), 400);
  }

  try {
    const res = await fetch(`/api/players/${playerId}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta }),
    });
    if (!res.ok) throw new Error('API error');
    const updated = await res.json();
    if (scoreEl) scoreEl.textContent = updated.score;

    const msg = delta > 0 ? `✅ +${delta} ქულა` : `⚠️ ${delta} ქულა`;
    showToast(msg);
    await refresh();
  } catch (err) {
    if (scoreEl) scoreEl.textContent = previousScore;
    showToast('შეცდომა — ცვლილება ვერ შეინახა', 'error');
  }
}

async function resetScore(playerId, playerName) {
  if (!confirm(`ნამდვილად გინდა რომ ${playerName}-ს ქულა დაუბრუნდეს 0-ს?`)) return;

  try {
    const res = await fetch(`/api/players/${playerId}/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('API error');
    showToast('🔄 ქულა განულდა');
    await refresh();
  } catch (err) {
    showToast('რესეტი ვერ მოხერხდა', 'error');
  }
}

function createAvatar(player) {
  const wrap = el('div', 'avatar');
  if (player.avatar && player.avatar.startsWith('/')) {
    const img = document.createElement('img');
    img.src = player.avatar;
    img.alt = player.name;
    img.loading = 'lazy';
    if (player.avatarPosition) img.style.objectPosition = player.avatarPosition;
    wrap.classList.add('avatar-img');
    wrap.append(img);
  } else {
    wrap.textContent = player.avatar || '⚽';
  }
  return wrap;
}

const RANK_BADGES = [
  { text: '🐐 GOAT', cls: 'badge-goat' },
  { text: '🐐 მინი-GOAT', cls: 'badge-mid' },
  { text: '🍲 ჩაქაფული', cls: 'badge-loser' },
];

function createAdminCard(player, rank) {
  const isLeader = rank === 1;
  const card = el('article', `player-card fade-in${isLeader ? ' leader' : ''}`);
  card.dataset.id = player._id;
  card.style.setProperty('--player-color', player.color);

  const badgeInfo = RANK_BADGES[rank - 1] || RANK_BADGES[2];
  card.append(
    createAvatar(player),
    el('h2', 'player-name', player.name),
    el('div', 'player-score', player.score),
    el('div', `position-badge ${badgeInfo.cls}`, badgeInfo.text)
  );

  const controls = el('div', 'admin-controls');

  const plus1 = el('button', 'btn btn-plus', '+1');
  plus1.addEventListener('click', () => updateScore(player._id, 1));

  const minus1 = el('button', 'btn btn-minus', '−1');
  minus1.addEventListener('click', () => updateScore(player._id, -1));

  const reset = el('button', 'btn btn-reset btn-wide', '🔄 განულება');
  reset.addEventListener('click', () => resetScore(player._id, player.name));

  controls.append(plus1, minus1, reset);
  card.append(controls);
  return card;
}

function rankByScore(list) {
  const sorted = [...list].sort((a, b) => b.score - a.score);
  const ranks = new Map();
  sorted.forEach((p, i) => ranks.set(p._id, i + 1));
  return ranks;
}

function render() {
  boardEl.replaceChildren();
  if (!players.length) {
    boardEl.append(el('div', 'loading', 'მოთამაშეები არ არის'));
    return;
  }

  const ranks = rankByScore(players);
  const fixedOrder = [...players].sort((a, b) => a.position - b.position);

  for (const p of fixedOrder) {
    boardEl.append(createAdminCard(p, ranks.get(p._id)));
  }
}

async function refresh() {
  const data = await fetchPlayers();
  if (data) {
    players = data;
    render();
  }
}

refresh();
setInterval(refresh, 15000);
