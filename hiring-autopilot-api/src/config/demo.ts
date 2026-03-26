/**
 * demo.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Demo content configuration.
 *
 * EDIT THIS FILE to change the demo role, company, and candidate profiles
 * shown to clients without re-running the full pipeline.
 *
 * This is the single source of truth for all demo data.
 */

export const DEMO_ROLE = {
  company:     'Acme Corp',
  role_prompt: 'We are building payments infrastructure from scratch. ' +
               'Looking for a senior backend engineer who has owned distributed systems ' +
               'at production scale — not just contributed, but decided. ' +
               'This person will define how our payments layer scales for the next 3 years.',
  constraints: {
    budget_lpa:       35,   // midpoint LPA (number, not string)
    location:         'Bangalore, India',
    experience_range: '4-8 years',
  },
};

export const DEMO_CANDIDATES = [
  {
    name:             'Arjun Mehta',
    current_title:    'Senior Software Engineer',
    current_company:  'Razorpay',
    location:         'Bangalore, India',
    years_of_experience: 5,
    skills:           ['Go', 'Distributed Systems', 'PostgreSQL', 'Kafka', 'gRPC'],
    notes:            'Led zero-downtime payment infra migration. Authored 5 postmortems. OSS contributor.',
    source:           'supabase' as const,
  },
  {
    name:             'Priya Venkat',
    current_title:    'Backend Engineer',
    current_company:  'Chargebee',
    location:         'Bangalore, India',
    years_of_experience: 4,
    skills:           ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Kubernetes'],
    notes:            'Built subscription billing engine from scratch. Reduced p99 latency by 60%.',
    source:           'supabase' as const,
  },
  {
    name:             'Karan Shetty',
    current_title:    'Software Engineer',
    current_company:  'Hasura',
    location:         'Bangalore, India',
    years_of_experience: 3,
    skills:           ['Node.js', 'TypeScript', 'GraphQL', 'PostgreSQL'],
    notes:            'Strong open source contributor. Maintains a tooling library with 2k GitHub stars.',
    source:           'supabase' as const,
  },
];

// Expected demo outreach (shown in the demo flow for the top candidate)
export const DEMO_OUTREACH_PREVIEW = `Hi Arjun,

I read about the migration work at Razorpay. Owning a zero-downtime move at that scale is not something most engineers get to do — and the way you wrote about what broke is the kind of thinking we are looking for.

We are building payments infrastructure at Acme Corp from scratch. Series A, 45 people. You would be the person defining how it scales, not inheriting someone else's decisions.

If that sounds like the right problem, I would like to talk.`;
