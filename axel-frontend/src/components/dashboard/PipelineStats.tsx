import { Users, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import type { PipelineRunResponse, ConfidencePipeline } from '../../types';
import { pluralise } from '../../lib/utils';

interface Props {
  run:      PipelineRunResponse;
  pipeline: ConfidencePipeline | null;
}

export function PipelineStats({ run, pipeline }: Props) {
  const total   = (pipeline?.high?.length ?? 0) +
                  (pipeline?.medium?.length ?? 0) +
                  (pipeline?.low?.length ?? 0);
  const high    = pipeline?.high?.length ?? 0;
  const sourced = run.system_log?.find((s) => s.step === 'candidate_upsert')?.meta?.['count'] as number | undefined;

  const stats = [
    { Icon: Users,         label: 'Sourced',        value: sourced ?? '–',  color: 'text-stone-700' },
    { Icon: Sparkles,      label: 'Matched',         value: total,           color: 'text-indigo-600' },
    { Icon: CheckCircle2,  label: 'High Signal',     value: high,            color: 'text-emerald-600' },
  ];

  return (
    <div className="flex items-center gap-6 flex-wrap">
      {stats.map(({ Icon, label, value, color }) => (
        <div key={label} className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className={`text-sm font-semibold ${color}`}>{value}</span>
          <span className="text-sm text-stone-400">{label}</span>
        </div>
      ))}

      {run.status === 'failed' && (
        <div className="flex items-center gap-1.5 text-rose-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          {run.error ?? 'Pipeline failed'}
        </div>
      )}
    </div>
  );
}
