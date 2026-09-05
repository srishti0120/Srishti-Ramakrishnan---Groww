import { useState } from 'react'
import { useUser } from './hooks/useUser'
import { PulseDashboard } from './components/PulseDashboard'
import { Activity } from 'lucide-react'

function App() {
  const { userId, isLoading } = useUser();
  const [activeWatchlistId, setActiveWatchlistId] = useState<string | null>(null);

  if (isLoading || !userId) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
        <Activity className="w-12 h-12 text-blue-500 animate-pulse mb-4" />
        <h1 className="text-xl font-bold text-white tracking-widest uppercase">Pulse</h1>
        <p className="text-gray-500 text-sm mt-2">Initializing your workspace...</p>
      </div>
    );
  }

  return (
    <PulseDashboard 
      userId={userId} 
      activeWatchlistId={activeWatchlistId || ''} 
      onWatchlistChange={setActiveWatchlistId}
    />
  )
}

export default App
