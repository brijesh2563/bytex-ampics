import { useSyncStore } from '../store/useSyncStore';
import {
  History,
  GitCommit,
  CheckCircle2
} from 'lucide-react';

export function VersionHistoryPage() {
  const { resolvedConflicts, setActivePage } = useSyncStore();

  const historyItems = (resolvedConflicts || []).map((rc, idx) => ({
    version: `vJoin-${idx + 1}`,
    hash: rc.lcaHash || `0xJOIN_${idx}`,
    author: rc.branchA?.replica || 'Reconciliation Arbiter',
    title: `Resolved divergence on ${rc.title || 'Task'} [${rc.field || 'field'}]: Strategy '${rc.strategy || 'LWW'}'`,
    time: rc.resolvedAt ? new Date(rc.resolvedAt).toLocaleTimeString() : 'Just now',
    lamport: rc.lamportTicks || (1000 + idx * 10),
    status: 'MERGED',
    statusClass: 'bg-[var(--verdigris)]/15 text-[var(--verdigris)]',
  }));

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="border-b border-[var(--line)] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--copper)] font-bold">
              05 / CAUSAL PROVENANCE LEDGER
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--verdigris)]" />
            <span className="font-newsreader text-xs italic text-[var(--ink-soft)]">
              "immutable commit trail over partially ordered time"
            </span>
          </div>
          <h1 className="font-display text-4xl text-[var(--ink)] tracking-tight">
            Version History &amp; Linearized Stream
          </h1>
          <p className="font-newsreader text-base text-[var(--ink-soft)] max-w-2xl mt-1">
            Every CRDT operation generates an immutable cryptographic checkpoint. Browse linear ancestor history or inspect fork branches before lattice join.
          </p>
        </div>

        <button
          onClick={() => setActivePage('timeline')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[var(--copper)] hover:bg-[var(--copper-deep)] text-[var(--paper-raised)] font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs"
        >
          <History className="w-4 h-4" />
          <span>Open Interactive Scrubber</span>
        </button>
      </div>

      {/* Version History Table / Stream */}
      <div className="bg-[var(--paper-raised)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 font-mono text-xs">
          <span className="font-bold text-[var(--ink)] uppercase">Ancestry Checkpoints</span>
          <span className="text-[var(--ink-faint)]">{historyItems.length} Checkpoints</span>
        </div>

        {historyItems.length > 0 ? (
          <div className="space-y-3 font-mono text-xs">
            {historyItems.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--border)] hover:border-[var(--line)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--paper-raised)] border border-[var(--border)] flex items-center justify-center font-bold text-[var(--copper)] shrink-0 mt-0.5">
                    <GitCommit className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[var(--ink)] font-display">{item.version}</span>
                      <span className="text-[var(--copper)] font-bold text-[11px]">{item.hash}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${item.statusClass}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="font-newsreader text-sm text-[var(--ink)]">{item.title}</p>
                    <div className="flex items-center gap-4 text-[10px] text-[var(--ink-faint)]">
                      <span>{item.author}</span>
                      <span>•</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <span className="text-[10px] text-[var(--ink-soft)] bg-[var(--paper-raised)] px-2 py-1 rounded border border-[var(--border)]">
                    L#{item.lamport}
                  </span>
                  <button
                    onClick={() => setActivePage('timeline')}
                    className="px-2.5 py-1 rounded bg-[var(--paper-raised)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--ink)] text-[11px] cursor-pointer"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[var(--verdigris)] mx-auto" />
            <h3 className="font-display text-xl text-[var(--ink)]">No Prior Reconciliations in Registry</h3>
            <p className="font-newsreader text-sm text-[var(--ink-soft)] max-w-md mx-auto">
              As peer mutations collide and are resolved via deterministic join-semilattices, immutable provenance checkpoints will be recorded here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
