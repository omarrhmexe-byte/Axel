import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowLeft } from 'lucide-react';
import { Button } from './Button';

interface NavbarProps {
  variant?: 'landing' | 'dashboard' | 'chat';
  subtitle?: string;
}

export function Navbar({ variant = 'landing', subtitle }: NavbarProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-4">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          <span className="font-extrabold font-display text-stone-900 tracking-tight">Axel</span>
        </Link>

        {/* Centre label on dashboard */}
        {subtitle && (
          <p className="hidden sm:block text-sm text-stone-500 truncate flex-1 text-center">
            {subtitle}
          </p>
        )}

        {/* Right actions */}
        {variant === 'landing' && (
          <Button
            size="sm"
            onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get early access
          </Button>
        )}

        {(variant === 'dashboard' || variant === 'chat') && (
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        )}
      </div>
    </header>
  );
}
