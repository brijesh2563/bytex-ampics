import { ConvergenceDial } from '../components/dial/ConvergenceDial';
import { WorkspaceView } from '../components/workspace/WorkspaceView';
import { useSyncStore } from '../store/useSyncStore';
import { Layers, Activity, GitFork, ArrowRight } from 'lucide-react';

export function ObservatoryPage() {
  const { dialState, setActivePage, conflicts } = useSyncStore();

  return (
    <div className="flex flex-col gap-12 w-full animate-in fade-in duration-300">
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

        {/* Action Bar: Deep Jump to Instruments */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setActivePage('workspace')}
            className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--copper)] text-[var(--paper-raised)] font-mono text-xs uppercase tracking-wider font-bold hover:bg-[var(--copper-deep)] transition shadow-xs cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Open Replica Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActivePage('timeline')}
            className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--paper-raised)] border border-[var(--border)] text-[var(--ink)] font-mono text-xs uppercase tracking-wider hover:bg-[var(--border)] transition shadow-xs cursor-pointer"
          >
            <Activity className="w-4 h-4 text-[var(--copper)]" />
            <span>Vector Timeline Scrubber</span>
          </button>

          {conflicts.length > 0 && (
            <button
              onClick={() => setActivePage('conflicts')}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--ochre)]/15 border border-[var(--ochre)]/50 text-[var(--ochre)] font-mono text-xs uppercase tracking-wider font-bold hover:bg-[var(--ochre)]/25 transition shadow-xs cursor-pointer"
            >
              <GitFork className="w-4 h-4" />
              <span>Inspect {conflicts.length} Active Conflict</span>
            </button>
          )}
        </div>

        {/* FIGURE CAPTION */}
        <div className="mt-8 font-mono text-[11px] uppercase tracking-widest text-[var(--ink-faint)] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--tick)]" />
          FIG. 01 — Continuous state vector alignment between replica A &amp; replica B
        </div>

        {/* SIGNATURE CONVERGENCE DIAL */}
        <div className="mt-6 flex flex-col items-center justify-center p-6 bg-[var(--paper-raised)] border border-[var(--border)] rounded-[14px] shadow-xs relative max-w-md w-full">
          <div className="absolute top-3 left-4 font-mono text-[10px] text-[var(--ink-faint)] uppercase tracking-wider">
            INSTRUMENT READOUT · STATE:{' '}
            <span
              className={`font-semibold ${
                dialState === 'SYNCED'
                  ? 'text-[var(--verdigris)]'
                  : dialState === 'CONFLICT'
                  ? 'text-[var(--ochre)]'
                  : 'text-[var(--copper)]'
              }`}
            >
              {dialState}
            </span>
          </div>
          <div className="pt-4">
            <ConvergenceDial size={280} />
          </div>
        </div>
      </section>

      {/* PORTED STITCH COLLABORATIVE WORKSPACE (P0) */}
      <section className="w-full">
        <div className="border-b border-[var(--line)] pb-3 mb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--copper)] font-bold">
              01 / DUAL-PARTITION ENGINE
            </span>
            <h2 className="font-display text-3xl text-[var(--ink)] tracking-tight">
              Collaborative Peer Workspace
            </h2>
          </div>
          <p className="font-mono text-xs text-[var(--ink-faint)]">
            IndexedDB Local Persistence · Causal Op Queue
          </p>
        </div>

        <WorkspaceView />
      </section>
    </div>
  );
}
