import db from '../db/database.js';

export class SnapshotService {
  static captureSnapshot(userId: string, symbols: string[]) {
    const insert = db.prepare(`
      INSERT OR REPLACE INTO snapshots (user_id, symbol, price, volume, captured_at)
      VALUES (@user_id, @symbol, @price, @volume, @captured_at)
    `);

    const now = new Date().toISOString();

    db.transaction(() => {
      for (const symbol of symbols) {
        const quote = db.prepare(`SELECT price, volume FROM quote_cache WHERE symbol = ?`).get(symbol) as any;
        if (quote) {
          insert.run({
            user_id: userId,
            symbol,
            price: quote.price,
            volume: quote.volume,
            captured_at: now
          });
        }
      }
    })();
  }

  static getChangesSinceLastSeen(userId: string, currentQuotes: any[]) {
    const snapshots = db.prepare(`SELECT * FROM snapshots WHERE user_id = ?`).all(userId) as any[];
    const snapshotMap = new Map(snapshots.map(s => [s.symbol, s]));

    return currentQuotes.map(quote => {
      const snap = snapshotMap.get(quote.symbol);
      if (!snap) return null;

      const absoluteChange = quote.price - snap.price;
      const percentChange = (absoluteChange / snap.price) * 100;

      return {
        symbol: quote.symbol,
        lastSeenPrice: snap.price,
        currentPrice: quote.price,
        absoluteChange,
        percentChange,
        timeSinceLastSeen: snap.captured_at
      };
    }).filter(Boolean);
  }
}
