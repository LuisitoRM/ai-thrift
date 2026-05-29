import React, { useState } from 'react';

export default function App() {
  const [userPrompt, setUserPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOptimize = async () => {
    setIsLoading(true);
    // Cambia esta URL por la tuya de Vercel
    const API_URL = 'https://ai-thrift-six.vercel.app/api/optimize';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt, tool: 'lovable' }),
      });
      const data = await response.json();
      setOptimizedPrompt(data.optimizedPrompt);
      setStats(data);
    } catch (e) {
      alert("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 bg-slate-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold text-emerald-400">⚡ AI-Thrift</h1>
      <textarea 
        className="w-full mt-4 p-4 bg-slate-900 border border-slate-800 rounded"
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
        placeholder="Escribe tu prompt aquí..."
      />
      <button 
        onClick={handleOptimize}
        className="w-full mt-4 bg-emerald-600 p-2 rounded font-bold"
        disabled={isLoading}
      >
        {isLoading ? 'Optimizando...' : 'Optimizar'}
      </button>
      {optimizedPrompt && (
        <div className="mt-8 p-4 bg-slate-900 rounded border border-emerald-500/30">
          <p className="text-emerald-400 font-mono">{optimizedPrompt}</p>
          {stats && <p className="mt-2 text-xs text-slate-500">Ahorro: {stats.savings}%</p>}
        </div>
      )}
    </div>
  );
}
