import { formatDistanceToNow } from 'date-fns';

export function isMarketOpen(): boolean {
  const now = new Date();
  const day = now.getUTCDay(); // 0 is Sunday, 1 is Monday...
  if (day === 0 || day === 6) return false;
  
  // US Eastern Time offset is UTC-4 or UTC-5 (simplification, not handling daylight savings perfectly here)
  // 9:30 AM ET = 13:30 or 14:30 UTC
  // We'll return a mock true for now to make it easy to develop
  return true;
}

export function getMarketStatus(): 'open' | 'closed' | 'pre-market' | 'after-hours' {
  // Simplified logic
  const now = new Date();
  const hours = now.getHours();
  if (hours >= 9 && hours < 16) return 'open';
  if (hours >= 4 && hours < 9) return 'pre-market';
  if (hours >= 16 && hours < 20) return 'after-hours';
  return 'closed';
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatLargeNumber(value: number): string {
  if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
  return value.toString();
}

export function formatTimeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getAttentionColor(level: string): string {
  switch (level) {
    case 'critical': return 'text-attentionCritical bg-attentionCritical/10 border-attentionCritical';
    case 'attention': return 'text-attentionAlert bg-attentionAlert/10 border-attentionAlert';
    case 'watch': return 'text-attentionWatch bg-attentionWatch/10 border-attentionWatch';
    case 'calm': return 'text-attentionCalm bg-attentionCalm/10 border-attentionCalm';
    default: return 'text-gray-400 bg-gray-800 border-gray-700';
  }
}

export function getChangeColor(change: number): string {
  if (change > 0) return 'text-attentionCalm';
  if (change < 0) return 'text-attentionCritical';
  return 'text-gray-400';
}
