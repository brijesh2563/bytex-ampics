import { useState, useEffect } from 'react';
import Lenis from 'lenis';
import { Preloader } from './components/ui/Preloader';
import { ConvergenceDial } from './components/dial/ConvergenceDial';
import { WorkspaceView } from './components/workspace/WorkspaceView';
import { Button } from './components/ui/Button';
import { Chip } from './components/ui/Chip';
import { Card } from './components/ui/Card';
import { useSyncStore } from './store/useSyncStore';
import { Layers, Activity, ShieldCheck, Cpu, Wifi, WifiOff } from 'lucide-react';

export default function App() {
  const {
    dialState,
    setDialState,
    isBrowserOnline,
    initWorkspace,
    setBrowserOnlineStatus,
    replicaA,
    replicaB,
  } = useSyncStore();

  const [activeTab, setActiveTab] = useState('instrument'); // 'instrument' | 'motion-lab'
  const [preloaderComplete, setPreloaderComplete] = useState(false);

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

  const totalPending = (replicaA.pendingOps?.length || 0) + (replicaB.pendingOps?.length || 0);

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] relative flex flex-col selection:bg-[var(--copper)] selection:text-[var(--paper-raised)]">
      {/* 1. PAPER GRAIN OVERLAY */}
      <div className="paper-grain-overlay" aria-hidden="true" />

      {/* 2. INSTRUMENT PRELOADER */}
      <Preloader onComplete={() => setPreloaderComplete(true)} />

      {/* 3. OBSERVATORY TOP HEADER */}
      <header className="hairline-b bg-[var(--paper)]/95 backdrop-blur-xs sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--copper)]" />
            <span className="font-display text-2xl tracking-tight font-semibold">
              Nexus<span className="italic text-[var(--copper)]">Sync</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Chip
              variant={isBrowserOnline ? 'verdigris' : 'rust'}
              hasDot
              className="text-[10px]"
            >
              {isBrowserOnline ? (
                <span className="flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  BROWSER ONLINE
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  BROWSER OFFLINE
                </span>
              )}
            </Chip>

            {totalPending > 0 && (
              <Chip variant="copper" hasDot className="text-[10px]">
                {totalPending} PENDING SYNC
              </Chip>
            )}
          </div>
        </div>

        {/* VIEW NAVIGATION TABS */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            size="sm"
            variant={activeTab === 'instrument' ? 'secondary' : 'ghost'}
            onClick={() => setActiveTab('instrument')}
          >
            <Activity className="w-3.5 h-3.5 sm:mr-1 text-[var(--copper)]" />
            <span className="hidden sm:inline">01 Observatory Workspace</span>
            <span className="inline sm:hidden">01 Workspace</span>
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'motion-lab' ? 'secondary' : 'ghost'}
            onClick={() => setActiveTab('motion-lab')}
          >
            <Layers className="w-3.5 h-3.5 sm:mr-1 text-[var(--ink-soft)]" />
            <span className="hidden sm:inline">02 Motion Lab</span>
            <span className="inline sm:hidden">02 Motion</span>
          </Button>
        </div>
      </header>

      {/* 4. MAIN CONTENT */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col gap-12">
        {activeTab === 'instrument' ? (
          <>
            {/* HERO DISPLAY */}
            <section className="relative flex flex-col items-center text-center pt-2 pb-6">
              {/* Margin Note (Reenie Beanie) */}
              <div
                className="font-hand text-2xl text-[var(--copper)] -rotate-2 mb-2 select-none"
                style={{ transform: 'rotate(-2deg)' }}
              >
                Two people edited this at once. Nothing was lost.
              </div>

              {/* Display Headline */}
              <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-[0.95] text-[var(--ink)] max-w-4xl">
                Prevent conflicts. <span className="italic text-[var(--copper)] font-normal">Protect</span> changes. Prove consistency.
              </h1>

              <p className="mt-5 font-newsreader text-lg sm:text-xl text-[var(--ink-soft)] max-w-2xl italic">
                A local-first, conflict-aware distributed collaboration engine. When replicas drift offline, the instrument records causal vectors and verifies convergence.
              </p>

              {/* FIGURE CAPTION */}
              <div className="mt-8 font-mono text-[11px] uppercase tracking-widest text-[var(--ink-faint)] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--tick)]" />
                FIG. 01 — Continuous state vector alignment between replica A &amp; replica B
              </div>

              {/* SIGNATURE CONVERGENCE DIAL */}
              <div className="mt-6 flex flex-col items-center justify-center p-6 bg-[var(--paper-raised)] border border-[var(--border)] rounded-[14px] shadow-xs relative">
                <div className="absolute top-3 left-4 font-mono text-[10px] text-[var(--ink-faint)] uppercase tracking-wider">
                  INSTRUMENT READOUT · STATE: <span className="font-semibold text-[var(--copper)]">{dialState}</span>
                </div>
                <div className="pt-4">
                  <ConvergenceDial size={290} />
                </div>
              </div>
            </section>

            {/* P0 STEP 1: PORTED STITCH COLLABORATIVE WORKSPACE */}
            <WorkspaceView />
          </>
        ) : (
          /* MOTION LAB (/dev/motion-lab) */
          <section className="flex flex-col gap-8">
            <div className="border-b border-[var(--line)] pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-display text-3xl text-[var(--ink)]">Motion Lab</h2>
                <p className="font-mono text-xs uppercase tracking-widest text-[var(--ink-faint)] mt-1">
                  /dev/motion-lab · Isolated Motion Token &amp; Dial State Playground
                </p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setActiveTab('instrument')}>
                ← Return to Observatory
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <Card figure="EXP. 01" caption="ConvergenceDial Reactive States">
                <div className="flex flex-col items-center p-4">
                  <ConvergenceDial size={280} />
                </div>
              </Card>

              <Card figure="EXP. 02" caption="State Controls &amp; Replay">
                <div className="flex flex-col gap-3">
                  <p className="font-sans text-xs text-[var(--ink-soft)] mb-2">
                    Click each state button below to trigger and observe the exact state transitions:
                  </p>
                  <Button
                    variant={dialState === 'SYNCED' ? 'primary' : 'secondary'}
                    onClick={() => setDialState('SYNCED')}
                  >
                    1. SYNCED (Aligned hub breathing 3s loop)
                  </Button>
                  <Button
                    variant={dialState === 'DIVERGING' ? 'primary' : 'secondary'}
                    onClick={() => setDialState('DIVERGING')}
                  >
                    2. DIVERGING (Arc B drifts with soft spring)
                  </Button>
                  <Button
                    variant={dialState === 'CONFLICT' ? 'danger' : 'secondary'}
                    onClick={() => setDialState('CONFLICT')}
                  >
                    3. CONFLICT (Vibrate 90ms x6 + ochre arc segment)
                  </Button>
                  <Button
                    variant={dialState === 'CONVERGING' ? 'primary' : 'secondary'}
                    onClick={() => setDialState('CONVERGING')}
                  >
                    4. CONVERGING (Arcs sweep together 1.4s out-quint)
                  </Button>
                  <Button
                    variant={dialState === 'LOCKED' ? 'primary' : 'secondary'}
                    onClick={() => setDialState('LOCKED')}
                  >
                    5. LOCKED (Needle snap + hash scramble settle)
                  </Button>
                </div>
              </Card>
            </div>
          </section>
        )}
      </main>

      {/* 5. FOOTER */}
      <footer className="hairline-t bg-[var(--paper-raised)] px-4 sm:px-8 py-6 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[var(--ink-faint)] uppercase tracking-wider">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl text-[var(--ink)] tracking-tight">
              Nexus<span className="italic text-[var(--copper)]">Sync</span>
            </span>
            <span className="text-[var(--border)]">|</span>
            <span>The Convergence Instrument</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[var(--copper)]" />
              Built in 8 hours
            </span>
            <span className="text-[var(--border)]">|</span>
            <span className="text-[var(--verdigris)] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              P0 Step 1 Active (IndexedDB Persisted)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
