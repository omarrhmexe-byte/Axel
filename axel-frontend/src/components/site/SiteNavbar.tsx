import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Workflow',   href: '/workflow'   },
  { label: 'Advisory',   href: '/advisory'   },
  { label: 'Philosophy', href: '/philosophy' },
] as const;

// Hero height threshold — past the dark hero, switch to light navbar
const HERO_THRESHOLD = 80;

export function SiteNavbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [pastHero, setPastHero]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 16);
      setPastHero(window.scrollY > HERO_THRESHOLD);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // On home page: dark transparent until past hero, then white
  const dark = isHome && !pastHero;

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md transition-all duration-300 ${
        dark
          ? `bg-[#0D0C0B]/80 border-b border-white/[0.06] ${scrolled ? '' : ''}`
          : `bg-white/95 ${scrolled ? 'shadow-sm border-b border-stone-200/60' : 'border-b border-transparent'}`
      }`}
    >
      <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between gap-8">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 bg-axel-500 rounded-lg flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className={`font-extrabold font-display text-lg tracking-tight transition-colors ${dark ? 'text-white' : 'text-axel-ink'}`}>
            Axel
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {NAV_LINKS.map(({ label, href }) => {
            const active = location.pathname.startsWith(href);
            return (
              <Link
                key={href}
                to={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dark
                    ? active
                      ? 'text-white bg-white/10'
                      : 'text-white/50 hover:text-white hover:bg-white/8'
                    : active
                      ? 'text-axel-500 bg-axel-50'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Link
            to="/access"
            className={`hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              dark
                ? 'border border-white/20 text-white/70 hover:text-white hover:border-white/40'
                : 'bg-axel-500 text-white hover:bg-axel-600'
            }`}
          >
            Get access
          </Link>
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${dark ? 'text-white/60 hover:bg-white/10' : 'text-stone-600 hover:bg-stone-100'}`}
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="md:hidden overflow-hidden border-t border-stone-100 bg-white"
          >
            <nav className="px-6 py-4 space-y-1">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  to={href}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  {label}
                </Link>
              ))}
              <Link
                to="/access"
                className="block mt-2 px-4 py-2.5 rounded-lg bg-axel-500 text-white text-sm font-semibold text-center"
              >
                Get access
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
