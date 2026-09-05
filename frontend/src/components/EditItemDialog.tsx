import { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { api } from '../lib/api';
import { PulseItem } from '../types';

interface EditItemDialogProps {
  item: PulseItem | null;
  isOpen: boolean;
  onClose: () => void;
  watchlistId: string;
  onUpdated: () => void;
}

export function EditItemDialog({ item, isOpen, onClose, watchlistId, onUpdated }: EditItemDialogProps) {
  const [alertAbove, setAlertAbove] = useState('');
  const [alertBelow, setAlertBelow] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setAlertAbove(item.alerts.above ? item.alerts.above.toString() : '');
      setAlertBelow(item.alerts.below ? item.alerts.below.toString() : '');
      setNotes(item.notes || '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateItem(watchlistId, item.symbol, {
        alertAbove: alertAbove ? parseFloat(alertAbove) : null,
        alertBelow: alertBelow ? parseFloat(alertBelow) : null,
        notes: notes || null
      });
      onUpdated();
      onClose();
    } catch (e) {
      console.error(e);
      alert("Failed to update item.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <h2 className="text-lg font-bold text-white">Edit {item.symbol} Settings</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="font-bold text-lg text-white">{item.symbol}</div>
            <div className="text-sm text-gray-400">{item.companyName}</div>
          </div>

          <div className="space-y-3">
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

        <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-lg font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-2.5 px-4 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}
