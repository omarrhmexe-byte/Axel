import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }      from './context/AuthContext';
import { ProtectedRoute }    from './components/app/ProtectedRoute';
import HomePage              from './pages/HomePage';
import WorkflowPage          from './pages/WorkflowPage';
import AdvisoryDemoPage      from './pages/AdvisoryDemoPage';
import PhilosophyPage        from './pages/PhilosophyPage';
import AccessPage            from './pages/AccessPage';
import LoginPage             from './pages/LoginPage';
import DashboardPage         from './pages/DashboardPage';
import ChatPage              from './pages/ChatPage';
// Operator UI
import NewRolePage           from './pages/app/NewRolePage';
import RunPage               from './pages/app/RunPage';
import CandidateDetailPage   from './pages/app/CandidateDetailPage';
import CardPreviewPage       from './pages/app/CardPreviewPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* ── Marketing / public ──────────────────────────────── */}
          <Route path="/"           element={<HomePage />}         />
          <Route path="/workflow"   element={<WorkflowPage />}     />
          <Route path="/advisory"   element={<AdvisoryDemoPage />} />
          <Route path="/philosophy" element={<PhilosophyPage />}   />
          <Route path="/access"     element={<AccessPage />}       />

          {/* ── Auth ────────────────────────────────────────────── */}
          <Route path="/login"      element={<LoginPage />}        />

          {/* ── Legacy (backward compat) ─────────────────────────── */}
          <Route path="/dashboard/:runId" element={<DashboardPage />} />
          <Route path="/chat/:roleId"     element={<ChatPage />}      />

          {/* ── Operator UI (protected) ──────────────────────────── */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Navigate to="/app/new" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/new"
            element={
              <ProtectedRoute>
                <NewRolePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/run/:runId"
            element={
              <ProtectedRoute>
                <RunPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/run/:runId/candidate/:candidateId"
            element={
              <ProtectedRoute>
                <CandidateDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/preview"
            element={
              <ProtectedRoute>
                <CardPreviewPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
