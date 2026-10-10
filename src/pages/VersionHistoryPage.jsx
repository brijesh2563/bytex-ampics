import { useSyncStore } from '../store/useSyncStore';
import {
  History,
  GitCommit
} from 'lucide-react';

export function VersionHistoryPage() {
  const { setActivePage } = useSyncStore();

  const HISTORY_COMMITS = [
    {
      version: 'v14',
      hash: '0xEE82_F4',
      author: 'Aarav Sharma (rep_01)',
      title: 'Task #204 marked VERIFIED after convergence LUB join',
      time: '12 minutes ago',
      lamport: 15024,
      status: 'HEAD',
      statusClass: 'bg-[var(--verdigris)]/15 text-[var(--verdigris)]'
    },
    {
      version: 'v12',
      hash: '0x9M41_3A',
      author: 'Convergence Engine (Lattice Join)',
      title: 'Deterministic 3-way join suture committed across branches A & B',
      time: '24 minutes ago',
      lamport: 14840,
      status: 'MERGED',
      statusClass: 'bg-[var(--copper)]/15 text-[var(--copper)]'
    },
    {
      version: 'v10',
      hash: '0x8V11_C1',
      author: 'Meera Patel (rep_02)',
      title: 'Task #204 status updated to REVIEW on London peer',
      time: '41 minutes ago',
      lamport: 14950,
      status: 'PEER',
      statusClass: 'bg-[var(--paper)] text-[var(--ink-soft)]'
    },
    {
      version: 'v4',
      hash: '0x7Kq2x_B2',
      author: 'Aarav Sharma (rep_01)',
      title: 'Priority elevated to HIGH during local offline interval',
      time: '1 hour ago',
      lamport: 14829,
      status: 'FORK_A',
      statusClass: 'bg-[var(--ochre)]/15 text-[var(--ochre)]'
    },
    {
      version: 'v2',
      hash: '0x2F81_A8',
      author: 'Aarav Sharma (rep_01)',
      title: 'Common base state: Title set to Produce 200 observatory badges',
      time: '2 hours ago',
      lamport: 14800,
      status: 'BASE_LCA',
      statusClass: 'bg-[var(--paper)] text-[var(--ink-soft)]'
    },
    {
      version: 'v0',
      hash: '0x0000_00',
      author: 'System Genesis Root',
      title: 'Initial CRDT document state space initialized',
      time: 'Genesis',
      lamport: 14780,
      status: 'ROOT',
      statusClass: 'bg-[var(--paper)] text-[var(--ink-faint)]'
    }
  ];

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
          <span className="text-[var(--ink-faint)]">6 Immutable Epochs</span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {HISTORY_COMMITS.map((item, idx) => (
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
      </div>
    </div>
  );
}
