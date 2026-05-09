/**
 * AppShell — minimal layout wrapper for the operator UI.
 * All /app/* pages render inside this.
 */
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus }   from 'lucide-react';

interface AppShellProps {
  children:    React.ReactNode;
  back?:       { label: string; to: string };
  title?:      string;
  subtitle?:   string;
  action?:     React.ReactNode;
}

export function AppShell({ children, back, title, subtitle, action }: AppShellProps) {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-stone-800 px-6 py-3 flex items-center gap-4 shrink-0">
        {back ? (
          <Link
            to={back.to}
            className="flex items-center gap-1.5 text-stone-500 hover:text-stone-300 text-sm transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {back.label}
          </Link>
        ) : (
          <Link to="/app/new" className="text-[11px] font-mono font-bold tracking-widest text-stone-400 hover:text-white transition-colors">
            AXEL
          </Link>
        )}

        {title && (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-stone-700">·</span>
            <span className="text-sm text-stone-300 font-medium">{title}</span>
            {subtitle && <span className="text-xs text-stone-600">{subtitle}</span>}
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          {action}
          <Link
            to="/app/new"
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-300 px-2 py-1 rounded border border-stone-800 hover:border-stone-600 transition-all"
          >
            <Plus className="w-3 h-3" />
            New run
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
