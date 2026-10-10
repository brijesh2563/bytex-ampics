import { useState } from 'react';
import { useSyncStore } from '../store/useSyncStore';
import {
  GitFork,
  History,
  Sliders,
  CheckCircle2,
  FileCheck,
  Edit3
} from 'lucide-react';

export function ConflictResolverPage() {
  const {
    conflicts,
    resolutionStrategy,
    setResolutionStrategy,
    sutureSelections,
    setSutureSelection,
    resolveConflict,
    resolvedConflicts,
  } = useSyncStore();

  const [resolutionSuccess, setResolutionSuccess] = useState(false);

  const activeConflict = conflicts[0];

  const handleResolve = () => {
    if (!activeConflict) return;
    resolveConflict(activeConflict.id);
    setResolutionSuccess(true);
    setTimeout(() => {
      setResolutionSuccess(false);
    }, 4000);
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-300">
      {/* 1. TOP ARCHIVAL RULER & CONTEXT WIRE */}
      <div className="w-full bg-[var(--paper-raised)] border border-[var(--border)] px-4 sm:px-6 py-2 rounded-lg flex flex-wrap items-center justify-between text-[var(--ink-soft)] font-mono text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-bold text-[var(--copper)]">
            <Sliders className="w-3.5 h-3.5" />
            SESSION REGISTRY: 0x8F92_DELTA
          </span>
          <span className="hidden md:inline text-[var(--ink-faint)]">|</span>
          <span className="hidden md:inline">LAMPORT_TICKS: 2,841</span>
          <span className="hidden md:inline text-[var(--ink-faint)]">|</span>
          <span className="hidden md:inline">TOPOLOGY: 3-PEER MESH</span>
        </div>
        <div className="flex items-center gap-2">
          <span>STATE: DISK-JOURNAL RECONCILE</span>
          <span className="w-2 h-2 rounded-full bg-[var(--verdigris)] animate-pulse" />
        </div>
      </div>

      {/* 2. EDITORIAL MASTHEAD */}
      <section className="border-b border-[var(--line)] pb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[var(--paper-raised)] border border-[var(--border)] text-[var(--copper)] font-mono text-[10px] tracking-wider uppercase font-bold">
                03 / RESOLUTION BENCH &amp; 3-WAY DIFF
              </span>
              <span className="text-[var(--ink-faint)] font-mono text-[10px]">• FORMAL SPEC REV. 4B</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl text-[var(--ink)] tracking-tight leading-tight">
              Deterministic <span className="italic text-[var(--copper)] font-normal">Conflict</span> Resolver Studio
            </h1>
            <p className="font-newsreader text-base sm:text-lg text-[var(--ink-soft)] max-w-2xl">
              Granular 3-way reconciliation workbench. Resolve semantic divergence across independent replicas with mathematically guaranteed closure and causal stability.
            </p>
          </div>

          {/* Marginalia Callout Note */}
          <div className="relative bg-[var(--paper-raised)] border border-[var(--border)] p-4 rounded-lg shadow-xs max-w-xs self-start md:-rotate-1 shrink-0">
            <div className="flex items-center gap-1.5 text-[var(--copper)] pb-1">
              <Edit3 className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] tracking-wider uppercase font-bold">Marginalia #04</span>
            </div>
            <p className="font-newsreader text-sm italic text-[var(--ink)] leading-snug">
              “conflicts are natural forks, not errors”
            </p>
            <span className="block mt-1 font-mono text-[9px] text-[var(--ink-faint)] text-right">
              — Leslie Lamport, 1978
            </span>
          </div>
        </div>
      </section>

      {/* RESOLUTION SUCCESS NOTIFICATION */}
      {resolutionSuccess && (
        <div className="p-4 rounded-lg bg-[var(--verdigris)]/15 border border-[var(--verdigris)] text-[var(--verdigris)] font-mono text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-bold">Conflict Successfully Resolved via Join Semilattice. Dial aligned to SYNCED.</span>
          </div>
          <span className="text-[10px] uppercase">Merkle Root Updated</span>
        </div>
      )}

      {/* 3. ACTIVE CONFLICT BANNER */}
      {activeConflict ? (
        <section className="rounded-xl bg-[var(--paper-raised)] border border-[var(--border)] p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--ochre)]/20 text-[var(--ochre)] flex items-center justify-center shrink-0 border border-[var(--ochre)]/40">
                <GitFork className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--ochre)] text-white uppercase font-bold tracking-wider">
                    FORK DETECTED
                  </span>
                  <span className="font-display text-xl text-[var(--ink)] font-semibold">
                    Concurrent edit on Due Date &amp; Priority for: "{activeConflict.title}"
                  </span>
                </div>
                <p className="font-newsreader text-sm text-[var(--ink-soft)]">
                  Semantic Context: Replica A rescheduled to <strong className="text-[var(--copper)]">Nov 04</strong> while Replica B marked <strong className="text-[var(--ochre)]">Nov 19</strong> with an unlinked blocking dependency.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center font-mono text-xs">
              <span className="text-[var(--ink-soft)] bg-[var(--paper)] border border-[var(--border)] px-2.5 py-1 rounded">
                LCA_HASH: {activeConflict.lcaHash}
              </span>
              <span className="px-2.5 py-1 rounded bg-[var(--paper-sunken)] border border-[var(--border)] text-[var(--ink)]">
                DELTA: {activeConflict.deltaSize}
              </span>
            </div>
          </div>
        </section>
      ) : (
        <div className="p-8 text-center bg-[var(--paper-raised)] border border-[var(--border)] rounded-xl space-y-3">
          <CheckCircle2 className="w-12 h-12 text-[var(--verdigris)] mx-auto" />
          <h3 className="font-display text-2xl text-[var(--ink)]">All Active Forks Fully Resolved</h3>
          <p className="font-newsreader text-sm text-[var(--ink-soft)] max-w-md mx-auto">
            Zero concurrent divergences detected across local replica partitions. The join-semilattice invariant is 100% satisfied.
          </p>
        </div>
      )}

      {/* 4. MAIN 3-WAY DIFF PANELS & RESOLUTION CONSOLE BENTO */}
      {activeConflict && (
        <section className="space-y-6">
          {/* 3-Way Diff Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* Column 1: Base State (Ancestor LCA) */}
            <div className="flex flex-col bg-[var(--paper-raised)] border border-[var(--border)] rounded-xl p-5 shadow-xs relative">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--line)]">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-faint)] font-bold block">
                    ORIGIN NODE
                  </span>
                  <h3 className="font-display text-xl text-[var(--ink)]">BASE STATE (LCA)</h3>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--paper)] border border-[var(--border)] text-[var(--ink-soft)]">
                  {activeConflict.base.version}
                </span>
              </div>
              <div className="font-mono text-[10px] text-[var(--ink-faint)] pb-3 flex items-center gap-1.5">
                <History className="w-3 h-3" />
                CLOCK: {activeConflict.base.clock} · ANCESTOR
              </div>

              {/* Base Fields */}
              <div className="space-y-3 flex-1 font-mono text-xs">
                <div className="p-2.5 rounded bg-[var(--paper)] border border-[var(--border)]">
                  <span className="text-[9px] uppercase tracking-wider text-[var(--ink-faint)] block">Title</span>
                  <p className="font-newsreader text-sm text-[var(--ink)] pt-0.5 font-medium">
                    {activeConflict.base.title}
                  </p>
                </div>
                <div className="p-2.5 rounded bg-[var(--paper)] border border-[var(--border)]">
                  <span className="text-[9px] uppercase tracking-wider text-[var(--ink-faint)] block">Due Date</span>
                  <p className="text-[var(--ink)] pt-0.5">{activeConflict.base.dueDate}</p>
                </div>
                <div className="p-2.5 rounded bg-[var(--paper)] border border-[var(--border)]">
                  <span className="text-[9px] uppercase tracking-wider text-[var(--ink-faint)] block">Priority</span>
                  <p className="text-[var(--ink)] pt-0.5">{activeConflict.base.priority}</p>
                </div>
                <div className="p-2.5 rounded bg-[var(--paper)] border border-[var(--border)]">
                  <span className="text-[9px] uppercase tracking-wider text-[var(--ink-faint)] block">Assignee</span>
                  <p className="text-[var(--ink)] pt-0.5">{activeConflict.base.assignee}</p>
                </div>
                <div className="p-2.5 rounded bg-[var(--paper)] border border-[var(--border)]">
                  <span className="text-[9px] uppercase tracking-wider text-[var(--ink-faint)] block">Dependency</span>
                  <p className="text-[var(--ink-soft)] pt-0.5">{activeConflict.base.blockingDep}</p>
                </div>
              </div>
            </div>

            {/* Column 2: Replica A (Aarav) */}
            <div className="flex flex-col bg-[var(--paper-raised)] border-2 border-[var(--copper)]/60 rounded-xl p-5 shadow-xs relative">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--line)]">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--copper)] font-bold block">
                    BRANCH A
                  </span>
                  <h3 className="font-display text-xl text-[var(--ink)]">Aarav (Replica A)</h3>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--copper)]/15 text-[var(--copper)] font-bold">
                  {activeConflict.branchA.version}
                </span>
              </div>
              <div className="font-mono text-[10px] text-[var(--copper)] pb-3 flex items-center gap-1.5 font-bold">
                <Sliders className="w-3 h-3" />
                CLOCK: {activeConflict.branchA.clock} · ADVANCED
              </div>

              {/* Branch A Fields with Diff Highlighting */}
              <div className="space-y-3 flex-1 font-mono text-xs">
                <div className="p-2.5 rounded bg-[var(--paper)] border border-[var(--border)]">
                  <span className="text-[9px] uppercase tracking-wider text-[var(--ink-faint)] block">Title</span>
                  <p className="font-newsreader text-sm text-[var(--ink)] pt-0.5 font-medium">
                    {activeConflict.base.title}
                  </p>
                </div>
                <div className="p-2.5 rounded bg-[var(--copper)]/10 border border-[var(--copper)]/40">
                  <div className="flex justify-between">
                    <span className="text-[9px] uppercase tracking-wider text-[var(--copper)] font-bold">Due Date (MUTATED)</span>
                    <span className="text-[9px] text-[var(--copper)] font-bold">Δ FORK</span>
                  </div>
                  <p className="text-[var(--copper)] font-bold pt-0.5">{activeConflict.branchA.dueDate}</p>
                </div>
                <div className="p-2.5 rounded bg-[var(--copper)]/10 border border-[var(--copper)]/40">
                  <div className="flex justify-between">
                    <span className="text-[9px] uppercase tracking-wider text-[var(--copper)] font-bold">Priority (MUTATED)</span>
                    <span className="text-[9px] text-[var(--copper)] font-bold">Δ FORK</span>
                  </div>
                  <p className="text-[var(--copper)] font-bold pt-0.5">{activeConflict.branchA.priority}</p>
                </div>
                <div className="p-2.5 rounded bg-[var(--paper)] border border-[var(--border)]">
                  <span className="text-[9px] uppercase tracking-wider text-[var(--ink-faint)] block">Assignee (Unchanged)</span>
                  <p className="text-[var(--ink)] pt-0.5">{activeConflict.branchA.assignee}</p>
                </div>
                <div className="p-2.5 rounded bg-[var(--paper)] border border-[var(--border)]">
                  <span className="text-[9px] uppercase tracking-wider text-[var(--ink-faint)] block">Dependency</span>
                  <p className="text-[var(--ink-soft)] pt-0.5">{activeConflict.branchA.blockingDep}</p>
                </div>
              </div>
            </div>

            {/* Column 3: Replica B (Meera) */}
            <div className="flex flex-col bg-[var(--paper-raised)] border-2 border-[var(--verdigris)]/60 rounded-xl p-5 shadow-xs relative">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--line)]">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--verdigris)] font-bold block">
                    BRANCH B
                  </span>
                  <h3 className="font-display text-xl text-[var(--ink)]">Meera (Replica B)</h3>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--verdigris)]/15 text-[var(--verdigris)] font-bold">
                  {activeConflict.branchB.version}
                </span>
              </div>
              <div className="font-mono text-[10px] text-[var(--verdigris)] pb-3 flex items-center gap-1.5 font-bold">
                <Sliders className="w-3 h-3" />
                CLOCK: {activeConflict.branchB.clock} · ADVANCED
              </div>

              {/* Branch B Fields with Diff Highlighting */}
              <div className="space-y-3 flex-1 font-mono text-xs">
                <div className="p-2.5 rounded bg-[var(--paper)] border border-[var(--border)]">
                  <span className="text-[9px] uppercase tracking-wider text-[var(--ink-faint)] block">Title</span>
                  <p className="font-newsreader text-sm text-[var(--ink)] pt-0.5 font-medium">
                    {activeConflict.base.title}
                  </p>
                </div>
                <div className="p-2.5 rounded bg-[var(--verdigris)]/10 border border-[var(--verdigris)]/40">
                  <div className="flex justify-between">
                    <span className="text-[9px] uppercase tracking-wider text-[var(--verdigris)] font-bold">Due Date (MUTATED)</span>
                    <span className="text-[9px] text-[var(--verdigris)] font-bold">Δ FORK</span>
                  </div>
                  <p className="text-[var(--verdigris)] font-bold pt-0.5">{activeConflict.branchB.dueDate}</p>
                </div>
                <div className="p-2.5 rounded bg-[var(--paper)] border border-[var(--border)]">
                  <span className="text-[9px] uppercase tracking-wider text-[var(--ink-faint)] block">Priority (Unchanged)</span>
                  <p className="text-[var(--ink)] pt-0.5">{activeConflict.branchB.priority}</p>
                </div>
                <div className="p-2.5 rounded bg-[var(--verdigris)]/10 border border-[var(--verdigris)]/40">
                  <div className="flex justify-between">
                    <span className="text-[9px] uppercase tracking-wider text-[var(--verdigris)] font-bold">Assignee (MUTATED)</span>
                    <span className="text-[9px] text-[var(--verdigris)] font-bold">Δ FORK</span>
                  </div>
                  <p className="text-[var(--verdigris)] font-bold pt-0.5">{activeConflict.branchB.assignee}</p>
                </div>
                <div className="p-2.5 rounded bg-[var(--verdigris)]/10 border border-[var(--verdigris)]/40">
                  <div className="flex justify-between">
                    <span className="text-[9px] uppercase tracking-wider text-[var(--verdigris)] font-bold">Dependency (MUTATED)</span>
                    <span className="text-[9px] text-[var(--verdigris)] font-bold">Δ FORK</span>
                  </div>
                  <p className="text-[var(--verdigris)] font-bold pt-0.5">{activeConflict.branchB.blockingDep}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 5. RESOLUTION ACTION DECK / STRATEGY SELECTOR */}
          <div className="bg-[var(--paper-raised)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[var(--line)] pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--copper)] font-bold">
                  CLOSURE SPECIFICATION
                </span>
                <h2 className="font-display text-2xl text-[var(--ink)]">Resolution Strategy Workbench</h2>
              </div>
              <span className="font-mono text-xs text-[var(--ink-soft)]">
                Selected Strategy: <strong className="text-[var(--copper)] uppercase">{resolutionStrategy}</strong>
              </span>
            </div>

            {/* Strategy Radio Selector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1: Last-Write-Wins (LWW) */}
              <div
                onClick={() => setResolutionStrategy('lww')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all space-y-2 ${
                  resolutionStrategy === 'lww'
                    ? 'border-[var(--copper)] bg-[var(--copper)]/5 shadow-xs'
                    : 'border-[var(--border)] bg-[var(--paper)] hover:border-[var(--line)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[var(--copper)] uppercase">1. LWW-Register</span>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    resolutionStrategy === 'lww' ? 'border-[var(--copper)] bg-[var(--copper)]' : 'border-[var(--border)]'
                  }`}>
                    {resolutionStrategy === 'lww' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--paper-raised)]" />}
                  </div>
                </div>
                <h4 className="font-display text-lg text-[var(--ink)]">Timestamp Supremacy</h4>
                <p className="font-newsreader text-xs text-[var(--ink-soft)]">
                  Deterministic tie-breaking using Lamport clock coordinate. Highest clock ticks automatically win field collisions.
                </p>
              </div>

              {/* Option 2: Multi-Value Register (MVR) */}
              <div
                onClick={() => setResolutionStrategy('mvr')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all space-y-2 ${
                  resolutionStrategy === 'mvr'
                    ? 'border-[var(--ochre)] bg-[var(--ochre)]/5 shadow-xs'
                    : 'border-[var(--border)] bg-[var(--paper)] hover:border-[var(--line)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[var(--ochre)] uppercase">2. Multi-Value Set</span>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    resolutionStrategy === 'mvr' ? 'border-[var(--ochre)] bg-[var(--ochre)]' : 'border-[var(--border)]'
                  }`}>
                    {resolutionStrategy === 'mvr' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--paper-raised)]" />}
                  </div>
                </div>
                <h4 className="font-display text-lg text-[var(--ink)]">Branch Preservation</h4>
                <p className="font-newsreader text-xs text-[var(--ink-soft)]">
                  Preserve both competing branches in an OR-Set tombstone register. No user mutation is discarded.
                </p>
              </div>

              {/* Option 3: Field-by-Field Suture */}
              <div
                onClick={() => setResolutionStrategy('suture')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all space-y-2 ${
                  resolutionStrategy === 'suture'
                    ? 'border-[var(--verdigris)] bg-[var(--verdigris)]/5 shadow-xs'
                    : 'border-[var(--border)] bg-[var(--paper)] hover:border-[var(--line)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[var(--verdigris)] uppercase">3. Field Suture</span>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    resolutionStrategy === 'suture' ? 'border-[var(--verdigris)] bg-[var(--verdigris)]' : 'border-[var(--border)]'
                  }`}>
                    {resolutionStrategy === 'suture' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--paper-raised)]" />}
                  </div>
                </div>
                <h4 className="font-display text-lg text-[var(--ink)]">Surgical Stitching</h4>
                <p className="font-newsreader text-xs text-[var(--ink-soft)]">
                  Hand-pick exact field states from Branch A and Branch B to assemble the unified composite state.
                </p>
              </div>
            </div>

            {/* Field Suture Interactive Controls (if suture chosen) */}
            {resolutionStrategy === 'suture' && (
              <div className="p-4 rounded-xl bg-[var(--paper-sunken)] border border-[var(--border)] space-y-4 font-mono text-xs animate-in fade-in">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
                  <span className="font-bold text-[var(--ink)] uppercase">Surgical Field Picker</span>
                  <span className="text-[var(--ink-faint)] text-[10px]">Select branch donor per field:</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Due Date Suture */}
                  <div className="p-3 rounded bg-[var(--paper-raised)] border border-[var(--border)] space-y-2">
                    <span className="text-[9px] uppercase text-[var(--ink-faint)] block">Due Date</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSutureSelection('dueDate', 'branchA')}
                        className={`flex-1 py-1 px-2 rounded cursor-pointer ${
                          sutureSelections.dueDate === 'branchA'
                            ? 'bg-[var(--copper)] text-[var(--paper-raised)] font-bold'
                            : 'bg-[var(--paper)] border border-[var(--border)] text-[var(--ink)]'
                        }`}
                      >
                        Rep A (Nov 04)
                      </button>
                      <button
                        onClick={() => setSutureSelection('dueDate', 'branchB')}
                        className={`flex-1 py-1 px-2 rounded cursor-pointer ${
                          sutureSelections.dueDate === 'branchB'
                            ? 'bg-[var(--verdigris)] text-[var(--paper-raised)] font-bold'
                            : 'bg-[var(--paper)] border border-[var(--border)] text-[var(--ink)]'
                        }`}
                      >
                        Rep B (Nov 19)
                      </button>
                    </div>
                  </div>

                  {/* Priority Suture */}
                  <div className="p-3 rounded bg-[var(--paper-raised)] border border-[var(--border)] space-y-2">
                    <span className="text-[9px] uppercase text-[var(--ink-faint)] block">Priority</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSutureSelection('priority', 'branchA')}
                        className={`flex-1 py-1 px-2 rounded cursor-pointer ${
                          sutureSelections.priority === 'branchA'
                            ? 'bg-[var(--copper)] text-[var(--paper-raised)] font-bold'
                            : 'bg-[var(--paper)] border border-[var(--border)] text-[var(--ink)]'
                        }`}
                      >
                        Rep A (HIGH)
                      </button>
                      <button
                        onClick={() => setSutureSelection('priority', 'branchB')}
                        className={`flex-1 py-1 px-2 rounded cursor-pointer ${
                          sutureSelections.priority === 'branchB'
                            ? 'bg-[var(--verdigris)] text-[var(--paper-raised)] font-bold'
                            : 'bg-[var(--paper)] border border-[var(--border)] text-[var(--ink)]'
                        }`}
                      >
                        Rep B (NORMAL)
                      </button>
                    </div>
                  </div>

                  {/* Assignee Suture */}
                  <div className="p-3 rounded bg-[var(--paper-raised)] border border-[var(--border)] space-y-2">
                    <span className="text-[9px] uppercase text-[var(--ink-faint)] block">Assignee</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSutureSelection('assignee', 'branchA')}
                        className={`flex-1 py-1 px-2 rounded cursor-pointer ${
                          sutureSelections.assignee === 'branchA'
                            ? 'bg-[var(--copper)] text-[var(--paper-raised)] font-bold'
                            : 'bg-[var(--paper)] border border-[var(--border)] text-[var(--ink)]'
                        }`}
                      >
                        Rep A (Aarav)
                      </button>
                      <button
                        onClick={() => setSutureSelection('assignee', 'branchB')}
                        className={`flex-1 py-1 px-2 rounded cursor-pointer ${
                          sutureSelections.assignee === 'branchB'
                            ? 'bg-[var(--verdigris)] text-[var(--paper-raised)] font-bold'
                            : 'bg-[var(--paper)] border border-[var(--border)] text-[var(--ink)]'
                        }`}
                      >
                        Rep B (Meera)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Live Joined Preview & Commit Action */}
            <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-mono text-[9px] uppercase text-[var(--copper)] font-bold">
                  COMPOSITE LATTICE JOIN PREVIEW
                </span>
                <div className="font-mono text-xs text-[var(--ink)]">
                  Merged State: Due: <strong className="text-[var(--copper)]">{resolutionStrategy === 'lww' ? activeConflict.branchA.dueDate : (sutureSelections.dueDate === 'branchA' ? activeConflict.branchA.dueDate : activeConflict.branchB.dueDate)}</strong> | Priority: <strong className="text-[var(--copper)]">{resolutionStrategy === 'lww' ? activeConflict.branchA.priority : (sutureSelections.priority === 'branchA' ? activeConflict.branchA.priority : activeConflict.branchB.priority)}</strong>
                </div>
              </div>

              <button
                onClick={handleResolve}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-[var(--copper)] hover:bg-[var(--copper-deep)] text-[var(--paper-raised)] font-mono text-xs font-bold uppercase tracking-wider transition shadow-xs cursor-pointer active:scale-95"
              >
                <FileCheck className="w-4 h-4" />
                <span>Commit Join to Causal Graph &amp; Flush Op-Log</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 6. PREVIOUSLY RESOLVED FORKS AUDIT LOG */}
      {resolvedConflicts.length > 0 && (
        <section className="bg-[var(--paper-raised)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--copper)] font-bold">
              RESOLVED FORKS ARCHIVE
            </span>
            <span className="font-mono text-xs text-[var(--verdigris)] font-bold">{resolvedConflicts.length} Resolved</span>
          </div>

          <div className="space-y-2">
            {resolvedConflicts.map((res, i) => (
              <div key={i} className="p-3 rounded bg-[var(--paper)] border border-[var(--border)] flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--verdigris)]" />
                  <span className="font-bold text-[var(--ink)]">{res.title}</span>
                </div>
                <div className="flex items-center gap-4 text-[var(--ink-soft)] text-[11px]">
                  <span>STRATEGY: {res.strategy?.toUpperCase() || 'LWW'}</span>
                  <span>LCA: {res.lcaHash}</span>
                  <span className="text-[var(--verdigris)] font-bold">MERGED</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
