import { useState, useEffect } from 'react';
import Lenis from 'lenis';
import { Preloader } from './components/ui/Preloader';
import { TopNav } from './components/navigation/TopNav';
import { PageCurtain } from './components/navigation/PageCurtain';
import { ObservatoryPage } from './pages/ObservatoryPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { ConflictResolverPage } from './pages/ConflictResolverPage';
import { ConflictRadarPage } from './pages/ConflictRadarPage';
import { ConflictImpactPage } from './pages/ConflictImpactPage';
import { VectorTimelinePage } from './pages/VectorTimelinePage';
import { VersionHistoryPage } from './pages/VersionHistoryPage';
import { ConvergenceLabPage } from './pages/ConvergenceLabPage';
import { EngineProofsPage } from './pages/EngineProofsPage';
import { StatusPage } from './pages/StatusPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AuthGatePage } from './pages/AuthGatePage';
import { AdminPage } from './pages/AdminPage';
import { SettingsPage } from './pages/SettingsPage';
import { MotionLabPage } from './pages/MotionLabPage';
import { useSyncStore } from './store/useSyncStore';
import { ArrowUpRight } from 'lucide-react';

export default function App() {
  const {
    activePage,
    setActivePage,
    initWorkspace,
    setBrowserOnlineStatus,
    theme,
  } = useSyncStore();

  const [preloaderComplete, setPreloaderComplete] = useState(false);

  // Synchronize theme attribute on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  // Synchronize hash routing with store
  useEffect(() => {
    const handleHashChange = () => {
      const page = window.location.hash.replace('#', '') || 'observatory';
      setActivePage(page);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setActivePage]);

  // Initialize Lenis smooth scroll active only after the preloader completes
  useEffect(() => {
    if (!preloaderComplete) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let animationFrameId;
    function raf(time) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }
    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, [preloaderComplete]);

  // Initialize IndexedDB workspace and real browser connectivity listeners
  useEffect(() => {
    initWorkspace();

    const handleOnline = () => setBrowserOnlineStatus(true);
    const handleOffline = () => setBrowserOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [initWorkspace, setBrowserOnlineStatus]);

  // Page switcher
  const renderCurrentPage = () => {
    switch (activePage) {
      case 'workspace':
        return <WorkspacePage />;
      case 'conflicts':
      case 'resolver':
        return <ConflictResolverPage />;
      case 'conflict-radar':
      case 'radar':
        return <ConflictRadarPage />;
      case 'conflict-impact':
      case 'impact':
        return <ConflictImpactPage />;
      case 'history':
      case 'version-history':
        return <VersionHistoryPage />;
      case 'timeline':
      case 'vector-timeline':
        return <VectorTimelinePage />;
      case 'lab':
      case 'convergence-lab':
        return <ConvergenceLabPage />;
      case 'proofs':
      case 'engine-proofs':
        return <EngineProofsPage />;
      case 'status':
      case 'system-status':
        return <StatusPage />;
      case 'auth':
      case 'gate':
        return <AuthGatePage />;
      case 'signup':
      case 'register':
        return <SignupPage />;
      case 'login':
      case 'signin':
        return <LoginPage />;
      case 'admin':
        return <AdminPage />;
      case 'settings':
        return <SettingsPage />;
      case 'motion-lab':
        return <MotionLabPage />;
      case 'observatory':
      default:
        return <ObservatoryPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] relative flex flex-col selection:bg-[var(--copper)] selection:text-[var(--paper-raised)] transition-colors duration-300">
      {/* 1. PAPER GRAIN OVERLAY */}
      <div className="paper-grain-overlay" aria-hidden="true" />

      {/* 2. COPPER CALIBRATION CURTAIN PAGE TRANSITION */}
      <PageCurtain />

      {/* 3. INSTRUMENT PRELOADER */}
      <Preloader onComplete={() => setPreloaderComplete(true)} />

      {/* 4. UNIFIED MULTI-PAGE TOP NAVIGATION */}
      <TopNav />

      {/* 5. MAIN DEDICATED PAGE VIEW CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col">
        {renderCurrentPage()}
      </main>

      {/* 6. ARCHIVAL INSTRUMENT FOOTER */}
      <footer className="hairline-t bg-[var(--paper-raised)] px-4 sm:px-8 py-8 mt-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs text-[var(--ink-faint)]">
          <div className="flex flex-wrap items-center gap-4 text-center md:text-left">
            <span className="font-display text-xl text-[var(--ink)] tracking-tight">
              Nexus<span className="italic text-[var(--copper)]">Sync</span>
            </span>
            <span className="hidden sm:inline text-[var(--border)]">|</span>
            <span>© 2026 The Convergence Instrument · Open Source CRDT Engine</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--paper)] border border-[var(--border)] text-[var(--ink)] text-[10px]">
              <span className="text-[var(--ink-faint)]">MERKLE ROOT:</span>
              <span className="font-bold">e9281a8c88fd12a4</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <button
              onClick={() => { setActivePage('proofs'); }}
              className="hover:text-[var(--copper)] transition-colors cursor-pointer flex items-center gap-0.5"
            >
              <span>Formal Proofs</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </button>
            <button
              onClick={() => { setActivePage('timeline'); }}
              className="hover:text-[var(--copper)] transition-colors cursor-pointer flex items-center gap-0.5"
            >
              <span>Causal Op-Log</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </button>
            <button
              onClick={() => { setActivePage('admin'); }}
              className="hover:text-[var(--copper)] transition-colors cursor-pointer flex items-center gap-0.5"
            >
              <span>Cluster Control</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </button>
            <button
              onClick={() => { setActivePage('motion-lab'); }}
              className="hover:text-[var(--copper)] transition-colors cursor-pointer flex items-center gap-0.5"
            >
              <span>Motion Lab</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
