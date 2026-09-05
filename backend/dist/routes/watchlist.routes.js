import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { MarketDataService } from '../services/market-data.service.js';
const router = Router();
router.post('/users', (req, res) => {
    const { id } = req.body;
    if (!id)
        return res.status(400).json({ error: 'Missing id' });
    let user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
        const now = new Date().toISOString();
        db.prepare('INSERT INTO users (id, created_at, last_seen_at) VALUES (?, ?, ?)').run(id, now, now);
        const wlId = uuidv4();
        db.prepare('INSERT INTO watchlists (id, user_id, name, created_at, sort_order) VALUES (?, ?, ?, ?, ?)').run(wlId, id, 'My Watchlist', now, 0);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    }
    res.json(user);
});
router.get('/watchlists', (req, res) => {
    const { userId } = req.query;
    if (!userId)
        return res.status(400).json({ error: 'Missing userId' });
    const watchlists = db.prepare('SELECT * FROM watchlists WHERE user_id = ? ORDER BY sort_order').all(userId);
    for (const wl of watchlists) {
        const countRes = db.prepare('SELECT COUNT(*) as c FROM watchlist_items WHERE watchlist_id = ?').get(wl.id);
        wl.itemCount = countRes.c;
    }
    res.json(watchlists);
});
router.post('/watchlists', (req, res) => {
    const { userId, name } = req.body;
    if (!userId || !name)
        return res.status(400).json({ error: 'Missing userId or name' });
    const id = uuidv4();
    db.prepare('INSERT INTO watchlists (id, user_id, name, created_at, sort_order) VALUES (?, ?, ?, ?, ?)').run(id, userId, name, new Date().toISOString(), 0);
    res.json({ id, user_id: userId, name });
});
router.delete('/watchlists/:id', (req, res) => {
    db.prepare('DELETE FROM watchlists WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});
router.get('/watchlists/:id/items', (req, res) => {
    const items = db.prepare('SELECT * FROM watchlist_items WHERE watchlist_id = ? ORDER BY sort_order').all(req.params.id);
    res.json(items);
});
router.post('/watchlists/:id/items', (req, res) => {
    const { symbol, alertAbove, alertBelow, notes } = req.body;
    if (!symbol)
        return res.status(400).json({ error: 'Missing symbol' });
    const meta = MarketDataService.getStockMeta(symbol);
    if (!meta)
        return res.status(404).json({ error: 'Symbol not found' });
    const id = uuidv4();
    try {
        db.prepare(`
      INSERT INTO watchlist_items (id, watchlist_id, symbol, company_name, added_at, alert_price_above, alert_price_below, notes, sort_order) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.params.id, meta.symbol, meta.name, new Date().toISOString(), alertAbove || null, alertBelow || null, notes || null, 0);
        // Make sure we have data for this symbol
        MarketDataService.generateHistoricalData(meta.symbol);
        MarketDataService.refreshQuotes([meta.symbol]);
        res.json({ id, symbol: meta.symbol });
    }
    catch (err) {
        if (err.message.includes('UNIQUE constraint')) {
            res.status(400).json({ error: 'Symbol already in watchlist' });
        }
        else {
            res.status(500).json({ error: err.message });
        }
    }
});
router.delete('/watchlists/:id/items/:symbol', (req, res) => {
    db.prepare('DELETE FROM watchlist_items WHERE watchlist_id = ? AND symbol = ?').run(req.params.id, req.params.symbol);
    res.json({ success: true });
});
router.patch('/watchlists/:id/items/:symbol', (req, res) => {
    const { alertAbove, alertBelow, notes } = req.body;
    const updates = [];
    const params = [];
    if (alertAbove !== undefined) {
        updates.push('alert_price_above = ?');
        params.push(alertAbove);
    }
    if (alertBelow !== undefined) {
        updates.push('alert_price_below = ?');
        params.push(alertBelow);
    }
    if (notes !== undefined) {
        updates.push('notes = ?');
        params.push(notes);
    }
    if (updates.length > 0) {
        params.push(req.params.id, req.params.symbol);
        db.prepare(`UPDATE watchlist_items SET ${updates.join(', ')} WHERE watchlist_id = ? AND symbol = ?`).run(...params);
    }
    res.json({ success: true });
});
export default router;
