export interface PulseData {
  marketStatus: 'open' | 'closed' | 'pre-market' | 'after-hours';
  lastUpdated: string;
  items: PulseItem[];
  summary: PulseSummary;
}

export interface PulseItem {
  symbol: string;
  companyName: string;
  price: number;
  previousClose: number;
  dayChange: number;
  dayChangePercent: number;
  changeSinceLastSeen: {
    price: number;
    percent: number;
    lastSeenAt: string;
  } | null;
  attention: {
    score: number;
    level: 'critical' | 'attention' | 'watch' | 'calm';
    reasons: string[];
    components: Record<string, number>;
  };
  indicators: {
    sma20: number;
    rsi14: number;
    atr14: number;
  };
  quote: {
    high: number;
    low: number;
    volume: number;
    avgVolume: number;
    week52High: number;
    week52Low: number;
    marketCap: number;
  };
  alerts: {
    above: number | null;
    below: number | null;
  };
  notes: string | null;
}

export interface PulseSummary {
  totalItems: number;
  needsAttention: number;
  biggestMover: { symbol: string; changePercent: number } | null;
}

export interface Watchlist {
  id: string;
  name: string;
  itemCount: number;
}

export interface SearchResult {
  symbol: string;
  companyName: string;
}
