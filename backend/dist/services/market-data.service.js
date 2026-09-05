import db from '../db/database.js';
import { IndicatorsService } from './indicators.service.js';
const MOCK_STOCKS = [
    { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 230, marketCap: 3000000000000, avgVolume: 50000000 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', basePrice: 440, marketCap: 3200000000000, avgVolume: 20000000 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', basePrice: 175, marketCap: 2100000000000, avgVolume: 25000000 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', basePrice: 190, marketCap: 1900000000000, avgVolume: 40000000 },
    { symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 250, marketCap: 800000000000, avgVolume: 100000000 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', basePrice: 130, marketCap: 3000000000000, avgVolume: 400000000 },
    { symbol: 'META', name: 'Meta Platforms Inc.', basePrice: 530, marketCap: 1300000000000, avgVolume: 15000000 },
    { symbol: 'NFLX', name: 'Netflix Inc.', basePrice: 700, marketCap: 300000000000, avgVolume: 3000000 },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', basePrice: 220, marketCap: 600000000000, avgVolume: 8000000 },
    { symbol: 'V', name: 'Visa Inc.', basePrice: 280, marketCap: 500000000000, avgVolume: 5000000 },
    { symbol: 'WMT', name: 'Walmart Inc.', basePrice: 80, marketCap: 600000000000, avgVolume: 15000000 },
    { symbol: 'DIS', name: 'The Walt Disney Co.', basePrice: 100, marketCap: 180000000000, avgVolume: 10000000 },
    { symbol: 'COIN', name: 'Coinbase Global', basePrice: 250, marketCap: 60000000000, avgVolume: 8000000 },
    { symbol: 'AMD', name: 'Advanced Micro Devices', basePrice: 155, marketCap: 250000000000, avgVolume: 50000000 },
    { symbol: 'BA', name: 'Boeing Co.', basePrice: 180, marketCap: 110000000000, avgVolume: 5000000 }
];
export class MarketDataService {
    static getStockMeta(symbol) {
        return MOCK_STOCKS.find(s => s.symbol === symbol.toUpperCase());
    }
    static generateHistoricalData(symbol, days = 30) {
        const meta = this.getStockMeta(symbol);
        if (!meta)
            return;
        let currentPrice = meta.basePrice;
        const history = [];
        const now = new Date();
        // Generate backwards
        for (let i = days; i >= 1; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const change = currentPrice * (Math.random() * 0.04 - 0.02);
            const close = currentPrice + change;
            const open = currentPrice;
            const high = Math.max(open, close) + (Math.random() * currentPrice * 0.01);
            const low = Math.min(open, close) - (Math.random() * currentPrice * 0.01);
            const volume = meta.avgVolume * (0.5 + Math.random());
            history.push({ symbol, date: dateStr, open_price: open, high, low, close, volume });
            currentPrice = close;
        }
        const insert = db.prepare(`
      INSERT OR REPLACE INTO daily_history 
      (symbol, date, open_price, high, low, close, volume) 
      VALUES (@symbol, @date, @open_price, @high, @low, @close, @volume)
    `);
        db.transaction(() => {
            for (const record of history) {
                insert.run(record);
            }
        })();
    }
    static getCurrentQuote(symbol) {
        const meta = this.getStockMeta(symbol);
        if (!meta)
            return null;
        // See if we have history
        let lastHistory = db.prepare(`SELECT * FROM daily_history WHERE symbol = ? ORDER BY date DESC LIMIT 1`).get(symbol);
        if (!lastHistory) {
            this.generateHistoricalData(symbol);
            lastHistory = db.prepare(`SELECT * FROM daily_history WHERE symbol = ? ORDER BY date DESC LIMIT 1`).get(symbol);
        }
        const previousClose = lastHistory.close;
        // Simulate current day movement
        const priceChange = previousClose * (Math.random() * 0.06 - 0.03); // up to 3% move
        const price = previousClose + priceChange;
        const open_price = previousClose * (1 + (Math.random() * 0.01 - 0.005));
        const day_high = Math.max(open_price, price) * 1.005;
        const day_low = Math.min(open_price, price) * 0.995;
        const volume = meta.avgVolume * Math.random();
        // week 52 approx
        const week_52_high = meta.basePrice * 1.3;
        const week_52_low = meta.basePrice * 0.7;
        return {
            symbol: meta.symbol,
            price,
            previous_close: previousClose,
            open_price,
            day_high,
            day_low,
            volume,
            avg_volume_20d: meta.avgVolume,
            week_52_high,
            week_52_low,
            market_cap: meta.marketCap
        };
    }
    static getQuote(symbol) {
        let cached = db.prepare(`SELECT * FROM quote_cache WHERE symbol = ?`).get(symbol);
        if (!cached) {
            this.refreshQuotes([symbol]);
            cached = db.prepare(`SELECT * FROM quote_cache WHERE symbol = ?`).get(symbol);
        }
        return cached;
    }
    static getQuotes(symbols) {
        return symbols.map(s => this.getQuote(s)).filter(Boolean);
    }
    static searchSymbols(query) {
        const lowerQ = query.toLowerCase();
        return MOCK_STOCKS.filter(s => s.symbol.toLowerCase().includes(lowerQ) ||
            s.name.toLowerCase().includes(lowerQ)).slice(0, 10);
    }
    static getHistoricalData(symbol) {
        return db.prepare(`SELECT * FROM daily_history WHERE symbol = ? ORDER BY date ASC`).all(symbol);
    }
    static refreshAllQuotes() {
        const symbolsObj = db.prepare(`SELECT DISTINCT symbol FROM watchlist_items`).all();
        const symbols = symbolsObj.map(s => s.symbol);
        this.refreshQuotes(symbols);
    }
    static refreshQuotes(symbols) {
        const insert = db.prepare(`
      INSERT OR REPLACE INTO quote_cache 
      (symbol, price, previous_close, open_price, day_high, day_low, volume, avg_volume_20d, week_52_high, week_52_low, market_cap, sma_20, rsi_14, atr_14, updated_at) 
      VALUES (@symbol, @price, @previous_close, @open_price, @day_high, @day_low, @volume, @avg_volume_20d, @week_52_high, @week_52_low, @market_cap, @sma_20, @rsi_14, @atr_14, @updated_at)
    `);
        db.transaction(() => {
            for (const sym of symbols) {
                const quote = this.getCurrentQuote(sym);
                if (!quote)
                    continue;
                const indicators = IndicatorsService.computeIndicators(sym);
                insert.run({
                    ...quote,
                    sma_20: indicators.sma20,
                    rsi_14: indicators.rsi14,
                    atr_14: indicators.atr14,
                    updated_at: new Date().toISOString()
                });
            }
        })();
    }
}
