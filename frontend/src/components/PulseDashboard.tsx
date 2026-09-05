import { useState } from 'react';
import { MarketStatusBar } from './MarketStatusBar';
import { StockCard } from './StockCard';
import { AddStockDialog } from './AddStockDialog';
import { EditItemDialog } from './EditItemDialog';
import { WatchlistManager } from './WatchlistManager';
import { usePulse } from '../hooks/usePulse';
import { PulseItem } from '../types';
import { AlertCircle, Plus, Info } from 'lucide-react';
import { formatPercent } from '../lib/market-utils';

interface PulseDashboardProps {
  userId: string;
  activeWatchlistId: string;
  onWatchlistChange: (id: string) => void;
}

export function PulseDashboard({ userId, activeWatchlistId, onWatchlistChange }: PulseDashboardProps) {
  const { data, isLoading, error, refresh } = usePulse(userId);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PulseItem | null>(null);

  const handleRemove = async (symbol: string) => {
    try {
      const { api } = await import('../lib/api');
      await api.removeItem(activeWatchlistId, symbol);
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading Pulse...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
        <p className="text-gray-400 mb-6 max-w-md">Could not connect to the Pulse backend. Ensure the server is running on port 3001.</p>
        <button onClick={() => refresh()} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Retry Connection
        </button>
      </div>
    );
  }

  if (!data) return null;

  const attentionItems = data.items.filter(item => item.attention.score > 40).sort((a, b) => b.attention.score - a.attention.score);
  const calmItems = data.items.filter(item => item.attention.score <= 40).sort((a, b) => b.attention.score - a.attention.score);

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <MarketStatusBar 
        status={data.marketStatus as any} 
        lastUpdated={data.lastUpdated} 
        onRefresh={refresh}
      />

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-8">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-white tracking-tight">Your Dashboard</h1>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none">
              <WatchlistManager 
                userId={userId} 
                activeId={activeWatchlistId} 
                onSelect={onWatchlistChange} 
              />
            </div>
            <button 
              onClick={() => setIsAddOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Empty State */}
        {data.items.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center max-w-2xl mx-auto mt-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Watchlist is Empty</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Add your first stock to start tracking its movements. Pulse will alert you when it needs your attention.
            </p>
            <button 
              onClick={() => setIsAddOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold text-lg transition-colors shadow-xl shadow-blue-900/20"
            >
              Add Your First Stock
            </button>
          </div>
        ) : (
          <>
            {/* Summary Banner */}
            {data.summary.needsAttention > 0 && (
              <div className="bg-gradient-to-r from-orange-950/40 to-gray-900 border border-orange-900/30 rounded-xl p-4 flex gap-4 items-start">
                <Info className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Welcome back!</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <strong className="text-white">{data.summary.needsAttention} stocks</strong> need your attention. 
                    {data.summary.biggestMover && (
                      <span> <strong>{data.summary.biggestMover.symbol}</strong> is the biggest mover ({formatPercent(data.summary.biggestMover.changePercent)}).</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Needs Attention Section */}
            {attentionItems.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-bold text-orange-500 flex items-center gap-2 border-b border-gray-800 pb-2">
                  Needs Attention <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full text-xs">{attentionItems.length}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attentionItems.map(item => (
                    <StockCard key={item.symbol} item={item} onRemove={handleRemove} onEdit={setEditingItem} />
                  ))}
                </div>
              </section>
            )}

            {/* All Quiet Section */}
            {calmItems.length > 0 && (
              <section className="space-y-4 mt-8">
                <h2 className="text-lg font-bold text-gray-400 flex items-center gap-2 border-b border-gray-800 pb-2">
                  All Quiet <span className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full text-xs">{calmItems.length}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-80 hover:opacity-100 transition-opacity">
                  {calmItems.map(item => (
                    <StockCard key={item.symbol} item={item} onRemove={handleRemove} onEdit={setEditingItem} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <AddStockDialog 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        watchlistId={activeWatchlistId}
        userId={userId}
        onAdded={refresh}
      />

      <EditItemDialog
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        watchlistId={activeWatchlistId}
        onUpdated={refresh}
      />
    </div>
  );
}
