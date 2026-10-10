import { useSyncStore } from '../store/useSyncStore';
import {
  ArrowRight,
  Edit3,
  CheckCircle2,
  GitFork
} from 'lucide-react';

export function ConflictImpactPage() {
  const { conflicts, setActivePage } = useSyncStore();
  const activeConflict = conflicts && conflicts.length > 0 ? conflicts[0] : null;

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-300">
      {/* 1. TOP FORENSIC CALIBRATION STRIP */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-[var(--line)] gap-3 font-mono text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="tracking-widest uppercase bg-[var(--paper-raised)] text-[var(--copper)] px-2 py-0.5 border border-[var(--border)] font-bold text-[10px]">
            06 / FORENSIC IMPACT AUDIT
          </span>
          <span className="text-[var(--ink-soft)] text-[11px]">
            DIRECTED ACYCLIC DEPENDENCY ANALYSIS · SEC. IX-B
          </span>
          <div className="flex items-center gap-1.5 text-[var(--verdigris)] px-2 py-0.5 bg-[var(--verdigris)]/10 rounded font-bold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--verdigris)]" />
            DAG TOPOLOGY: VERIFIED STABLE
          </div>
        </div>
        <div className="flex items-center gap-3 text-[var(--ink-faint)] text-[11px]">
          <span>REF_EPOCH: CRDT-DAG</span>
          <span>|</span>
          <span>ACTIVE CONFLICTS: {conflicts.length}</span>
        </div>
      </div>

      {/* 2. HEADER SECTION WITH MARGINALIA */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-4">
        <div className="lg:col-span-8 space-y-2">
          <h1 className="font-display text-4xl sm:text-5xl text-[var(--ink)] font-semibold tracking-tight">
            Conflict Impact &amp; Blast Radius Instrument
          </h1>
          <p className="font-newsreader text-base sm:text-lg text-[var(--ink-soft)] max-w-3xl leading-relaxed">
            Simulate reconciliation vectors across the dependency DAG before broadcasting deltas to peer nodes. 
            Evaluate downstream cascading delays, topological compressions, and deterministic invariant hazard scores.
          </p>
        </div>

        {/* Editorial Margin Note */}
        <div className="lg:col-span-4 bg-[var(--paper-raised)] border border-[var(--border)] p-4 rounded-xl shadow-xs space-y-1 self-start lg:self-auto">
          <div className="flex items-center gap-1.5 text-[var(--copper)] pb-1">
            <Edit3 className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider">Archivist’s Marginalia</span>
          </div>
          <p className="font-newsreader text-sm italic text-[var(--ink)] leading-snug">
            “Look downstream before picking a winner. Local speed must not fracture the shared calibration chain.”
          </p>
          <div className="font-mono text-[9px] text-[var(--ink-faint)] mt-1 uppercase tracking-widest text-right">
            — NexusSync Formal Audit Sub-Vault
          </div>
        </div>
      </section>

      {/* 3. ACTIVE CONFLICT CONTEXT OR EMPTY STATE */}
      {activeConflict ? (
        <>
          <section className="bg-[var(--paper-raised)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[var(--copper)]/15 border border-[var(--copper)]/40 text-[var(--copper)] flex items-center justify-center font-mono text-sm font-bold shrink-0 rounded-lg">
                  #{String(activeConflict.conflictId || activeConflict.id).slice(-4)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display text-xl text-[var(--ink)] font-bold">
                      {activeConflict.title}
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 bg-[var(--ochre)]/20 text-[var(--ochre)] uppercase font-bold tracking-widest rounded">
                      MUTATION COLLISION DETECTED
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-[var(--ink-faint)] mt-0.5">
                    NODE IDENTITY: <span className="text-[var(--ink)]">urn:crdt:entity:{activeConflict.entityId}</span> · FIELD: <span className="text-[var(--copper)] font-bold">{activeConflict.field}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 font-mono text-xs text-[var(--ink-soft)] shrink-0">
                <div className="flex flex-col">
                  <span className="uppercase text-[9px] text-[var(--ink-faint)] tracking-widest">LCA Common Base</span>
                  <span className="font-semibold text-[var(--ink)]">{activeConflict.lcaHash || 'Origin'}</span>
                </div>
                <div className="h-6 w-px bg-[var(--line)] hidden sm:block" />
                <div className="flex flex-col">
                  <span className="uppercase text-[9px] text-[var(--ink-faint)] tracking-widest">Divergent Field</span>
                  <span className="font-semibold text-[var(--copper)]">{activeConflict.field}</span>
                </div>
              </div>
            </div>

            {/* Divergent Replica Comparison Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              {/* Replica A */}
              <div className="p-4 rounded-xl bg-[var(--paper)] border-2 border-[var(--copper)]/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--copper)] uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--copper)]" />
                    REPLICA A · {activeConflict.branchA?.replica || 'Branch A'}
                  </span>
                  <span className="text-[10px] text-[var(--copper)] bg-[var(--copper)]/15 px-2 py-0.5 rounded font-bold">
                    BRANCH A
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-[var(--ink-faint)] uppercase text-[9px] block">Proposed Value:</span>
                    <div className="text-[var(--ink)] font-bold text-sm">
                      {JSON.stringify(activeConflict.branchA?.value ?? activeConflict.branchA?.title ?? 'Branch A')}
                    </div>
                  </div>
                  <div>
                    <span className="text-[var(--ink-faint)] uppercase text-[9px] block">Resolution Action:</span>
                    <div className="text-[var(--copper)] font-bold">Adopt Branch A</div>
                  </div>
                </div>
              </div>

              {/* Replica B */}
              <div className="p-4 rounded-xl bg-[var(--paper)] border-2 border-[var(--verdigris)]/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--verdigris)] uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--verdigris)]" />
                    REPLICA B · {activeConflict.branchB?.replica || 'Branch B'}
                  </span>
                  <span className="text-[10px] text-[var(--verdigris)] bg-[var(--verdigris)]/15 px-2 py-0.5 rounded font-bold">
                    BRANCH B
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-[var(--ink-faint)] uppercase text-[9px] block">Proposed Value:</span>
                    <div className="text-[var(--ink)] font-bold text-sm">
                      {JSON.stringify(activeConflict.branchB?.value ?? activeConflict.branchB?.title ?? 'Branch B')}
                    </div>
                  </div>
                  <div>
                    <span className="text-[var(--ink-faint)] uppercase text-[9px] block">Resolution Action:</span>
                    <div className="text-[var(--verdigris)] font-bold">Adopt Branch B</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. DOWNSTREAM BLAST RADIUS DAG CASCADE VISUALIZER */}
          <section className="bg-[var(--paper-raised)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[var(--line)] pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--copper)] font-bold">
                  DAG TOPOLOGY SIMULATION
                </span>
                <h2 className="font-display text-2xl text-[var(--ink)]">Downstream Blast Radius Cascade</h2>
              </div>
              <span className="font-mono text-xs text-[var(--ink-soft)]">
                Cascade Impact: <strong className="text-[var(--ochre)]">Active entity '{activeConflict.entityId}'</strong>
              </span>
            </div>

            {/* Blast Radius Visual Canvas */}
            <div className="w-full bg-[var(--paper-sunken)] border border-[var(--border)] rounded-lg p-6 flex flex-col md:flex-row items-center justify-around gap-6 min-h-[180px]">
              {/* Node 1: Origin Conflict */}
              <div className="p-4 rounded-xl bg-[var(--paper-raised)] border-2 border-[var(--ochre)] text-center space-y-1 shadow-xs max-w-xs w-full">
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-[var(--ochre)]/20 text-[var(--ochre)] font-bold rounded">
                  ORIGIN FORK
                </span>
                <div className="font-display text-base font-bold text-[var(--ink)]">{activeConflict.title}</div>
                <p className="font-mono text-[10px] text-[var(--ink-soft)]">Divergent field: {activeConflict.field}</p>
              </div>

              <div className="flex items-center text-[var(--copper)]">
                <ArrowRight className="w-6 h-6 animate-pulse" />
              </div>

              {/* Node 2: Downstream Verification */}
              <div className="p-4 rounded-xl bg-[var(--paper-raised)] border border-[var(--border)] text-center space-y-1 shadow-xs max-w-xs w-full">
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-[var(--copper)]/20 text-[var(--copper)] font-bold rounded">
                  DAG RECONCILIATION
                </span>
                <div className="font-display text-base font-bold text-[var(--ink)]">Lattice Join Synthesis</div>
                <p className="font-mono text-[10px] text-[var(--ink-soft)]">Semilattice Lub Operator</p>
              </div>

              <div className="flex items-center text-[var(--copper)]">
                <ArrowRight className="w-6 h-6 opacity-60" />
              </div>

              {/* Node 3: Final State */}
              <div className="p-4 rounded-xl bg-[var(--paper-raised)] border border-[var(--border)] text-center space-y-1 shadow-xs max-w-xs w-full">
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-[var(--verdigris)]/20 text-[var(--verdigris)] font-bold rounded">
                  CONVERGENCE TARGET
                </span>
                <div className="font-display text-base font-bold text-[var(--ink)]">Confirmed Snapshot</div>
                <p className="font-mono text-[10px] text-[var(--ink-soft)]">Authoritative SQLite state</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-[var(--ink-faint)]">RESOLUTION READINESS</span>
                <div className="font-display text-xl text-[var(--ochre)] font-bold">Awaiting Human Approval</div>
                <p className="font-newsreader text-xs text-[var(--ink-soft)]">
                  Launch the Conflict Resolver Studio to inspect diffs and consult AI advice.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setActivePage('conflicts')}
                  className="py-2 px-4 rounded bg-[var(--copper)] hover:bg-[var(--copper-deep)] text-[var(--paper-raised)] font-bold cursor-pointer transition shadow-xs flex items-center gap-1.5"
                >
                  <GitFork className="w-4 h-4" />
                  <span>Resolve in Studio</span>
                </button>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="bg-[var(--paper-raised)] border border-[var(--border)] rounded-xl p-12 shadow-xs text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-[var(--verdigris)] mx-auto" />
          <h2 className="font-display text-2xl text-[var(--ink)] font-bold">
            Zero Active Conflicts in Database
          </h2>
          <p className="font-newsreader text-base text-[var(--ink-soft)] max-w-md mx-auto">
            All replicas are causally aligned with the authoritative backend state. No downstream dependency cascading delays or semantic DAG hazards detected.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActivePage('workspace')}
              className="px-4 py-2 rounded bg-[var(--copper)] text-[var(--paper-raised)] font-mono text-xs uppercase tracking-wider font-bold hover:bg-[var(--copper-deep)] transition cursor-pointer"
            >
              Open Peer Workspace
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
