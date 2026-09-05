import db from '../db/database.js';

export class IndicatorsService {
  static calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return 0;
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  static calculateRSI(prices: number[], period: number): number {
    if (prices.length <= period) return 50; // default
    let gains = 0;
    let losses = 0;
    
    for (let i = prices.length - period; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff >= 0) gains += diff;
      else losses -= diff;
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    let rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  static calculateATR(highs: number[], lows: number[], closes: number[], period: number): number {
    if (highs.length <= period) return 0;
    const trs = [];
    for (let i = highs.length - period; i < highs.length; i++) {
      const high = highs[i];
      const low = lows[i];
      const prevClose = closes[i - 1];
      
      const tr1 = high - low;
      const tr2 = Math.abs(high - prevClose);
      const tr3 = Math.abs(low - prevClose);
      
      trs.push(Math.max(tr1, tr2, tr3));
    }
    return trs.reduce((a, b) => a + b, 0) / period;
  }

  static computeIndicators(symbol: string): { sma20: number; rsi14: number; atr14: number } {
    const history = db.prepare(`SELECT * FROM daily_history WHERE symbol = ? ORDER BY date ASC LIMIT 30`).all(symbol) as any[];
    if (history.length === 0) {
      return { sma20: 0, rsi14: 50, atr14: 0 };
    }

    const closes = history.map(h => h.close);
    const highs = history.map(h => h.high);
    const lows = history.map(h => h.low);

    return {
      sma20: this.calculateSMA(closes, 20),
      rsi14: this.calculateRSI(closes, 14),
      atr14: this.calculateATR(highs, lows, closes, 14)
    };
  }
}
