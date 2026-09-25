import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { LandingPage } from './pages/LandingPage';
import { HostDashboardPage } from './pages/HostDashboardPage';
import { CreatePollPage } from './pages/CreatePollPage';
import { PollRoomPage } from './pages/PollRoomPage';
import { StudentVotePage } from './pages/StudentVotePage';
import { LiveResultsPage } from './pages/LiveResultsPage';
import { PresentationMode } from './pages/PresentationMode';

function AppLayout() {
  const location = useLocation();
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const isPresentation = location.pathname.includes('/present');
  const isStudentVoting = location.pathname.startsWith('/poll/') &&
    !location.pathname.includes('/room') &&
    !location.pathname.includes('/results') &&
    !location.pathname.includes('/present');

  return (
    <div className="flex flex-col min-h-screen">
      {!isPresentation && !isStudentVoting && (
        <Navbar onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)} />
      )}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/host"
            element={
              <HostDashboardPage
                onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
              />
            }
          />
          <Route path="/create-poll" element={<CreatePollPage />} />
          <Route path="/poll/:pollId/room" element={<PollRoomPage />} />
          <Route path="/poll/:pollId/results" element={<LiveResultsPage />} />
          <Route path="/poll/:pollId/present" element={<PresentationMode />} />
          <Route path="/poll/:pollId" element={<StudentVotePage />} />
          {/* Fallback route */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>

      {!isPresentation && !isStudentVoting && <Footer />}

      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onCredentialsSaved={() => {
          // Trigger reload of live components
          window.dispatchEvent(new CustomEvent('campus_vote_update', { detail: {} }));
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
