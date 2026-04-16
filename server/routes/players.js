const express = require('express');
const { getPool } = require('../config/db');

const router = express.Router();

function toApi(row) {
  return {
    _id: String(row.id),
    name: row.name,
    avatar: row.avatar,
    avatarPosition: row.avatar_position,
    color: row.color,
    score: row.score,
    position: row.position,
  };
}

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await getPool().query(
      'SELECT * FROM players ORDER BY score DESC, position ASC'
    );
    res.json(rows.map(toApi));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/score', async (req, res, next) => {
  try {
    const { delta } = req.body;
    if (typeof delta !== 'number' || !Number.isFinite(delta)) {
      return res.status(400).json({ error: 'delta უნდა იყოს რიცხვი' });
    }
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'არასწორი id' });

    const { rows } = await getPool().query(
      `UPDATE players SET score = GREATEST(0, score + $1), updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [delta, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'მოთამაშე ვერ მოიძებნა' });
    res.json(toApi(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/reset', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'არასწორი id' });

    const { rows } = await getPool().query(
      `UPDATE players SET score = 0, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'მოთამაშე ვერ მოიძებნა' });
    res.json(toApi(rows[0]));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
