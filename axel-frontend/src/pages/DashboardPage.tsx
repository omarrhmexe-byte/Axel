import { useParams }          from 'react-router-dom';
import { Navbar }              from '../components/ui/Navbar';
import { PipelineDashboard }   from '../components/dashboard/PipelineDashboard';
import { LoadingRing }         from '../components/ui/Spinner';
import { usePipelineRun }      from '../hooks/usePipelineRun';

export default function DashboardPage() {
  const { runId }  = useParams<{ runId: string }>();
  const { data, isLoading, error } = usePipelineRun(runId);

  // ── Role subtitle for navbar ─────────────────────────────────────
  const subtitle = data?.role_intelligence
    ? `${data.role_intelligence.role_summary?.split('.')[0]} · Pipeline`
    : 'Pipeline Dashboard';

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Navbar variant="dashboard" subtitle={subtitle} />

      <main className="flex-1">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <LoadingRing className="w-8 h-8" />
            <p className="text-stone-500 text-sm">Loading pipeline...</p>
          </div>
        )}

        {error && (
          <div className="max-w-lg mx-auto mt-20 bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center">
            <p className="font-semibold text-rose-700 mb-1">Could not load pipeline</p>
            <p className="text-sm text-rose-500">{(error as Error).message}</p>
          </div>
        )}

        {data && <PipelineDashboard run={data} />}
      </main>
    </div>
  );
}
