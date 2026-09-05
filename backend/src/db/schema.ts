import { Database } from 'better-sqlite3';

export function initializeDatabase(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS watchlists (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS watchlist_items (
      id TEXT PRIMARY KEY,
      watchlist_id TEXT NOT NULL,
      symbol TEXT NOT NULL,
      company_name TEXT NOT NULL,
      added_at TEXT NOT NULL,
      alert_price_above REAL,
      alert_price_below REAL,
      notes TEXT,
      sort_order INTEGER NOT NULL,
      UNIQUE (watchlist_id, symbol),
      FOREIGN KEY (watchlist_id) REFERENCES watchlists(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      symbol TEXT NOT NULL,
      price REAL NOT NULL,
      volume INTEGER NOT NULL,
      captured_at TEXT NOT NULL,
      UNIQUE (user_id, symbol)
    );

    CREATE TABLE IF NOT EXISTS quote_cache (
      symbol TEXT PRIMARY KEY,
      price REAL NOT NULL,
      previous_close REAL NOT NULL,
      open_price REAL NOT NULL,
      day_high REAL NOT NULL,
      day_low REAL NOT NULL,
      volume INTEGER NOT NULL,
      avg_volume_20d INTEGER NOT NULL,
      week_52_high REAL NOT NULL,
      week_52_low REAL NOT NULL,
      market_cap REAL NOT NULL,
      sma_20 REAL NOT NULL,
      rsi_14 REAL NOT NULL,
      atr_14 REAL NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_history (
      symbol TEXT NOT NULL,
      date TEXT NOT NULL,
      open_price REAL NOT NULL,
      high REAL NOT NULL,
      low REAL NOT NULL,
      close REAL NOT NULL,
      volume INTEGER NOT NULL,
      PRIMARY KEY (symbol, date)
    );
  `);
}
