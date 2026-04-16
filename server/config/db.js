let pool;

async function connectDB() {
  const url = process.env.DATABASE_URL;

  if (url) {
    const { Pool } = require('pg');
    const needsSsl =
      process.env.NODE_ENV === 'production' ||
      /railway\.internal|amazonaws|render\.com|neon\.tech|supabase/i.test(url);
    pool = new Pool({
      connectionString: url,
      ssl: needsSsl ? { rejectUnauthorized: false } : false,
    });
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL დაკავშირებულია');
  } else {
    try {
      const { newDb } = require('pg-mem');
      const db = newDb({ autoCreateForeignKeyIndices: true });
      const { Pool } = db.adapters.createPg();
      pool = new Pool();
      console.log('🧪 In-memory PostgreSQL (pg-mem) გაშვებულია (dev რეჟიმი)');
    } catch (err) {
      console.error('❌ DATABASE_URL არ არის მითითებული და pg-mem არ არის დაყენებული');
      console.error('   დააყენე DATABASE_URL env-ში (მაგ: Railway-ის Postgres)');
      process.exit(1);
    }
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS players (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      avatar TEXT,
      avatar_position TEXT DEFAULT 'center 15%',
      color TEXT DEFAULT '#FFD700',
      score INTEGER NOT NULL DEFAULT 0,
      position INTEGER NOT NULL UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

function getPool() {
  if (!pool) throw new Error('DB pool არ არის ინიციალიზებული');
  return pool;
}

module.exports = { connectDB, getPool };
