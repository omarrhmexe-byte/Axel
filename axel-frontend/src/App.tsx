import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage         from './pages/HomePage';
import WorkflowPage     from './pages/WorkflowPage';
import AdvisoryDemoPage from './pages/AdvisoryDemoPage';
import PhilosophyPage   from './pages/PhilosophyPage';
import AccessPage       from './pages/AccessPage';
import DashboardPage    from './pages/DashboardPage';
import ChatPage         from './pages/ChatPage';

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/"                 element={<HomePage />}         />
        <Route path="/workflow"         element={<WorkflowPage />}     />
        <Route path="/advisory"         element={<AdvisoryDemoPage />} />
        <Route path="/philosophy"       element={<PhilosophyPage />}   />
        <Route path="/access"           element={<AccessPage />}       />
        <Route path="/dashboard/:runId" element={<DashboardPage />}    />
        <Route path="/chat/:roleId"     element={<ChatPage />}         />
      </Routes>
    </BrowserRouter>
  );
}
