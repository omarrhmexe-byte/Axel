import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const LINKS = {
  Product: [
    { label: 'Workflow',   href: '/workflow'   },
    { label: 'Advisory',   href: '/advisory'   },
    { label: 'Philosophy', href: '/philosophy' },
  ],
  Company: [
    { label: 'Get access',  href: '/access' },
    { label: 'Contact',     href: 'mailto:hello@axelhq.com' },
  ],
} as const;

export function SiteFooter() {
  return (
    <footer className="bg-[#1C1917] text-stone-400">
      <div className="max-w-screen-xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-axel-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-extrabold font-display text-white text-lg tracking-tight">Axel</span>
            </Link>
            <p className="text-sm text-stone-500 leading-relaxed max-w-xs">
              Hiring is a context problem.
              <br />
              Axel is built around that.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-600 mb-4">
                {group}
              </p>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    {href.startsWith('/') ? (
                      <Link
                        to={href}
                        className="text-sm text-stone-500 hover:text-white transition-colors"
                      >
                        {label}
                      </Link>
                    ) : (
                      <a
                        href={href}
                        className="text-sm text-stone-500 hover:text-white transition-colors"
                      >
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-stone-800 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-stone-600">© {new Date().getFullYear()} Axel. All rights reserved.</p>
          <p className="text-xs text-stone-700">
            Hiring should move careers forward.
          </p>
        </div>
      </div>
    </footer>
  );
}
