import { WorkspaceView } from '../components/workspace/WorkspaceView';
import { useSyncStore } from '../store/useSyncStore';
import { Chip } from '../components/ui/Chip';
import { Wifi, WifiOff, Zap } from 'lucide-react';

export function WorkspacePage() {
  const {
    isBrowserOnline,
    replicaA,
    replicaB,
    toggleReplicaOnline,
  } = useSyncStore();

  const totalPending = (replicaA.pendingOps?.length || 0) + (replicaB.pendingOps?.length || 0);

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="border-b border-[var(--line)] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--copper)] font-bold">
              01 / PEER SYNCHRONIZATION WORKBENCH
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--verdigris)]" />
            <span className="font-newsreader text-xs italic text-[var(--ink-soft)]">
              "two independent partitions converging without central locks"
            </span>
          </div>
          <h1 className="font-display text-4xl text-[var(--ink)] tracking-tight">
            Peer Replicas &amp; Local Journal
          </h1>
          <p className="font-newsreader text-base text-[var(--ink-soft)] max-w-2xl mt-1">
            Simulate independent editing on Replica A (Aarav) and Replica B (Meera). All changes are instantly written to local IndexedDB, queued in unacknowledged pending vectors, and deterministically merged upon re-connection.
          </p>
        </div>

        {/* Telemetry Chips & Fast Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Chip variant={isBrowserOnline ? 'verdigris' : 'rust'} hasDot className="text-[10px]">
            {isBrowserOnline ? (
              <span className="flex items-center gap-1">
                <Wifi className="w-3 h-3" /> NETWORK LIVE
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <WifiOff className="w-3 h-3" /> OFFLINE DISK MODE
              </span>
            )}
          </Chip>

          {totalPending > 0 ? (
            <Chip variant="copper" hasDot className="text-[10px]">
              {totalPending} PENDING OP-LOG ENTRIES
            </Chip>
          ) : (
            <Chip variant="verdigris" hasDot className="text-[10px]">
              OP-LOG FLUSHED &amp; ALIGNED
            </Chip>
          )}

          <button
            onClick={() => toggleReplicaOnline('replicaB')}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[var(--paper-raised)] border border-[var(--border)] text-[var(--ink)] font-mono text-xs hover:bg-[var(--border)] transition cursor-pointer"
            title="Toggle Replica B simulated connectivity"
          >
            <Zap className="w-3.5 h-3.5 text-[var(--ochre)]" />
            <span>Partition {replicaB.isSimulatedOnline ? 'Replica B' : 'Heal B'}</span>
          </button>
        </div>
      </div>

      {/* The Full Workspace Experience */}
      <WorkspaceView />
    </div>
  );
}
