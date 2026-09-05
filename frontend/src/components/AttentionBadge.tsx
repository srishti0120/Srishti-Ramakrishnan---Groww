import { clsx } from 'clsx';
import { getAttentionColor } from '../lib/market-utils';

export function AttentionBadge({ score, level, compact }: { score: number, level: string, compact?: boolean }) {
  if (level === 'calm') {
    return (
      <div className="flex items-center gap-1.5" title={`Score: ${score}`}>
        <div className="w-2 h-2 rounded-full bg-attentionCalm"></div>
        {!compact && <span className="text-xs text-gray-400 font-medium">Calm</span>}
      </div>
    );
  }

  const baseClasses = clsx(
    "inline-flex items-center justify-center font-semibold border rounded-full",
    getAttentionColor(level),
    compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
    level === 'critical' && "animate-pulse-glow"
  );

  const label = level.charAt(0).toUpperCase() + level.slice(1);

  return (
    <div className={baseClasses} title={`Score: ${score}`}>
      {label}
    </div>
  );
}
