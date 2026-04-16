require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, getPool } = require('./config/db');
const playersRouter = require('./routes/players');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/players', playersRouter);

app.get(/^\/(.+)\.html$/, (req, res) => {
  res.redirect(301, '/' + req.params[0]);
});

app.use(
  express.static(path.join(__dirname, '..', 'public'), {
    extensions: ['html'],
  })
);

app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send('User-agent: *\nDisallow: /admin-data\n');
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'სერვერის შეცდომა' });
});

const SEED_PLAYERS = [
  { name: 'კაკუნა', avatar: '/assets/kakuna.jpg', avatarPosition: 'center top', color: '#FF8C42', score: 3, position: 1 },
  { name: 'დათო', avatar: '/assets/dato.jpg', avatarPosition: 'center 20%', color: '#8B4513', score: 5, position: 2 },
  { name: 'დათა', avatar: '/assets/data.jpg', avatarPosition: 'center 30%', color: '#FFD700', score: 7, position: 3 },
];

async function ensureSeedData() {
  const pool = getPool();
  const { rows: [countRow] } = await pool.query(
    'SELECT COUNT(*)::int AS n FROM players'
  );

  if (countRow.n === 0) {
    for (const p of SEED_PLAYERS) {
      await pool.query(
        `INSERT INTO players (name, avatar, avatar_position, color, score, position)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [p.name, p.avatar, p.avatarPosition, p.color, p.score, p.position]
      );
    }
    console.log('🌱 საწყისი მონაცემები ჩაიტვირთა (კაკუნა:3, დათო:5, დათა:7)');
    return;
  }

  for (const p of SEED_PLAYERS) {
    await pool.query(
      `UPDATE players SET name = $1, avatar = $2, avatar_position = $3, color = $4
       WHERE position = $5`,
      [p.name, p.avatar, p.avatarPosition, p.color, p.position]
    );
  }
}

connectDB()
  .then(ensureSeedData)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`⚽ სერვერი გაშვებულია: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ startup შეცდომა:', err);
    process.exit(1);
  });
