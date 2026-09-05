import { Settings, X, TrendingUp, TrendingDown, Bell } from 'lucide-react';
import { clsx } from 'clsx';
import { PulseItem } from '../types';
import { AttentionBadge } from './AttentionBadge';
import { formatCurrency, formatPercent, formatLargeNumber, formatTimeAgo, getChangeColor } from '../lib/market-utils';
import { useState } from 'react';

interface StockCardProps {
  item: PulseItem;
  onRemove: (symbol: string) => void;
  onEdit: (item: PulseItem) => void;
}

export function StockCard({ item, onRemove, onEdit }: StockCardProps) {
  const isUp = item.dayChange >= 0;
  const [showConfirm, setShowConfirm] = useState(false);

  const getBorderColor = () => {
    switch(item.attention.level) {
      case 'critical': return 'border-l-attentionCritical border-attentionCritical/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
      case 'attention': return 'border-l-attentionAlert border-gray-800';
      case 'watch': return 'border-l-attentionWatch border-gray-800';
      case 'calm': return 'border-l-attentionCalm border-gray-800/50';
      default: return 'border-gray-800';
    }
  };

  return (
    <div className={clsx(
      "group relative bg-gray-900 rounded-xl overflow-hidden border-y border-r border-l-4 transition-all hover:bg-gray-800/80",
      getBorderColor()
    )}>
      <div className="p-4 sm:p-5">
        {/* Top Header */}
        <div className="flex justify-between items-start mb-3">
          <AttentionBadge score={item.attention.score} level={item.attention.level} />
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(item)} className="p-1.5 text-gray-500 hover:text-white rounded hover:bg-gray-700">
              <Settings className="w-4 h-4" />
            </button>
            {showConfirm ? (
              <div className="flex items-center gap-2 bg-red-950/50 rounded px-2 py-1">
                <span className="text-xs text-red-400">Remove?</span>
                <button onClick={() => onRemove(item.symbol)} className="text-xs font-bold text-white hover:text-red-300">Yes</button>
                <button onClick={() => setShowConfirm(false)} className="text-xs text-gray-400 hover:text-white">No</button>
              </div>
            ) : (
              <button onClick={() => setShowConfirm(true)} className="p-1.5 text-gray-500 hover:text-red-400 rounded hover:bg-gray-700">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Main Price & Symbol */}
        <div className="flex justify-between items-baseline mb-4">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {item.symbol}
              {(item.alerts.above || item.alerts.below || item.notes) && (
                <Bell className="w-4 h-4 text-gray-500" />
              )}
            </h3>
            <p className="text-sm text-gray-400 truncate max-w-[200px]">{item.companyName}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{formatCurrency(item.price)}</div>
            <div className={clsx("flex items-center justify-end gap-1 text-sm font-medium", getChangeColor(item.dayChange))}>
              {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isUp ? '+' : ''}{formatCurrency(item.dayChange)} ({formatPercent(item.dayChangePercent)})
            </div>
          </div>
        </div>

        {/* Since Last Seen */}
        {item.changeSinceLastSeen && (
          <div className="mb-4 py-2 px-3 rounded-lg bg-gray-950/50 border border-gray-800 text-sm flex justify-between items-center">
            <span className="text-gray-400">Since {formatTimeAgo(item.changeSinceLastSeen.lastSeenAt)}</span>
            <span className={clsx("font-medium", getChangeColor(item.changeSinceLastSeen.price))}>
              {item.changeSinceLastSeen.price > 0 ? '+' : ''}
              {formatCurrency(item.changeSinceLastSeen.price)} ({formatPercent(item.changeSinceLastSeen.percent)})
            </span>
          </div>
        )}

        {/* Attention Reasons */}
        {item.attention.score > 40 && item.attention.reasons.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Why it needs attention</h4>
            <ul className="space-y-1">
              {item.attention.reasons.map((reason, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-gray-500 mt-0.5">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer Metrics */}
        <div className="pt-3 mt-auto border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
          <div className="flex gap-4">
            <span title="Volume / Avg Volume">Vol: {formatLargeNumber(item.quote.volume)}</span>
            <span title="Relative Strength Index">RSI: {item.indicators.rsi14.toFixed(0)}</span>
          </div>
          <span title="52 Week Range" className="hidden sm:inline">
            52W: {formatCurrency(item.quote.week52Low)} - {formatCurrency(item.quote.week52High)}
          </span>
        </div>
      </div>
    </div>
  );
}
