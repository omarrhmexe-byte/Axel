import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage         from './pages/HomePage';
import WorkflowPage     from './pages/WorkflowPage';
import AdvisoryDemoPage from './pages/AdvisoryDemoPage';
import PhilosophyPage   from './pages/PhilosophyPage';
import AccessPage       from './pages/AccessPage';
import DashboardPage    from './pages/DashboardPage';
import ChatPage         from './pages/ChatPage';
// Operator UI
import NewRolePage          from './pages/app/NewRolePage';
import RunPage              from './pages/app/RunPage';
import CandidateDetailPage  from './pages/app/CandidateDetailPage';
import CardPreviewPage      from './pages/app/CardPreviewPage';

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* ── Marketing / public ──────────────────────────────── */}
        <Route path="/"                 element={<HomePage />}         />
        <Route path="/workflow"         element={<WorkflowPage />}     />
        <Route path="/advisory"         element={<AdvisoryDemoPage />} />
        <Route path="/philosophy"       element={<PhilosophyPage />}   />
        <Route path="/access"           element={<AccessPage />}       />

        {/* ── Legacy dashboard (keep for backward compat) ──────── */}
        <Route path="/dashboard/:runId" element={<DashboardPage />}    />
        <Route path="/chat/:roleId"     element={<ChatPage />}         />

        {/* ── Operator UI ─────────────────────────────────────── */}
        <Route path="/app"              element={<Navigate to="/app/new" replace />} />
        <Route path="/app/new"          element={<NewRolePage />}               />
        <Route path="/app/run/:runId"   element={<RunPage />}                   />
        <Route path="/app/run/:runId/candidate/:candidateId"
                                        element={<CandidateDetailPage />}       />
        <Route path="/app/preview"      element={<CardPreviewPage />}           />
      </Routes>
    </BrowserRouter>
  );
}
