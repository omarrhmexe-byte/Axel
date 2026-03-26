import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white border-t border-stone-200">
      <div className="max-w-screen-xl mx-auto px-6 py-8 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" fill="white" />
          </div>
          <span className="font-extrabold font-display text-stone-900">Axel</span>
        </Link>
        <p className="text-xs text-stone-400">© {new Date().getFullYear()} Axel</p>
      </div>
    </footer>
  );
}
