const scoreboardEl = document.getElementById('scoreboard');
const REFRESH_INTERVAL = 10000;
const prevScores = new Map();

async function fetchPlayers() {
  try {
    const res = await fetch('/api/players');
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
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

function createPlayerCard(player, rank) {
  const isLeader = rank === 1;
  const card = el('article', `player-card fade-in${isLeader ? ' leader' : ''}`);
  card.style.setProperty('--player-color', player.color);

  const avatar = createAvatar(player);
  const name = el('h2', 'player-name', player.name);

  const prev = prevScores.get(player._id);
  const shouldBump = prev !== undefined && prev !== player.score;
  const score = el('div', `player-score${shouldBump ? ' bump' : ''}`, player.score);
  prevScores.set(player._id, player.score);

  const badgeInfo = RANK_BADGES[rank - 1] || RANK_BADGES[2];
  const badge = el('div', `position-badge ${badgeInfo.cls}`, badgeInfo.text);

  card.append(avatar, name, score, badge);
  return card;
}

function renderScoreboard(players) {
  scoreboardEl.replaceChildren();

  if (!players) {
    scoreboardEl.append(el('div', 'loading', 'კავშირი ვერ დამყარდა'));
    return;
  }

  for (let i = 0; i < players.length; i++) {
    scoreboardEl.append(createPlayerCard(players[i], i + 1));
  }
}

async function refresh() {
  const players = await fetchPlayers();
  renderScoreboard(players);
}

refresh();
setInterval(refresh, REFRESH_INTERVAL);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) refresh();
});
