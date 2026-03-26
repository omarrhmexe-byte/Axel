import type { CandidateInsight, CandidateCard } from '../types';

/**
 * Build a UI-ready candidate card from a fully-enriched CandidateInsight.
 * Pure function — no side effects, no database calls.
 *
 * Requires: insight.alignment, match_reasons, and concerns to be set (post-matching).
 */
export function buildCandidateCard(insight: CandidateInsight, candidateName: string): CandidateCard {
  // Headline: first sentence of experience summary
  const rawHeadline = insight.experience.split(/[.!?]/)[0]?.trim() ?? insight.experience;
  const headline = rawHeadline.length > 100 ? rawHeadline.slice(0, 97) + '…' : rawHeadline;

  // alignment section: why they fit — from match_reasons (max 3)
  const alignmentBullets = (insight.match_reasons ?? []).slice(0, 3);

  // experience section: what they bring — blend signals + strengths (max 4)
  const experienceBullets = dedup([
    ...insight.signals.slice(0, 2),
    ...insight.strengths.slice(0, 2),
  ]).slice(0, 4);

  // motivation section: what drives them — from motivation_signals (max 3)
  // fallback: infer brief bullets from summary if signals absent
  const motivationBullets =
    insight.motivation_signals && insight.motivation_signals.length > 0
      ? insight.motivation_signals.slice(0, 3)
      : inferMotivationFallback(insight);

  // value section: concrete contribution areas — from value_signals (max 3)
  const valueBullets =
    insight.value_signals && insight.value_signals.length > 0
      ? insight.value_signals.slice(0, 3)
      : insight.strengths.slice(0, 3);

  // risks section: honest gaps — blend concerns + gaps (max 4)
  const riskBullets = dedup([
    ...(insight.concerns ?? []).slice(0, 2),
    ...insight.gaps.slice(0, 2),
  ]).slice(0, 4);

  return {
    name: candidateName,
    headline,
    alignment: insight.alignment ?? 'explore',
    sections: {
      alignment: alignmentBullets,
      experience: experienceBullets,
      motivation: motivationBullets,
      value: valueBullets,
      risks: riskBullets,
    },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dedup(items: string[]): string[] {
  return [...new Set(items)];
}

function inferMotivationFallback(insight: CandidateInsight): string[] {
  // Extract the second and third sentences of the summary as a rough motivation proxy
  const sentences = insight.summary.split(/[.!?]/).map((s) => s.trim()).filter(Boolean);
  return sentences.slice(1, 3).length > 0 ? sentences.slice(1, 3) : ['No motivation signals available'];
}
