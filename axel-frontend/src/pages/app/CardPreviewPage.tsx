/**
 * CardPreviewPage — /app/preview
 * Visual preview of CandidateTile + SignalDrawer with mock data.
 * Development only — remove or gate behind env flag before production.
 */

import { useState }         from 'react';
import { AnimatePresence }  from 'framer-motion';
import { AppShell }         from '../../components/app/AppShell';
import { CandidateTile }    from '../../components/app/CandidateTile';
import { SignalDrawer }     from '../../components/app/SignalDrawer';
import type { PipelineCandidate } from '../../types';
import type { CandidateStage }    from '../../hooks/useStageStore';

const MOCK_CANDIDATES: PipelineCandidate[] = [
  {
    candidate_id:   'mock-1',
    candidate_name: 'Arjun Mehta',
    summary:        'Led zero-downtime payments infrastructure migration at Razorpay. Owns architecture, not just code.',
    alignment:      'strong_alignment',
    confidence:     'high',
    match_reasons:  [
      'Led distributed systems work at production scale at Razorpay',
      'Owns infra architecture decisions — not just execution',
      'Has shipped payments infrastructure with strict uptime requirements',
    ],
    concerns: [
      'Only 5 years of experience — limited context on team leadership at scale',
    ],
    motivation_signals: ['Infra ownership', 'Distributed systems', 'Go', 'Zero-to-one builds'],
    value_signals: [
      'Built settlement layer handling ₹500Cr+ daily volume',
      'Reduced p99 latency by 60% through async redesign',
      'Wrote 5 postmortems — thinks in failure modes',
    ],
    source: 'github',
    derived_signals: {
      primary_languages:    ['Go', 'Python'],
      repo_complexity:      'high',
      open_source_activity: 'active',
      backend_experience:   true,
    },
    card: {
      name:      'Arjun Mehta',
      headline:  'Senior Backend Engineer · Razorpay',
      alignment: 'strong_alignment',
      sections: {
        alignment: [
          'Led distributed systems migration at production scale',
          'Owns architecture decisions, not just execution',
          'Deep payments domain knowledge',
        ],
        experience: ['Go', 'Distributed Systems', 'Kafka', 'PostgreSQL', 'gRPC'],
        motivation: ['Infra ownership', 'System design at scale'],
        value: [
          'Built settlement layer at Razorpay — ₹500Cr+ daily',
          'Reduced p99 latency by 60%',
          'Deep postmortem culture — thinks in failure modes',
        ],
        risks: ['Limited team leadership context at this scale'],
      },
    },
    advisory: {
      why_interesting: [
        'Owns the settlement layer at Razorpay — not a contributor, the architect. That is rare at 5 years.',
        'Wrote 5 postmortems — signals he thinks in failure modes, not just happy paths.',
        'Zero-downtime migration means he can execute hard infrastructure changes without burning the business.',
      ],
      risk_unknown: [
        'No evidence of leading other engineers. He may be an exceptional IC who struggles with technical leadership.',
      ],
      trajectory: [
        'Moving from strong IC toward system ownership — wants to define the approach, not just execute it.',
        'Likely thrives in environments where he has a clear technical mandate and low bureaucracy.',
        'May disengage if constrained to execution-only work with no architectural ownership.',
      ],
      question_to_ask:
        'What is the one decision you made at Razorpay that you would change if you could start over — and what would you do differently?',
    },
  },
  {
    candidate_id:   'mock-2',
    candidate_name: 'Priya Venkat',
    summary:        'Built subscription billing engine at Chargebee from zero. Strong on product-aware backend.',
    alignment:      'moderate_alignment',
    confidence:     'medium',
    match_reasons:  [
      'Built billing engine from scratch — knows what zero-to-one feels like',
      'PostgreSQL and Redis depth is directly relevant',
    ],
    concerns: [
      'Chargebee context is more product-backend than infra-backend',
      'No Go experience — stack mismatch',
    ],
    motivation_signals: ['Zero-to-one builds', 'Product backend', 'Reliability'],
    value_signals: [
      'Subscription billing engine — zero to production',
      'Latency optimization — p99 from 800ms to 320ms',
    ],
    source: 'db',
    card: {
      name:      'Priya Venkat',
      headline:  'Backend Engineer · Chargebee',
      alignment: 'moderate_alignment',
      sections: {
        alignment: [
          'Built billing engine from zero — knows ownership',
          'Database optimisation depth is real',
        ],
        experience: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Kubernetes'],
        motivation: ['Zero-to-one builds', 'Reliability'],
        value: ['Built subscription billing from scratch', 'Reduced p99 latency by 60%'],
        risks: ['Product-backend context, not infra-backend', 'No Go — stack mismatch'],
      },
    },
    advisory: {
      why_interesting: [
        'Built billing infrastructure from zero at Chargebee — she has seen what zero-to-one looks like under real load.',
        'Latency reduction from 800ms to 320ms is specific and measurable, not vague.',
      ],
      risk_unknown: [
        'All her work is product-backend — APIs, billing logic, read paths. No evidence she has worked on low-level infra, settlement systems, or high-throughput async pipelines.',
        'No Go experience. Stack mismatch adds ramp-up cost in a role that needs someone shipping from week one.',
      ],
      trajectory: [
        'Moving toward full-stack ownership of backend systems — staying close to the business logic layer.',
        'Likely thrives where backend decisions have visible product impact rather than pure infrastructure.',
        'May not thrive in roles where the work is invisible to the end user.',
      ],
      question_to_ask:
        'What was the last time you had to make a technical decision that the rest of the team disagreed with — how did you handle it?',
    },
  },
  {
    candidate_id:   'mock-3',
    candidate_name: 'Karan Shetty',
    summary:        'Strong open source contributor with a tooling library at 2k GitHub stars. Thoughtful engineer.',
    alignment:      'explore',
    confidence:     'low',
    match_reasons:  ['OSS depth signals quality of thinking'],
    concerns: [
      'Only 3 years of experience',
      'No payments or infra context',
      'Node.js primary — not systems-oriented stack',
    ],
    motivation_signals: ['Open source', 'Tooling', 'Developer experience'],
    value_signals: [
      '2k-star OSS library — signals ability to think about APIs clearly',
      'Actively maintains 3 public repositories',
    ],
    source: 'github',
    derived_signals: {
      primary_languages:    ['TypeScript', 'Node.js'],
      repo_complexity:      'medium',
      open_source_activity: 'active',
      backend_experience:   false,
    },
    card: {
      name:      'Karan Shetty',
      headline:  'Software Engineer · Hasura',
      alignment: 'explore',
      sections: {
        alignment: ['OSS work signals quality of thinking and communication'],
        experience: ['TypeScript', 'Node.js', 'GraphQL', 'PostgreSQL'],
        motivation: ['Developer tooling', 'Open source'],
        value: ['2k-star OSS library — signals ability to think about APIs clearly'],
        risks: ['3 years — too early for this ownership level', 'No payments or infra context', 'Stack mismatch'],
      },
    },
    advisory: null as any,
  },
];

