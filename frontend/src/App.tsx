import React, { useState } from 'react';

type ToolTarget = 'lovable' | 'claude' | 'replit' | 'generic';

export default function App() {
  const [userPrompt, setUserPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [tool, setTool] = useState<ToolTarget>('lovable');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<{ before: number; after: number; savings: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleOptimize = async () => {
    if (!userPrompt.trim()) return;
    setIsLoading(true);
    setOptimizedPrompt('');

    // Apunta al localhost en desarrollo, o lee la URL de producción configurada en las variables de entorno de Vite
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

try {
      const response = await fetch(`${API_BASE_URL}/api/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt, tool }),
      });

      if (!response.ok) throw new Error('Error al conectar con el servidor optimizador');
      
      const data = await response.json();
      setOptimizedPrompt(data.optimizedPrompt);
      setStats({
        before: data.tokensBefore,
        after: data.tokensAfter,
        savings: data.savings,
      });
    } catch (error) {
      console.error(error);
      alert('Error procesando el prompt. Verifica que el backend esté encendido.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(optimizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 flex flex-col justify-between font-sans">
      <header className="mb-6 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
          ⚡ AI-Thrift <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">Modo Prompt</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Limpia las instrucciones conversacionales y optimiza el consumo de tus créditos.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch flex-1">
        {/* Entrada Humana */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tu Requerimiento Técnico</label>
              <select 
                value={tool} 
                onChange={(e) => setTool(e.target.value as ToolTarget)}
                className="bg-slate-800 border border-slate-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none text-slate-200"
              >
                <option value="lovable">Optimizar para Lovable</option>
                <option value="claude">Optimizar para Claude</option>
                <option value="replit">Optimizar para Replit</option>
                <option value="generic">IA Estándar</option>
              </select>
            </div>
            <textarea
              className="w-full h-64 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500 resize-none text-slate-300 placeholder-slate-600"
              placeholder="Ej: Hola Claude, cómo estás? Quería pedirte por favor si me puedes ayudar a hacer un componente de login limpio con fondo gris oscuro, gracias."
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
            />
          </div>
          <button
            onClick={handleOptimize}
            disabled={isLoading || !userPrompt.trim()}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-150 text-sm"
          >
            {isLoading ? 'Analizando estructura de tokens...' : 'Optimizar Prompt e Inyectar Estructura'}
          </button>
        </div>

        {/* Salida Compilada */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Prompt Comprimido para Producción</label>
              {optimizedPrompt && (
                <button
                  onClick={copyToClipboard}
                  className={`text-xs px-3 py-1.5 rounded border transition-all ${copied ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}
                >
                  {copied ? '¡Copiado!' : 'Copiar Texto'}
                </button>
              )}
            </div>
            <div className="w-full h-64 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm font-mono text-slate-300 overflow-y-auto whitespace-pre-wrap">
              {optimizedPrompt || <span className="text-slate-600 italic text-xs">El resultado pulido aparecerá aquí listo para pegarse en tu herramienta de IA...</span>}
            </div>
          </div>

          {stats && (
            <div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg flex justify-around text-center">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Tokens Entrada</span>
                <span className="text-base font-bold text-slate-400">{stats.before}</span>
              </div>
              <div className="border-l border-slate-800"></div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Tokens Salida</span>
                <span className="text-base font-bold text-emerald-400">{stats.after}</span>
              </div>
              <div className="border-l border-slate-800"></div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Ahorro Real</span>
                <span className="text-base font-bold text-emerald-400">~{stats.savings}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-6 text-center text-[11px] text-slate-600 border-t border-slate-900 pt-4">
        AI-Thrift Utility App • Herramienta de optimización de costes y microingeniería de prompts.
      </footer>
    </div>
  );
}