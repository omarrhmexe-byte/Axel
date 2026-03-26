import { useParams, useSearchParams } from 'react-router-dom';
import { Navbar }   from '../components/ui/Navbar';
import { AIChat }   from '../components/chat/AIChat';

export default function ChatPage() {
  const { roleId }          = useParams<{ roleId: string }>();
  const [searchParams]      = useSearchParams();
  const candidateId         = searchParams.get('candidate_id') ?? '';

  if (!roleId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-stone-500">Missing role ID in URL.</p>
      </div>
    );
  }

  if (!candidateId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-stone-500">
          Missing <code className="font-mono bg-stone-100 px-1 rounded">?candidate_id=</code> query param.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Navbar variant="chat" subtitle="Candidate Questions" />

      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-0 sm:px-4 py-0 sm:py-6">
        <div className="flex-1 card sm:rounded-2xl overflow-hidden flex flex-col shadow-sm">
          <AIChat roleId={roleId} candidateId={candidateId} />
        </div>
      </main>
    </div>
  );
}