export default function CardPreviewPage() {
  const [stages, setStages] = useState<Record<string, CandidateStage>>({
    'mock-1': 'new',
    'mock-2': 'new',
    'mock-3': 'new',
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedCandidate = selectedId
    ? MOCK_CANDIDATES.find(c => c.candidate_id === selectedId) ?? null
    : null;

  return (
    <AppShell title="Card preview" subtitle="· design verification">
      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="mb-8">
          <p className="text-[10px] font-mono text-stone-600 uppercase tracking-widest mb-1">
            Design preview · candidate tiles
          </p>
          <p className="text-xs text-stone-600">
            Click a tile to open signal drawer · Accept / Reject directly on tile
          </p>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
          {MOCK_CANDIDATES.map((c, i) => (
            <CandidateTile
              key={c.candidate_id}
              candidate={c}
              stage={stages[c.candidate_id] ?? 'new'}
              roleId="preview-role"
              index={i}
              onStage={s => setStages(p => ({ ...p, [c.candidate_id]: s }))}
              onOpen={() => setSelectedId(c.candidate_id)}
            />
          ))}
        </div>

      </div>

      {/* Signal drawer */}
      <AnimatePresence>
        {selectedCandidate && (
          <SignalDrawer
            key={selectedCandidate.candidate_id}
            candidate={selectedCandidate}
            roleId="preview-role"
            stage={stages[selectedCandidate.candidate_id] ?? 'new'}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
