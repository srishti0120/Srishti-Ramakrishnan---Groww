import db from '../db/database.js';

interface AttentionResult {
  symbol: string;
  score: number;
  level: 'critical' | 'attention' | 'watch' | 'calm';
  reasons: string[];
  components: {
    priceVelocity: number;
    volumeAnomaly: number;
    thresholdBreach: number;
    trendBreak: number;
    momentumShift: number;
  };
}

export class AttentionService {
  static computeAttentionScore(symbol: string, alerts: { above?: number | null, below?: number | null } = {}): AttentionResult {
    const quote = db.prepare(`SELECT * FROM quote_cache WHERE symbol = ?`).get(symbol) as any;
    if (!quote) {
      return {
        symbol,
        score: 0,
        level: 'calm',
        reasons: [],
        components: { priceVelocity: 0, volumeAnomaly: 0, thresholdBreach: 0, trendBreak: 0, momentumShift: 0 }
      };
    }

    const reasons: string[] = [];
    
    // Price Velocity (30%)
    let priceVelocityScore = 0;
    if (quote.atr_14 > 0) {
      const move = Math.abs(quote.price - quote.previous_close);
      const ratio = move / quote.atr_14;
      priceVelocityScore = Math.min(100, ratio * 33); // 3x ATR = 100
      if (ratio > 1.5) {
        reasons.push(`Price moved ${(ratio).toFixed(1)}x its typical daily range`);
      }
    }

    // Volume Anomaly (25%)
    let volumeAnomalyScore = 0;
    if (quote.avg_volume_20d > 0) {
      const volRatio = quote.volume / quote.avg_volume_20d;
      if (volRatio > 1) {
        volumeAnomalyScore = Math.min(100, (volRatio - 1) * 50); // 3x volume = 100
      }
      if (volRatio > 2) {
        reasons.push(`Volume ${((volRatio - 1) * 100).toFixed(0)}% above 20-day average`);
      }
    }

    // Threshold Breach (20%)
    let thresholdBreachScore = 0;
    if (alerts.above && quote.price >= alerts.above) {
      thresholdBreachScore = 100;
      reasons.push(`Crossed your $${alerts.above} alert`);
    } else if (alerts.below && quote.price <= alerts.below) {
      thresholdBreachScore = 100;
      reasons.push(`Crossed your $${alerts.below} alert`);
    } else if (quote.price >= quote.week_52_high * 0.99) {
      thresholdBreachScore = 100;
      reasons.push(`New 52-week high`);
    } else if (quote.price <= quote.week_52_low * 1.01) {
      thresholdBreachScore = 100;
      reasons.push(`New 52-week low`);
    }

    // Trend Break (15%)
    let trendBreakScore = 0;
    const history = db.prepare(`SELECT close FROM daily_history WHERE symbol = ? ORDER BY date DESC LIMIT 2`).all(symbol) as any[];
    if (history.length >= 2 && quote.sma_20 > 0) {
      const yesterdayClose = history[1].close;
      if (yesterdayClose < quote.sma_20 && quote.price > quote.sma_20) {
        trendBreakScore = 100;
        reasons.push(`Broke above 20-day moving average`);
      } else if (yesterdayClose > quote.sma_20 && quote.price < quote.sma_20) {
        trendBreakScore = 100;
        reasons.push(`Broke below 20-day moving average`);
      }
    }

    // Momentum Shift (10%)
    let momentumShiftScore = 0;
    if (quote.rsi_14 > 70) {
      momentumShiftScore = Math.min(100, Math.abs(quote.rsi_14 - 50) / 50 * 100);
      reasons.push(`RSI at ${quote.rsi_14.toFixed(0)} — overbought territory`);
    } else if (quote.rsi_14 < 30) {
      momentumShiftScore = Math.min(100, Math.abs(quote.rsi_14 - 50) / 50 * 100);
      reasons.push(`RSI at ${quote.rsi_14.toFixed(0)} — oversold territory`);
    }

    const totalScore = (priceVelocityScore * 0.3) + 
                       (volumeAnomalyScore * 0.25) + 
                       (thresholdBreachScore * 0.2) + 
                       (trendBreakScore * 0.15) + 
                       (momentumShiftScore * 0.1);

    let level: 'critical' | 'attention' | 'watch' | 'calm' = 'calm';
    if (totalScore > 80) level = 'critical';
    else if (totalScore > 60) level = 'attention';
    else if (totalScore > 40) level = 'watch';

    return {
      symbol,
      score: Math.round(totalScore),
      level,
      reasons,
      components: {
        priceVelocity: Math.round(priceVelocityScore),
        volumeAnomaly: Math.round(volumeAnomalyScore),
        thresholdBreach: Math.round(thresholdBreachScore),
        trendBreak: Math.round(trendBreakScore),
        momentumShift: Math.round(momentumShiftScore)
      }
    };
  }
}
