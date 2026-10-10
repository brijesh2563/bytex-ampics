import { useSyncStore } from '../store/useSyncStore';
import {
  Sliders,
  Zap,
  Shuffle,
  GitBranch,
  Radio
} from 'lucide-react';

export function ConvergenceLabPage() {
  const {
    networkDriftMs,
    setNetworkDriftMs,
    chaosFlags,
    toggleChaosFlag,
    triggerCatastrophe,
    chaosEvents,
    replicaA,
    replicaB,
  } = useSyncStore();

  const handlePresetTrigger = (preset) => {
    triggerCatastrophe(preset);
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-300">
      {/* 1. EDITORIAL HEADER & FIELD NOTE */}
      <section className="border-b border-[var(--line)] pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--copper)] px-2 py-0.5 bg-[var(--paper-raised)] border border-[var(--border)] rounded font-bold">
                01 / EMPIRICAL LAB &amp; CHAOS SIMULATOR
              </span>
              <span className="w-8 h-[1px] bg-[var(--line)]" />
              <span className="font-mono text-[10px] text-[var(--ink-faint)]">SUB-SPEC 994.2026.CRDT</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl text-[var(--ink)] tracking-tight leading-tight">
              Empirical <span className="italic text-[var(--copper)] font-normal">Chaos</span> &amp; Invariant Laboratory
            </h1>
            <p className="font-newsreader text-base sm:text-lg text-[var(--ink-soft)] max-w-2xl">
              Inject arbitrary network partitions, asymmetric latency, and bit-level packet reordering across simulated regional clusters. Verify real-time monotonic state convergence against 128-bit Merkle invariants.
            </p>
          </div>

          {/* Tactical Handwriting / Field Note #714 */}
          <div className="bg-[var(--paper-raised)] border border-[var(--border)] p-4 rounded-lg shadow-xs max-w-xs self-start md:-rotate-2 transition-transform hover:rotate-0 duration-300 shrink-0">
            <div className="flex items-center gap-1.5 text-[var(--copper)] mb-1">
              <Radio className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider">Field Note #714</span>
            </div>
            <p className="font-newsreader text-sm italic text-[var(--ink)] leading-snug">
              “stress testing up to 100,000 asynchronous partitions under asymmetric churn”
            </p>
            <div className="font-mono text-[9px] text-[var(--ink-faint)] mt-1">Calibrated at Zenith Ref: 104.28 GHz</div>
          </div>
        </div>
      </section>

      {/* 2. CHAOS CONTROL CONSOLE (4 COLS) & CLUSTER TOPOLOGY MESH (8 COLS) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Fault Injection Console (4 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[var(--paper-raised)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[var(--copper)]" />
                <span className="font-mono text-xs uppercase font-bold text-[var(--ink)] tracking-wide">
                  Fault Injection Deck
                </span>
              </div>
              <span className="font-mono text-[10px] text-[var(--copper)] font-bold px-2 py-0.5 rounded bg-[var(--copper)]/10">
                CHAOS: ENGAGED
              </span>
            </div>

            {/* Artificial Latency Slider */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between font-mono text-xs">
                <span className="uppercase text-[var(--ink-soft)] text-[10px] tracking-wider">Artificial Network Drift</span>
                <span className="font-bold text-[var(--copper)] text-base">{networkDriftMs} ms</span>
              </div>
              <input
                type="range"
                min="0"
                max="2000"
                step="20"
                value={networkDriftMs}
                onChange={(e) => setNetworkDriftMs(Number(e.target.value))}
                className="w-full accent-[var(--copper)] cursor-pointer"
              />
              <div className="flex justify-between font-mono text-[9px] text-[var(--ink-faint)] px-1 select-none">
                <span>0ms</span>
                <span>500ms</span>
                <span>1000ms</span>
                <span>1500ms</span>
                <span>2000ms</span>
              </div>
            </div>

            {/* Mechanical Fault Toggles */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] text-[var(--ink-faint)] uppercase tracking-widest block">
                Network Mutation Flags
              </span>

              {/* Toggle 1: Drop Packets */}
              <label
                onClick={() => toggleChaosFlag('dropPackets')}
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--paper)] border border-[var(--border)] shadow-2xs cursor-pointer hover:border-[var(--line)] transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-sans text-xs font-semibold text-[var(--ink)]">Drop Packets (25% loss)</span>
                  <span className="font-mono text-[10px] text-[var(--rust)]">Simulated stochastic link sever</span>
                </div>
                <input
                  type="checkbox"
                  checked={chaosFlags.dropPackets}
                  readOnly
                  className="w-4 h-4 accent-[var(--copper)] cursor-pointer"
                />
              </label>

              {/* Toggle 2: Duplicate Op Deliveries */}
              <label
                onClick={() => toggleChaosFlag('duplicateOps')}
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--paper)] border border-[var(--border)] shadow-2xs cursor-pointer hover:border-[var(--line)] transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-sans text-xs font-semibold text-[var(--ink)]">Duplicate Op Deliveries</span>
                  <span className="font-mono text-[10px] text-[var(--ink-soft)]">Replay attack / ghost duplicate echo</span>
                </div>
                <input
                  type="checkbox"
                  checked={chaosFlags.duplicateOps}
                  readOnly
                  className="w-4 h-4 accent-[var(--copper)] cursor-pointer"
                />
              </label>

              {/* Toggle 3: Out-of-Order */}
              <label
                onClick={() => toggleChaosFlag('outOfOrder')}
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--paper)] border border-[var(--border)] shadow-2xs cursor-pointer hover:border-[var(--line)] transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-sans text-xs font-semibold text-[var(--ink)]">Arbitrary Out-of-Order</span>
                  <span className="font-mono text-[10px] text-[var(--ochre)]">Entropy shuffling of Lamport vectors</span>
                </div>
                <input
                  type="checkbox"
                  checked={chaosFlags.outOfOrder}
                  readOnly
                  className="w-4 h-4 accent-[var(--copper)] cursor-pointer"
                />
              </label>

              {/* Toggle 4: Asymmetric Partition */}
              <label
                onClick={() => toggleChaosFlag('asymmetricPartition')}
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--paper)] border border-[var(--border)] shadow-2xs cursor-pointer hover:border-[var(--line)] transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-sans text-xs font-semibold text-[var(--ink)]">Asymmetric Partition</span>
                  <span className="font-mono text-[10px] text-[var(--ink-faint)]">Bipartite split-brain Tokyo &amp; London</span>
                </div>
                <input
                  type="checkbox"
                  checked={chaosFlags.asymmetricPartition}
                  readOnly
                  className="w-4 h-4 accent-[var(--copper)] cursor-pointer"
                />
              </label>
            </div>

            {/* Pre-Engineered Chaos Scenarios */}
            <div className="pt-2">
              <span className="font-mono text-[10px] text-[var(--ink-faint)] uppercase tracking-widest block mb-2">
                Pre-Engineered Catastrophes
              </span>
              <div className="grid grid-cols-1 gap-2 font-mono text-xs">
                <button
                  onClick={() => handlePresetTrigger('duplicate_storm')}
                  className="w-full py-2 px-3 text-left bg-[var(--paper)] hover:bg-[var(--copper)] hover:text-[var(--paper-raised)] border border-[var(--border)] text-[var(--ink)] rounded flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
                >
                  <span>• Duplicate Storm (10k ops)</span>
                  <Zap className="w-3.5 h-3.5 text-[var(--ochre)]" />
                </button>
                <button
                  onClick={() => handlePresetTrigger('split_brain')}
                  className="w-full py-2 px-3 text-left bg-[var(--paper)] hover:bg-[var(--copper)] hover:text-[var(--paper-raised)] border border-[var(--border)] text-[var(--ink)] rounded flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
                >
                  <span>• Split-Brain Partition</span>
                  <GitBranch className="w-3.5 h-3.5 text-[var(--rust)]" />
                </button>
                <button
                  onClick={() => handlePresetTrigger('reorder_cascade')}
                  className="w-full py-2 px-3 text-left bg-[var(--paper)] hover:bg-[var(--copper)] hover:text-[var(--paper-raised)] border border-[var(--border)] text-[var(--ink)] rounded flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
                >
                  <span>• Reorder Cascade</span>
                  <Shuffle className="w-3.5 h-3.5 text-[var(--copper)]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Cluster Mesh Visualizer & Audit Monitor (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-[var(--paper-raised)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase text-[var(--copper)] font-bold">
                  REGIONAL TOPOLOGY MESH
                </span>
                <h3 className="font-display text-xl text-[var(--ink)]">3-Cluster Asynchronous Gossip</h3>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs text-[var(--verdigris)]">
                <span className="w-2 h-2 rounded-full bg-[var(--verdigris)] animate-ping" />
                <span>MESH HEALTH: SECURE</span>
              </div>
            </div>

            {/* SVG Cluster Topology Drawing */}
            <div className="w-full bg-[var(--paper-sunken)] border border-[var(--border)] rounded-lg p-4 relative min-h-[300px] flex items-center justify-center overflow-hidden">
              <svg className="w-full min-w-[500px] h-64" viewBox="0 0 540 260">
                {/* Triangular Mesh Coordinate Lines */}
                <line
                  x1="120"
                  y1="80"
                  x2="420"
                  y2="80"
                  stroke="currentColor"
                  className={chaosFlags.asymmetricPartition ? "text-[var(--rust)]" : "text-[var(--border)]"}
                  strokeWidth={chaosFlags.asymmetricPartition ? "2" : "1.5"}
                  strokeDasharray={chaosFlags.asymmetricPartition ? "4 4" : "none"}
                />
                <line
                  x1="120"
                  y1="80"
                  x2="270"
                  y2="210"
                  stroke="currentColor"
                  className="text-[var(--border)]"
                  strokeWidth="1.5"
                />
                <line
                  x1="420"
                  y1="80"
                  x2="270"
                  y2="210"
                  stroke="currentColor"
                  className="text-[var(--border)]"
                  strokeWidth="1.5"
                />

                {/* Animated Flying Signal Particles */}
                <circle cx="270" cy="80" r="4" fill="var(--copper)">
                  <animate attributeName="cx" values="120;420;120" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="200" cy="140" r="3" fill="var(--verdigris)">
                  <animate attributeName="cx" values="120;270;120" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="80;210;80" dur="2.4s" repeatCount="indefinite" />
                </circle>

                {/* Node A: Tokyo (Aarav) */}
                <g className="cursor-pointer">
                  <circle cx="120" cy="80" r="28" fill="var(--paper-raised)" stroke="var(--copper)" strokeWidth="2" />
                  <text x="120" y="75" textAnchor="middle" className="font-mono text-[10px] fill-[var(--ink)] font-bold">NODE A</text>
                  <text x="120" y="90" textAnchor="middle" className="font-mono text-[8px] fill-[var(--copper)]">Tokyo (Aarav)</text>
                  <circle cx="120" cy="115" r="3" fill={replicaA.effectiveOnline ? "var(--verdigris)" : "var(--rust)"} />
                  <text x="120" y="128" textAnchor="middle" className="font-mono text-[7px] fill-[var(--ink-faint)]">
                    {replicaA.effectiveOnline ? "LIVE" : "PARTITIONED"}
                  </text>
                </g>

                {/* Node B: London (Meera) */}
                <g className="cursor-pointer">
                  <circle cx="420" cy="80" r="28" fill="var(--paper-raised)" stroke="var(--verdigris)" strokeWidth="2" />
                  <text x="420" y="75" textAnchor="middle" className="font-mono text-[10px] fill-[var(--ink)] font-bold">NODE B</text>
                  <text x="420" y="90" textAnchor="middle" className="font-mono text-[8px] fill-[var(--verdigris)]">London (Meera)</text>
                  <circle cx="420" cy="115" r="3" fill={replicaB.effectiveOnline ? "var(--verdigris)" : "var(--rust)"} />
                  <text x="420" y="128" textAnchor="middle" className="font-mono text-[7px] fill-[var(--ink-faint)]">
                    {replicaB.effectiveOnline ? "LIVE" : "PARTITIONED"}
                  </text>
                </g>

                {/* Node C: Zurich Gateway (Engine) */}
                <g className="cursor-pointer">
                  <circle cx="270" cy="210" r="30" fill="var(--paper-raised)" stroke="var(--ochre)" strokeWidth="2" />
                  <text x="270" y="206" textAnchor="middle" className="font-mono text-[10px] fill-[var(--ink)] font-bold">NODE C</text>
                  <text x="270" y="220" textAnchor="middle" className="font-mono text-[8px] fill-[var(--ochre)]">Zurich Gateway</text>
                </g>
              </svg>
            </div>

            {/* Live Invariant Audit Monitor */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded bg-[var(--paper)] border border-[var(--border)]">
                <span className="text-[9px] uppercase text-[var(--ink-faint)] block">128-Bit Merkle Root</span>
                <div className="font-mono text-[11px] font-bold text-[var(--ink)] mt-0.5 truncate">
                  e9281a8c88fd12a4
                </div>
                <span className="text-[9px] text-[var(--verdigris)] mt-1 block">✓ Cryptographically Aligned</span>
              </div>
              <div className="p-3 rounded bg-[var(--paper)] border border-[var(--border)]">
                <span className="text-[9px] uppercase text-[var(--ink-faint)] block">Monotonic Inflation</span>
                <div className="font-display text-lg text-[var(--copper)] mt-0.5">100.0% Verified</div>
                <span className="text-[9px] text-[var(--ink-soft)] mt-1 block">Bounded Semilattice</span>
              </div>
              <div className="p-3 rounded bg-[var(--paper)] border border-[var(--border)]">
                <span className="text-[9px] uppercase text-[var(--ink-faint)] block">Idempotent Join</span>
                <div className="font-display text-lg text-[var(--verdigris)] mt-0.5">1.000000 φ</div>
                <span className="text-[9px] text-[var(--verdigris)] mt-1 block">Permutation Invariant</span>
              </div>
            </div>
          </div>

          {/* Real-Time Chaos Event Ledger Stream */}
          <div className="bg-[var(--paper-raised)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
              <span className="font-bold text-[var(--ink)] uppercase text-[10px]">Chaos Activity Ledger</span>
              <span className="text-[var(--ink-faint)] text-[9px]">{chaosEvents.length} Recent Log Traces</span>
            </div>

            {chaosEvents.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {chaosEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2 rounded bg-[var(--paper)] border border-[var(--border)] flex items-start justify-between gap-3 text-[11px]"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--ink-faint)] text-[9px]">{ev.time}</span>
                        <span className="font-bold text-[var(--copper)] text-[10px]">{ev.type}</span>
                      </div>
                      <p className="text-[var(--ink)] font-sans text-xs">{ev.desc}</p>
                    </div>
                    <span className="text-[var(--ink-faint)] text-[10px] shrink-0">L#{ev.lamport}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-[var(--ink-faint)] text-[11px] bg-[var(--paper)] rounded border border-dashed border-[var(--border)]">
                No artificial faults injected yet. Toggle fault flags or partition a node to log telemetry.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
