"use client";

interface NavbarProps {
  backendOnline: boolean | null;
  onRefreshHealth?: () => void;
}

export function Navbar({ backendOnline, onRefreshHealth }: NavbarProps) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20">
            P
          </div>
          <div>
            <h1 className="font-bold text-lg text-white leading-tight">PERN Stack Studio</h1>
            <p className="text-xs text-slate-400">PostgreSQL • Express • React • Node</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefreshHealth}
            title="Click to recheck API connection"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              backendOnline === true
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/60"
                : backendOnline === false
                ? "bg-rose-950/40 border-rose-500/40 text-rose-400 hover:bg-rose-950/60"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline === true
                  ? "bg-emerald-400 animate-pulse"
                  : backendOnline === false
                  ? "bg-rose-400"
                  : "bg-slate-400"
              }`}
            />
            <span>
              {backendOnline
                ? "API Live (Port 5000)"
                : backendOnline === false
                ? "API Disconnected"
                : "Checking API..."}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
