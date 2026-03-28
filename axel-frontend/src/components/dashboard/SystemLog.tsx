import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import type { WorkflowStep } from '../../types';
import { timeAgo } from '../../lib/utils';

function StepIcon({ status }: { status: WorkflowStep['status'] }) {
  if (status === 'done') {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20 }}
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
      </motion.div>
    );
  }
  if (status === 'error') {
    return (
      <motion.div
        initial={{ rotate: 15 }}
        animate={{ rotate: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20 }}
      >
        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
      </motion.div>
    );
  }
  if (status === 'running') {
    return <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />;
  }
  return <Clock className="w-4 h-4 text-stone-300 shrink-0" />;
}

interface Props {
  steps: WorkflowStep[];
}

export function SystemLog({ steps }: Props) {
  return (
    <div className="font-mono text-[11px]">
      {steps.map((step, i) => (
        <motion.div
          key={`${step.step}-${i}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15, type: 'spring', stiffness: 280, damping: 28 }}
          className={`flex items-start gap-3 px-4 py-2.5 ${i !== steps.length - 1 ? 'border-b border-stone-100' : ''
            }`}
        >
          <StepIcon status={step.status} />

          <div className="flex-1 min-w-0">
            <span className="text-stone-500 mr-2">{step.step}</span>
            <span className="text-stone-800">{step.message}</span>
          </div>

          <time
            className="text-stone-400 shrink-0 tabular-nums"
            dateTime={step.timestamp}
          >
            {timeAgo(step.timestamp)}
          </time>
        </motion.div>
      ))}
    </div>
  );
}
