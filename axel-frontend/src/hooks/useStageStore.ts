/**
 * useStageStore — localStorage-backed kanban stage management.
 * One store per roleId. Tracks candidate lifecycle across sessions.
 *
 * Stages:
 *   new          → freshly sourced by Axel
 *   shortlisted  → you advanced them
 *   hold         → not now, not never
 *   rejected     → explicitly out
 *   outreach_sent→ message drafted and marked sent
 *   responded    → they replied
 *   interviewing → active in process
 */

import { useState, useCallback } from 'react';

export type CandidateStage =
  | 'new'
  | 'shortlisted'
  | 'hold'
  | 'rejected'
  | 'outreach_sent'
  | 'responded'
  | 'interviewing';

type StageMap = Record<string, CandidateStage>;

function key(roleId: string)       { return `axel_stages_${roleId}`; }
function load(roleId: string): StageMap {
  try { return JSON.parse(localStorage.getItem(key(roleId)) ?? '{}'); }
  catch { return {}; }
}
function persist(roleId: string, map: StageMap) {
  localStorage.setItem(key(roleId), JSON.stringify(map));
}

export function useStageStore(roleId: string) {
  const [stages, setStages] = useState<StageMap>(() => load(roleId));

  const updateStage = useCallback((candidateId: string, stage: CandidateStage) => {
    setStages(prev => {
      const next = { ...prev, [candidateId]: stage };
      persist(roleId, next);
      return next;
    });
  }, [roleId]);

  const getStage = useCallback(
    (candidateId: string): CandidateStage => stages[candidateId] ?? 'new',
    [stages],
  );

  return { stages, getStage, updateStage };
}
