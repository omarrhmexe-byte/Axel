import { useQuery } from '@tanstack/react-query';
import { getPipelineRun } from '../lib/api';
import type { PipelineRunStatus } from '../types';

const RUNNING_STATUSES: PipelineRunStatus[] = ['pending', 'running'];

/**
 * Polls GET /pipeline-run/:runId every 3 s while the run is in progress.
 * Stops polling once the run is completed or failed.
 */
export function usePipelineRun(runId: string | undefined) {
  return useQuery({
    queryKey: ['pipeline-run', runId],
    queryFn:  () => getPipelineRun(runId!),
    enabled:  !!runId,
    refetchInterval(query) {
      const status = query.state.data?.status;
      return status && RUNNING_STATUSES.includes(status) ? 3_000 : false;
    },
    staleTime: 0, // always fresh while polling
  });
}
