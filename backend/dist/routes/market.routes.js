import { Router } from 'express';
import db from '../db/database.js';
import { MarketDataService } from '../services/market-data.service.js';
import { AttentionService } from '../services/attention.service.js';
import { SnapshotService } from '../services/snapshot.service.js';
const router = Router();
router.get('/search', (req, res) => {
    const { q } = req.query;
    if (!q)
        return res.json([]);
    res.json(MarketDataService.searchSymbols(q));
});
router.get('/quotes', (req, res) => {
    const { symbols } = req.query;
    if (!symbols)
        return res.json([]);
    const symArray = symbols.split(',');
    res.json(MarketDataService.getQuotes(symArray));
});
router.get('/pulse/:userId', (req, res) => {
    const { userId } = req.params;
    // Get all items user is watching
    const items = db.prepare(`
    SELECT wi.* 
    FROM watchlist_items wi
    JOIN watchlists w ON wi.watchlist_id = w.id
    WHERE w.user_id = ?
  `).all(userId);
    if (items.length === 0) {
        return res.json({ marketStatus: 'open', lastUpdated: new Date().toISOString(), items: [], summary: { totalItems: 0, needsAttention: 0, biggestMover: null } });
    }
    const symbols = [...new Set(items.map(i => i.symbol))];
    const quotes = MarketDataService.getQuotes(symbols);
    const changes = SnapshotService.getChangesSinceLastSeen(userId, quotes);
    const changeMap = new Map(changes.map((c) => [c.symbol, c]));
    let needsAttention = 0;
    let biggestMover = null;
    let maxChange = -1;
    const resultItems = items.map(item => {
        const quote = quotes.find(q => q.symbol === item.symbol);
        if (!quote)
            return null;
        const attention = AttentionService.computeAttentionScore(item.symbol, {
            above: item.alert_price_above,
            below: item.alert_price_below
        });
        if (attention.level === 'critical' || attention.level === 'attention') {
            needsAttention++;
        }
        const dayChange = quote.price - quote.previous_close;
        const dayChangePercent = (dayChange / quote.previous_close) * 100;
        if (Math.abs(dayChangePercent) > maxChange) {
            maxChange = Math.abs(dayChangePercent);
            biggestMover = { symbol: item.symbol, changePercent: dayChangePercent };
        }
        const changeSinceLastSeen = changeMap.get(item.symbol) || null;
        return {
            symbol: item.symbol,
            companyName: item.company_name,
            price: quote.price,
            previousClose: quote.previous_close,
            dayChange,
            dayChangePercent,
            changeSinceLastSeen: changeSinceLastSeen ? {
                price: changeSinceLastSeen.absoluteChange,
                percent: changeSinceLastSeen.percentChange,
                lastSeenAt: changeSinceLastSeen.timeSinceLastSeen
            } : null,
            attention,
            indicators: {
                sma20: quote.sma_20,
                rsi14: quote.rsi_14,
                atr14: quote.atr_14
            },
            quote: {
                high: quote.day_high,
                low: quote.day_low,
                volume: quote.volume,
                avgVolume20d: quote.avg_volume_20d,
                marketCap: quote.market_cap
            },
            alerts: {
                above: item.alert_price_above,
                below: item.alert_price_below
            },
            notes: item.notes
        };
    }).filter(Boolean);
    resultItems.sort((a, b) => b.attention.score - a.attention.score);
    res.json({
        marketStatus: 'open',
        lastUpdated: new Date().toISOString(),
        items: resultItems,
        summary: {
            totalItems: resultItems.length,
            needsAttention,
            biggestMover
        }
    });
});
router.post('/pulse/:userId/seen', (req, res) => {
    const { userId } = req.params;
    const items = db.prepare(`
    SELECT wi.symbol 
    FROM watchlist_items wi
    JOIN watchlists w ON wi.watchlist_id = w.id
    WHERE w.user_id = ?
  `).all(userId);
    const symbols = [...new Set(items.map(i => i.symbol))];
    SnapshotService.captureSnapshot(userId, symbols);
    db.prepare('UPDATE users SET last_seen_at = ? WHERE id = ?').run(new Date().toISOString(), userId);
    res.json({ success: true, count: symbols.length });
});
export default router;
