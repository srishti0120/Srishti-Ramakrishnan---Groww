import { Activity, RefreshCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { formatTimeAgo } from '../lib/market-utils';

interface MarketStatusBarProps {
  status: 'open' | 'closed' | 'pre-market' | 'after-hours';
  lastUpdated?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function MarketStatusBar({ status, lastUpdated, isRefreshing, onRefresh }: MarketStatusBarProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'open': return 'bg-green-500';
      case 'pre-market':
      case 'after-hours': return 'bg-yellow-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'open': return 'Market Open';
      case 'pre-market': return 'Pre-Market';
      case 'after-hours': return 'After Hours';
      case 'closed': return 'Market Closed';
      default: return 'Unknown';
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 w-full px-4 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Activity className="text-blue-500 w-5 h-5" />
        <span className="font-bold text-lg tracking-tight">Pulse</span>
      </div>

      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 border border-gray-800">
        <div className={clsx("w-2 h-2 rounded-full", getStatusColor())} />
        <span className="text-xs font-medium text-gray-300">{getStatusText()}</span>
      </div>

      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="text-xs text-gray-500 hidden sm:inline">
            Updated {formatTimeAgo(lastUpdated)}
          </span>
        )}
        <button 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
        >
          <RefreshCcw className={clsx("w-4 h-4", isRefreshing && "animate-spin")} />
        </button>
      </div>
    </div>
  );
}
