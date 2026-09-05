import { Router } from 'express';
import db from '../db/database.js';
const router = Router();
router.get('/export/:userId', (req, res) => {
    const watchlists = db.prepare('SELECT * FROM watchlists WHERE user_id = ?').all(req.params.userId);
    for (const wl of watchlists) {
        wl.items = db.prepare('SELECT * FROM watchlist_items WHERE watchlist_id = ?').all(wl.id);
    }
    res.json({ watchlists });
});
router.post('/import/:userId', (req, res) => {
    const { userId } = req.params;
    const { watchlists } = req.body;
    if (!watchlists || !Array.isArray(watchlists)) {
        return res.status(400).json({ error: 'Invalid format' });
    }
    db.transaction(() => {
        for (const wl of watchlists) {
            db.prepare(`INSERT OR IGNORE INTO watchlists (id, user_id, name, created_at, sort_order) VALUES (?, ?, ?, ?, ?)`).run(wl.id, userId, wl.name, wl.created_at, wl.sort_order);
            if (wl.items && Array.isArray(wl.items)) {
                for (const item of wl.items) {
                    db.prepare(`INSERT OR IGNORE INTO watchlist_items (id, watchlist_id, symbol, company_name, added_at, alert_price_above, alert_price_below, notes, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(item.id, item.watchlist_id, item.symbol, item.company_name, item.added_at, item.alert_price_above, item.alert_price_below, item.notes, item.sort_order);
                }
            }
        }
    })();
    res.json({ success: true });
});
export default router;
