import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import pg from 'pg';

const { Pool } = pg;

let connection;
let pool;

if (process.env.DATABASE_URL) {
  console.log('Database mode: PostgreSQL');

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
    connectionTimeoutMillis: 10000
  });

  pool.on('error', (error) => {
    console.error('PostgreSQL pool error:', error.message);
  });
} else {
  console.log('Database mode: SQLite');

  mkdirSync('data', { recursive: true });

  connection = new DatabaseSync(
    process.env.DB_FILE || 'data/projects.db'
  );

  connection.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
        CHECK(length(trim(name)) BETWEEN 1 AND 80),
      status TEXT NOT NULL
        CHECK(status IN ('Planned', 'In Progress', 'Completed'))
    )
  `);
}

export const db = {
  async list() {
    if (pool) {
      const result = await pool.query(
        'SELECT id, name, status FROM public.projects ORDER BY id DESC'
      );
      return result.rows.map(row => ({
      ...row,
      id: Number(row.id)
}));
    }

    return connection
      .prepare('SELECT id, name, status FROM projects ORDER BY id DESC')
      .all();
  },

  async create({ name, status }) {
    if (pool) {
      const result = await pool.query(
        `INSERT INTO public.projects (name, status)
         VALUES ($1, $2)
         RETURNING id, name, status`,
        [name, status]
      );
      return {
      ...result.rows[0],
      id: Number(result.rows[0].id)
};
    }

    const result = connection
      .prepare('INSERT INTO projects (name, status) VALUES (?, ?)')
      .run(name, status);

    return connection
      .prepare('SELECT id, name, status FROM projects WHERE id = ?')
      .get(Number(result.lastInsertRowid));
  },

  async update(id, { name, status }) {
    if (pool) {
      const result = await pool.query(
        `UPDATE public.projects
         SET name = $1, status = $2
         WHERE id = $3
         RETURNING id, name, status`,
        [name, status, id]
      );
      const row = result.rows[0];
      return row ? { ...row, id: Number(row.id) } : null;
    }

    const result = connection
      .prepare('UPDATE projects SET name = ?, status = ? WHERE id = ?')
      .run(name, status, id);

    if (!result.changes) return null;

    return connection
      .prepare('SELECT id, name, status FROM projects WHERE id = ?')
      .get(id);
  },

  async remove(id) {
    if (pool) {
      const result = await pool.query(
        'DELETE FROM public.projects WHERE id = $1 RETURNING id',
        [id]
      );
      return result.rowCount > 0;
    }

    return connection
      .prepare('DELETE FROM projects WHERE id = ?')
      .run(id).changes > 0;
  }
};