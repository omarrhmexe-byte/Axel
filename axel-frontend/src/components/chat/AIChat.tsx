import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, Zap } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { generateQuestions, submitResponses } from '../../lib/api';
import { Button }  from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import type { CandidateResponse } from '../../types';

interface Props {
  roleId:      string;
  candidateId: string;
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function Bubble({
  role,
  text,
}: {
  role: 'axel' | 'user';
  text: string;
}) {
  const isAxel = role === 'axel';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isAxel ? 'justify-start' : 'justify-end'}`}
    >
      {isAxel && (
        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
          <Zap className="w-3.5 h-3.5 text-white" fill="white" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isAxel
            ? 'bg-stone-100 text-stone-800 rounded-tl-sm'
            : 'bg-indigo-600 text-white rounded-tr-sm'
        }`}
      >
        {text}
      </div>
    </motion.div>
  );
}

// ─── Purpose pill ─────────────────────────────────────────────────────────────
function PurposePill({ purpose }: { purpose: string }) {
  return (
    <div className="flex justify-center">
      <span className="text-xs text-stone-400 bg-stone-100 rounded-full px-3 py-1 italic">
        {purpose}
      </span>
    </div>
  );
}

// ─── Main AI Chat ─────────────────────────────────────────────────────────────
export function AIChat({ roleId, candidateId }: Props) {
  const [answers, setAnswers]     = useState<CandidateResponse[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [draft, setDraft]         = useState('');
  const [done, setDone]           = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  // ── Fetch questions ──────────────────────────────────────────────
  const { data, isLoading, error } = useQuery({
    queryKey: ['questions', roleId],
    queryFn:  () => generateQuestions(roleId),
  });

  const questions = data?.questions ?? [];

  // ── Submit responses ─────────────────────────────────────────────
  const { mutate: submit, isPending: submitting } = useMutation({
    mutationFn: (responses: CandidateResponse[]) =>
      submitResponses(candidateId, responses),
    onSuccess: () => setDone(true),
  });

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [answers, currentIdx]);

  // Focus input when question advances
  useEffect(() => {
    if (!done) inputRef.current?.focus();
  }, [currentIdx, done]);

  const handleSend = () => {
    if (!draft.trim() || done) return;
    const question = questions[currentIdx]?.question ?? '';
    const updated  = [...answers, { question, answer: draft.trim() }];
    setAnswers(updated);
    setDraft('');

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((i) => i + 1);
    } else {
      // All answered — submit
      submit(updated);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── States ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Spinner />
        <p className="text-sm text-stone-500">Generating your questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-rose-500 text-sm">
        Failed to load questions. Please try again.
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-6 py-4 border-b border-stone-200 bg-white">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          <p className="font-bold font-display text-stone-900">Axel Chat</p>
        </div>
        <p className="text-xs text-stone-400">
          {done
            ? 'Responses saved — Axel will use these to enrich your profile.'
            : `Question ${Math.min(currentIdx + 1, questions.length)} of ${questions.length}`}
        </p>
        {/* Progress bar */}
        {!done && (
          <div className="mt-2 h-1 bg-stone-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIdx) / questions.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        )}
      </div>

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-stone-50/50">

        {/* Intro */}
        <Bubble
          role="axel"
          text="Hey! I'm Axel. I'll ask you a few questions so hiring managers can understand you better — not just your résumé. Ready? 👋"
        />

        {/* Answered exchanges */}
        {answers.map((a, i) => {
          const q = questions[i];
          return (
            <div key={i} className="space-y-4">
              <PurposePill purpose={q.purpose} />
              <Bubble role="axel" text={q.question} />
              <Bubble role="user" text={a.answer} />
            </div>
          );
        })}

        {/* Current question */}
        <AnimatePresence mode="wait">
          {!done && questions[currentIdx] && (
            <div key={currentIdx} className="space-y-4">
              <PurposePill purpose={questions[currentIdx].purpose} />
              <Bubble role="axel" text={questions[currentIdx].question} />
            </div>
          )}
        </AnimatePresence>

        {/* Done state */}
        {done && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 py-8"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="font-semibold text-stone-900 font-display">All done!</p>
            <p className="text-sm text-stone-500 text-center max-w-xs">
              Your responses are saved. Axel will use them to help hiring managers
              understand what makes you tick.
            </p>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      {!done && (
        <div className="px-6 py-4 border-t border-stone-200 bg-white">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKey}
              placeholder="Type your answer..."
              className="flex-1 h-10 px-4 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <Button
              onClick={handleSend}
              disabled={!draft.trim()}
              loading={submitting}
              className="shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-stone-400 mt-2 text-center">
            Press Enter to send · Shift+Enter for a new line
          </p>
        </div>
      )}
    </div>
  );
}
