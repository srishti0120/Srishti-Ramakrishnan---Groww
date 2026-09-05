import { useState, useEffect } from 'react';
import { Search, X, Loader2, Plus } from 'lucide-react';
import { api } from '../lib/api';
import { SearchResult } from '../types';

interface AddStockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistId: string;
  userId?: string;
  onAdded: () => void;
}

export function AddStockDialog({ isOpen, onClose, watchlistId, userId, onAdded }: AddStockDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  
  const [alertAbove, setAlertAbove] = useState('');
  const [alertBelow, setAlertBelow] = useState('');
  const [notes, setNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.searchSymbols(query);
        const list = Array.isArray(res) ? res : (res?.results || []);
        setResults(list.map((item: any) => ({
          symbol: item.symbol,
          companyName: item.companyName || item.name || item.symbol
        })));
      } catch (e) {
        console.error(e);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  if (!isOpen) return null;

  const handleAdd = async () => {
    if (!selected) return;
    setIsAdding(true);
    try {
      let targetWlId = watchlistId;
      if (!targetWlId && userId) {
        const wls = await api.getWatchlists(userId);
        if (wls && wls.length > 0) {
          targetWlId = wls[0].id;
        }
      }

      if (!targetWlId) {
        throw new Error("No active watchlist found");
      }

      await api.addItem(targetWlId, {
        symbol: selected.symbol,
        alertAbove: alertAbove ? parseFloat(alertAbove) : undefined,
        alertBelow: alertBelow ? parseFloat(alertBelow) : undefined,
        notes: notes || undefined
      });
      onAdded();
      onClose();
      // Reset state
      setSelected(null);
      setQuery('');
      setAlertAbove('');
      setAlertBelow('');
      setNotes('');
    } catch (e) {
      console.error(e);
      alert("Failed to add stock.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <h2 className="text-lg font-bold text-white">Add to Watchlist</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto custom-scrollbar">
          {!selected ? (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search symbol or company..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  autoFocus
                />
                {isSearching && <Loader2 className="absolute right-3 top-3 w-5 h-5 text-gray-500 animate-spin" />}
              </div>

              {results.length > 0 && (
                <div className="space-y-1">
                  {results.map((res) => (
                    <button
                      key={res.symbol}
                      onClick={() => setSelected(res)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 text-left transition-colors"
                    >
                      <div>
                        <div className="font-bold text-white">{res.symbol}</div>
                        <div className="text-sm text-gray-400 truncate">{res.companyName}</div>
                      </div>
                      <Plus className="w-5 h-5 text-gray-500" />
                    </button>
                  ))}
                </div>
              )}
              
              {query && !isSearching && results.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No symbols found for "{query}"
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-gray-800/50 rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-bold text-lg text-white">{selected.symbol}</div>
                  <div className="text-sm text-gray-400">{selected.companyName}</div>
                </div>
                <button onClick={() => setSelected(null)} className="text-sm text-blue-400 hover:text-blue-300">
                  Change
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-300">Alerts & Notes (Optional)</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Alert Above Price</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 150.00"
                      value={alertAbove}
                      onChange={(e) => setAlertAbove(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Alert Below Price</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 140.00"
                      value={alertBelow}
                      onChange={(e) => setAlertBelow(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Why are you watching this?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {selected && (
          <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex gap-3">
            <button
              onClick={() => setSelected(null)}
              className="flex-1 py-2.5 px-4 rounded-lg font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleAdd}
              disabled={isAdding}
              className="flex-1 py-2.5 px-4 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add to Watchlist'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
