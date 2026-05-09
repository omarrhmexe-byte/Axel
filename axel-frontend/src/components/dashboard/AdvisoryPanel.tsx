import { Lightbulb, Star, TrendingUp, HelpCircle } from 'lucide-react';
import type { AdvisoryOutput } from '../../types';

interface AdvisoryPanelProps {
  advisory: AdvisoryOutput;
}

interface SectionProps {
  Icon:  React.ElementType;
  color: string;
  title: string;
  items: string[];
}

function AdvisorySection({ Icon, color, title, items }: SectionProps) {
  if (!items?.length) return null;
  return (
    <div>
      <div className={`flex items-center gap-2 mb-2.5`}>
        <div className={`w-6 h-6 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">{title}</p>
      </div>
      <ul className="space-y-1.5 pl-8">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-stone-700 flex items-start gap-2">
            <span className="text-stone-300 mt-0.5 shrink-0">·</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdvisoryPanel({ advisory }: AdvisoryPanelProps) {
  return (
    <div className="space-y-5">
      {/* Why interesting */}
      <AdvisorySection
        Icon={Star}
        color="bg-amber-500"
        title="Why Interesting"
        items={advisory.why_interesting}
      />

      {/* Risk / Unknown */}
      <AdvisorySection
        Icon={HelpCircle}
        color="bg-rose-500"
        title="Risk / Unknown"
        items={advisory.risk_unknown}
      />

      {/* Trajectory */}
      <AdvisorySection
        Icon={TrendingUp}
        color="bg-sky-500"
        title="Trajectory"
        items={advisory.trajectory}
      />

      {/* Question to ask */}
      {advisory.question_to_ask && (
        <div className="bg-stone-50/60 rounded-lg p-3.5 border-l-2 border-amber-400">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1.5">
            Ask Before You Call
          </p>
          <p className="text-sm text-stone-700 leading-relaxed">
            {advisory.question_to_ask}
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-stone-400 pt-2 border-t border-stone-100">
        <Lightbulb className="w-3 h-3 inline mr-1 mb-0.5" />
        Axel surfaces signals only. All hiring decisions belong to you.
      </p>
    </div>
  );
}
