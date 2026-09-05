import { useState, useEffect } from 'react';
import { List, Plus, Trash2, ChevronDown, X } from 'lucide-react';
import { api } from '../lib/api';
import { Watchlist } from '../types';
import { clsx } from 'clsx';

interface WatchlistManagerProps {
  userId: string;
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function WatchlistManager({ userId, activeId, onSelect }: WatchlistManagerProps) {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchWatchlists();
  }, [userId]);

  const fetchWatchlists = async () => {
    try {
      const data = await api.getWatchlists(userId);
      setWatchlists(data);
      if (data.length > 0 && !activeId) {
        onSelect(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await api.createWatchlist(userId, newName.trim());
      setNewName('');
      setIsCreating(false);
      await fetchWatchlists();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (watchlists.length <= 1) {
      alert("You cannot delete your last watchlist.");
      return;
    }
    if (confirm("Delete this watchlist?")) {
      try {
        await api.deleteWatchlist(id);
        if (activeId === id) {
          const next = watchlists.find(w => w.id !== id);
          if (next) onSelect(next.id);
        }
        await fetchWatchlists();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const activeWatchlist = watchlists.find(w => w.id === activeId) || watchlists[0];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
      >
        <List className="w-4 h-4 text-gray-400" />
        <span className="text-white truncate max-w-[150px]">{activeWatchlist?.name || 'Loading...'}</span>
        <ChevronDown className="w-4 h-4 text-gray-500 ml-2" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-40 overflow-hidden">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1.5 mb-1">
                Your Watchlists
              </div>
              
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {watchlists.map(w => (
                  <div
                    key={w.id}
                    onClick={() => {
                      onSelect(w.id);
                      setIsOpen(false);
                    }}
                    className={clsx(
                      "group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors",
                      w.id === activeId ? "bg-blue-600/10 text-blue-400" : "hover:bg-gray-800 text-gray-300"
                    )}
                  >
                    <div className="truncate pr-2 flex-1">
                      {w.name} <span className="text-xs text-gray-500 ml-1">({w.itemCount})</span>
                    </div>
                    {watchlists.length > 1 && (
                      <button 
                        onClick={(e) => handleDelete(w.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-gray-800">
                {isCreating ? (
                  <div className="flex items-center gap-2 px-2">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Name..."
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                      className="flex-1 bg-gray-950 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    <button onClick={handleCreate} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1.5 rounded font-medium">Save</button>
                    <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-white p-1"><X className="w-4 h-4"/></button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsCreating(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Watchlist
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
