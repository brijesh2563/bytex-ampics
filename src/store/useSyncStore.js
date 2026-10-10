import { create } from 'zustand';
import {
  saveTaskLocally,
  getTasksForReplica,
  queuePendingOperation,
  getPendingOperations,
  removePendingOperationByOpId,
} from '../core/idb';
import { syncClient, DEFAULT_PROJECT_ID } from '../core/syncClient';

/**
 * SEED_TASKS is kept empty for production runtime.
 * Real tasks are loaded dynamically from the backend SQLite database.
 */
export const SEED_TASKS = [];


/**
 * Normalizes a raw backend ConflictRecord for consistent display across all frontend views.
 */
function normalizeConflict(raw, tasks = []) {
  if (!raw) return null;
  const conflictId = raw.conflictId || raw.id || `conf_${Date.now()}`;
  const entityId = raw.entityId || raw.taskCardId || 'task-unknown';
  const task = tasks.find((t) => t.id === entityId) || {};
  const field = raw.field || 'title';

  const valA = raw.branchA?.value !== undefined ? raw.branchA.value : raw.branchA?.title || 'Branch A';
  const valB = raw.branchB?.value !== undefined ? raw.branchB.value : raw.branchB?.title || 'Branch B';

  return {
    ...raw,
    id: conflictId,
    conflictId,
    entityId,
    taskCardId: entityId,
    field,
    type: raw.type || 'CONCURRENT_FIELD_COLLISION',
    title: task.title || raw.title || `Task ${entityId}`,
    lcaHash: raw.lcaHash || '0x' + conflictId.slice(-7),
    deltaSize: raw.deltaSize || '1.42 KB',
    lamportTicks: raw.branchA?.timestamp ? Math.floor(raw.branchA.timestamp / 1000) : (raw.lamportTicks || 2841),
    status: raw.status || 'UNRESOLVED',
    base: {
      version: `v${task.version || 1} · Baseline`,
      clock: '[10, 10]',
      title: task.title || 'Workspace Task',
      dueDate: task.dueDate || 'Open Date',
      priority: task.priority || 'MEDIUM',
      assignee: 'Shared Workspace',
      blockingDep: task.dependencies?.join(', ') || 'None',
      ...raw.base,
    },
    branchA: {
      replica: `Replica A (${raw.branchA?.replicaId || 'r_aarav-lap'})`,
      version: 'vFork-A',
      clock: '[12, 10]',
      title: field === 'title' ? String(valA) : (task.title || 'Task'),
      dueDate: field === 'dueDate' ? String(valA) : (task.dueDate || 'Nov 04, 2026'),
      priority: field === 'priority' ? String(valA) : (task.priority || 'HIGH'),
      assignee: field === 'assignee' ? String(valA) : 'Aarav Sharma',
      blockingDep: task.dependencies?.join(', ') || 'Root #101',
      value: valA,
      ...raw.branchA,
    },
    branchB: {
      replica: `Replica B (${raw.branchB?.replicaId || 'r_meera-ph'})`,
      version: 'vFork-B',
      clock: '[10, 13]',
      title: field === 'title' ? String(valB) : (task.title || 'Task'),
      dueDate: field === 'dueDate' ? String(valB) : (task.dueDate || 'Nov 19, 2026'),
      priority: field === 'priority' ? String(valB) : (task.priority || 'NORMAL'),
      assignee: field === 'assignee' ? String(valB) : 'Meera Patel',
      blockingDep: 'Unlinked Block',
      value: valB,
      ...raw.branchB,
    },
  };
}

/**
 * Derives the truthful dial state based strictly on real metrics.
 */
function deriveTruthfulDialState(replicaA, replicaB, conflicts = []) {
  const isOnlineA = replicaA.effectiveOnline;
  const isOnlineB = replicaB.effectiveOnline;
  const pendingCount = (replicaA.pendingOps?.length || 0) + (replicaB.pendingOps?.length || 0);

  if (conflicts.length > 0) {
    return {
      dialState: 'CONFLICT',
      driftOps: pendingCount,
      failingInvariant: 'Semantic conflict quarantined in active SQLite state',
    };
  }

  if (!isOnlineA || !isOnlineB || pendingCount > 0) {
    return {
      dialState: 'DIVERGING',
      driftOps: pendingCount,
      failingInvariant: null,
    };
  }

  return {
    dialState: 'SYNCED',
    driftOps: 0,
    failingInvariant: null,
  };
}

export const useSyncStore = create((set, get) => ({
  // Browser Network State
  isBrowserOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isInitialized: false,

  // Real Backend Socket.IO Connection State
  serverConnected: false,
  serverHealth: null,
  syncError: null,
  projectId: DEFAULT_PROJECT_ID,

  // Replicas State
  replicaA: {
    id: 'r_aarav-lap',
    name: "Aarav's Laptop (Replica A)",
    partition: 'active_ops_partition_a',
    isSimulatedOnline: true,
    effectiveOnline: true,
    version: 1,
    clientSeq: 1,
    lamportClock: 1,
    lastServerSeq: 0,
    versionVector: { 'r_aarav-lap': 1 },
    tasks: [],
    pendingOps: [],
  },
  replicaB: {
    id: 'r_meera-ph',
    name: "Meera's Phone (Replica B)",
    partition: 'active_ops_partition_b',
    isSimulatedOnline: true,
    effectiveOnline: true,
    version: 1,
    clientSeq: 1,
    lamportClock: 1,
    lastServerSeq: 0,
    versionVector: { 'r_meera-ph': 1 },
    tasks: [],
    pendingOps: [],
  },

  // Active Page Navigation
  activePage: typeof window !== 'undefined' && window.location.hash
    ? window.location.hash.replace('#', '') || 'observatory'
    : 'observatory',

  // Observatory Theme (light / dark)
  theme: typeof localStorage !== 'undefined' && localStorage.getItem('nexussync_theme') === 'dark'
    ? 'dark'
    : 'light',

  // Operator Auth & Session State
  user: {
    id: 'op_aarav',
    name: 'Aarav Sharma',
    email: 'aarav@nexussync.org',
    role: 'CHIEF OPERATOR',
    replicaId: 'r_aarav-lap',
    region: 'ap-northeast-1 (Tokyo)',
    isAdmin: true,
    accessLevel: 'TIER-0 ARBITER',
    authMode: 'LOCAL / DEMO',
    sessionType: 'LOCAL OPERATOR',
    ed25519Fingerprint: '7F8C·914B·22D1·D91A',
    isAuthenticated: true,
  },

  // Loading and Error State
  isLoadingWorkspace: true,
  workspaceLoadError: null,

  // Active Conflicts (Truthfully empty; populated only from server snapshot or real-time conflict engine)
  conflicts: [],

  // Conflict Resolver Interactive State
  resolutionStrategy: 'lww', // 'lww' | 'mvr' | 'suture'
  sutureSelections: {
    dueDate: 'branchA',
    priority: 'branchA',
    assignee: 'branchB',
    blockingDep: 'branchA',
  },
  resolvedConflicts: [],

  // AI Conflict Advisor Interactive State
  advisorLoading: false,
  advisorError: null,
  advisorAnalysis: null,

  // Convergence Lab & Chaos Simulator State (Truthful event log, starts empty)
  chaosEngaged: false,
  networkDriftMs: 0,
  chaosFlags: {
    dropPackets: false,
    duplicateOps: false,
    outOfOrder: false,
    asymmetricPartition: false,
  },
  chaosEvents: [],

  // Vector Timeline Scrubber State
  timelineEpoch: 0,
  selectedOpId: null,
  isPlayingTimeline: false,

  // Truthful Dial Parameters
  dialState: 'SYNCED',
  driftOps: 0,
  stateHash: '00000000',
  isHashMatching: true,
  failingInvariant: null,

  // --------------------------------------------------------------------------
  // Initialization & Socket.IO Binding
  // --------------------------------------------------------------------------
  initWorkspace: async () => {
    if (get().isInitialized) return;

    try {
      // 1. Restore genuine local IndexedDB tasks & pending queues without fake seeding
      const tasksA = await getTasksForReplica('r_aarav-lap');
      const pendingOpsA = await getPendingOperations('r_aarav-lap');

      const tasksB = await getTasksForReplica('r_meera-ph');
      const pendingOpsB = await getPendingOperations('r_meera-ph');

      const browserOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

      set((state) => {
        const replicaA = {
          ...state.replicaA,
          tasks: tasksA,
          pendingOps: pendingOpsA,
          effectiveOnline: browserOnline && state.replicaA.isSimulatedOnline,
        };
        const replicaB = {
          ...state.replicaB,
          tasks: tasksB,
          pendingOps: pendingOpsB,
          effectiveOnline: browserOnline && state.replicaB.isSimulatedOnline,
        };
        const derived = deriveTruthfulDialState(replicaA, replicaB, state.conflicts);

        return {
          isInitialized: true,
          isBrowserOnline: browserOnline,
          replicaA,
          replicaB,
          ...derived,
        };
      });

      // 2. Initialize Socket.IO connection
      const socket = syncClient.init();

      // Track connection status
      syncClient.onStatusChange((status) => {
        const isConnected = status === 'CONNECTED';
        set({ serverConnected: isConnected });
        if (isConnected) {
          get().performHandshakesAndCatchup();
        }
      });

      // Register backend event listeners
      socket.on('server:catchup', (data) => {
        get().handleServerCatchup(data);
      });

      socket.on('server:ack-ops', (data) => {
        get().handleServerAckOps(data);
      });

      socket.on('server:broadcast-ops', (data) => {
        get().handleServerBroadcastOps(data);
      });

      socket.on('server:conflict-detected', (data) => {
        get().handleServerConflictDetected(data);
      });

      socket.on('server:conflict-resolved', (data) => {
        get().handleServerConflictResolved(data);
      });

      socket.on('server:error', (error) => {
        console.warn('[NexusSync] Server reported sync error:', error);
        set({ syncError: error?.message || 'Server sync error' });
      });

      // 3. Query cluster health and server snapshot
      try {
        const health = await syncClient.fetchHealth();
        set({ serverHealth: health });
      } catch (err) {
        console.info('[NexusSync] Backend health check pending or offline:', err.message);
      }

      try {
        const snapshotRes = await syncClient.fetchSnapshot(DEFAULT_PROJECT_ID);
        if (snapshotRes?.success && snapshotRes.data) {
          const rawTasks = snapshotRes.data.tasks || [];
          const serverTasks = rawTasks.map((t) => ({
            ...t,
            syncStatus: 'CONFIRMED',
          }));
          const serverConflicts = snapshotRes.data.unresolvedConflicts || [];

          set((state) => {
            // Only keep local tasks if they are currently unacknowledged in pendingOps
            const pendingOpsA = state.replicaA.pendingOps || [];
            const pendingOpsB = state.replicaB.pendingOps || [];
            const pendingIdsA = new Set(pendingOpsA.map((o) => o.entityId));
            const pendingIdsB = new Set(pendingOpsB.map((o) => o.entityId));

            const pendingLocalA = (state.replicaA.tasks || []).filter((t) => pendingIdsA.has(t.id));
            const pendingLocalB = (state.replicaB.tasks || []).filter((t) => pendingIdsB.has(t.id));

            const tasksA = [...serverTasks, ...pendingLocalA.filter((pt) => !serverTasks.some((st) => st.id === pt.id))];
            const tasksB = [...serverTasks, ...pendingLocalB.filter((pt) => !serverTasks.some((st) => st.id === pt.id))];

            const replicaA = {
              ...state.replicaA,
              tasks: tasksA,
              lastServerSeq: Math.max(state.replicaA.lastServerSeq || 0, snapshotRes.data.serverSeq || 0),
            };
            const replicaB = {
              ...state.replicaB,
              tasks: tasksB,
              lastServerSeq: Math.max(state.replicaB.lastServerSeq || 0, snapshotRes.data.serverSeq || 0),
            };

            const normalized = serverConflicts.map((c) => normalizeConflict(c, serverTasks));
            const derived = deriveTruthfulDialState(replicaA, replicaB, normalized);

            return {
              replicaA,
              replicaB,
              conflicts: normalized,
              isLoadingWorkspace: false,
              workspaceLoadError: null,
              ...derived,
            };
          });
        }
      } catch (err) {
        console.info('[NexusSync] Initial snapshot query error:', err.message);
        set({
          isLoadingWorkspace: false,
          workspaceLoadError: err.message || 'Failed to connect to backend snapshot',
        });
      }

      // If socket already connected, perform immediate handshakes
      if (syncClient.isConnected) {
        get().performHandshakesAndCatchup();
      }
    } catch (err) {
      console.error('Failed to initialize workspace:', err);
    }
  },

  // --------------------------------------------------------------------------
  // Socket.IO Protocol Handlers
  // --------------------------------------------------------------------------
  performHandshakesAndCatchup: async () => {
    const state = get();
    const projectId = state.projectId;

    // Handshake for Replica A if online
    if (state.replicaA.effectiveOnline) {
      try {
        await syncClient.handshake({
          replicaId: state.replicaA.id,
          projectId,
          lastServerSeq: state.replicaA.lastServerSeq || 0,
          knownVector: state.replicaA.versionVector || {},
        });
        await get().flushPendingOperations('replicaA');
      } catch (err) {
        console.warn(`[NexusSync] Handshake failed for ${state.replicaA.id}:`, err.message);
      }
    }

    // Handshake for Replica B if online
    if (state.replicaB.effectiveOnline) {
      try {
        await syncClient.handshake({
          replicaId: state.replicaB.id,
          projectId,
          lastServerSeq: state.replicaB.lastServerSeq || 0,
          knownVector: state.replicaB.versionVector || {},
        });
        await get().flushPendingOperations('replicaB');
      } catch (err) {
        console.warn(`[NexusSync] Handshake failed for ${state.replicaB.id}:`, err.message);
      }
    }
  },

  handleServerCatchup: (catchup) => {
    if (!catchup) return;
    const { currentServerSeq, missedOps, unresolvedConflicts } = catchup;

    set((state) => {
      let replicaA = { ...state.replicaA };
      let replicaB = { ...state.replicaB };

      if (currentServerSeq) {
        replicaA.lastServerSeq = Math.max(replicaA.lastServerSeq, currentServerSeq);
        replicaB.lastServerSeq = Math.max(replicaB.lastServerSeq, currentServerSeq);
      }

      // Apply missed ops to tasks
      if (Array.isArray(missedOps) && missedOps.length > 0) {
        for (const op of missedOps) {
          if (op.type === 'TASK_UPDATE_FIELD' && op.payload) {
            const { entityId, field, newValue } = op.payload;
            replicaA.tasks = replicaA.tasks.map((t) => (t.id === entityId ? { ...t, [field]: newValue } : t));
            replicaB.tasks = replicaB.tasks.map((t) => (t.id === entityId ? { ...t, [field]: newValue } : t));
          } else if (op.type === 'TASK_CREATE' && op.payload) {
            const newTask = { ...op.payload, id: op.entityId || op.payload.entityId, syncStatus: 'CONFIRMED' };
            if (!replicaA.tasks.find((t) => t.id === newTask.id)) replicaA.tasks = [...replicaA.tasks, newTask];
            if (!replicaB.tasks.find((t) => t.id === newTask.id)) replicaB.tasks = [...replicaB.tasks, newTask];
          }
        }
      }

      // Merge unresolved conflicts
      let nextConflicts = [...state.conflicts];
      if (Array.isArray(unresolvedConflicts) && unresolvedConflicts.length > 0) {
        const normalized = unresolvedConflicts.map((c) => normalizeConflict(c, replicaA.tasks));
        nextConflicts = normalized;
      }

      const derived = deriveTruthfulDialState(replicaA, replicaB, nextConflicts);
      return { replicaA, replicaB, conflicts: nextConflicts, ...derived };
    });
  },

  handleServerAckOps: async (data) => {
    if (!data?.acks || !Array.isArray(data.acks)) return;

    for (const ack of data.acks) {
      if (ack.status === 'ACCEPTED' || ack.status === 'DUPLICATE_IGNORED') {
        // Clear from both replica IDB queues if present
        await removePendingOperationByOpId('r_aarav-lap', ack.opId);
        await removePendingOperationByOpId('r_meera-ph', ack.opId);

        set((state) => {
          const filterPending = (ops) => ops.filter((o) => o.opId !== ack.opId && o.id !== ack.opId);
          const confirmTask = (tasks) => tasks.map((t) => (t.syncStatus === 'PENDING_SYNC' ? { ...t, syncStatus: 'CONFIRMED' } : t));

          const replicaA = {
            ...state.replicaA,
            pendingOps: filterPending(state.replicaA.pendingOps),
            tasks: confirmTask(state.replicaA.tasks),
            lastServerSeq: ack.serverSeq ? Math.max(state.replicaA.lastServerSeq, ack.serverSeq) : state.replicaA.lastServerSeq,
          };

          const replicaB = {
            ...state.replicaB,
            pendingOps: filterPending(state.replicaB.pendingOps),
            tasks: confirmTask(state.replicaB.tasks),
            lastServerSeq: ack.serverSeq ? Math.max(state.replicaB.lastServerSeq, ack.serverSeq) : state.replicaB.lastServerSeq,
          };

          const derived = deriveTruthfulDialState(replicaA, replicaB, state.conflicts);
          return { replicaA, replicaB, ...derived };
        });
      } else if (ack.status === 'QUARANTINED') {
        set((state) => {
          const tagQuarantine = (tasks) => tasks.map((t) => ({ ...t, isHeld: true }));
          return {
            replicaA: { ...state.replicaA, tasks: tagQuarantine(state.replicaA.tasks) },
            replicaB: { ...state.replicaB, tasks: tagQuarantine(state.replicaB.tasks) },
          };
        });
      }
    }
  },

  handleServerBroadcastOps: (data) => {
    if (!data?.operations || !Array.isArray(data.operations)) return;

    set((state) => {
      let replicaA = { ...state.replicaA };
      let replicaB = { ...state.replicaB };

      for (const op of data.operations) {
        if (op.type === 'TASK_UPDATE_FIELD' && op.payload) {
          const { entityId, field, newValue } = op.payload;
          const updateFn = (t) => (t.id === entityId ? { ...t, [field]: newValue, version: (t.version || 1) + 1 } : t);

          // Apply to Replica A if not submitter
          if (op.replicaId !== replicaA.id && replicaA.effectiveOnline) {
            replicaA.tasks = replicaA.tasks.map(updateFn);
            if (op.serverSeq) replicaA.lastServerSeq = Math.max(replicaA.lastServerSeq, op.serverSeq);
          }
          // Apply to Replica B if not submitter
          if (op.replicaId !== replicaB.id && replicaB.effectiveOnline) {
            replicaB.tasks = replicaB.tasks.map(updateFn);
            if (op.serverSeq) replicaB.lastServerSeq = Math.max(replicaB.lastServerSeq, op.serverSeq);
          }
        } else if (op.type === 'TASK_CREATE' && op.payload) {
          const newTask = { ...op.payload, id: op.entityId || op.payload.entityId, syncStatus: 'CONFIRMED' };
          if (op.replicaId !== replicaA.id && replicaA.effectiveOnline && !replicaA.tasks.find((t) => t.id === newTask.id)) {
            replicaA.tasks = [...replicaA.tasks, newTask];
          }
          if (op.replicaId !== replicaB.id && replicaB.effectiveOnline && !replicaB.tasks.find((t) => t.id === newTask.id)) {
            replicaB.tasks = [...replicaB.tasks, newTask];
          }
        }
      }

      const derived = deriveTruthfulDialState(replicaA, replicaB, state.conflicts);
      return { replicaA, replicaB, ...derived };
    });
  },

  handleServerConflictDetected: (data) => {
    if (!data?.conflict) return;
    const rawConflict = data.conflict;

    set((state) => {
      const normalized = normalizeConflict(rawConflict, state.replicaA.tasks);
      const exists = state.conflicts.some((c) => c.conflictId === normalized.conflictId);
      const nextConflicts = exists
        ? state.conflicts.map((c) => (c.conflictId === normalized.conflictId ? normalized : c))
        : [normalized, ...state.conflicts];

      const derived = deriveTruthfulDialState(state.replicaA, state.replicaB, nextConflicts);
      return { conflicts: nextConflicts, ...derived };
    });
  },

  handleServerConflictResolved: (data) => {
    if (!data?.conflictId) return;
    const { conflictId, resolutionOp } = data;

    set((state) => {
      const targetConflict = state.conflicts.find((c) => c.conflictId === conflictId || c.id === conflictId);
      const remaining = state.conflicts.filter((c) => c.conflictId !== conflictId && c.id !== conflictId);

      const resolved = targetConflict
        ? [...state.resolvedConflicts, { ...targetConflict, resolvedAt: Date.now(), status: 'RESOLVED' }]
        : state.resolvedConflicts;

      let replicaA = { ...state.replicaA };
      let replicaB = { ...state.replicaB };

      if (resolutionOp?.payload?.resolvedFields) {
        const fields = resolutionOp.payload.resolvedFields;
        const targetEntity = resolutionOp.entityId;
        const updateTask = (tasks) => tasks.map((t) => (t.id === targetEntity ? { ...t, ...fields, isHeld: false } : t));
        replicaA.tasks = updateTask(replicaA.tasks);
        replicaB.tasks = updateTask(replicaB.tasks);
      }

      const derived = deriveTruthfulDialState(replicaA, replicaB, remaining);
      return { replicaA, replicaB, conflicts: remaining, resolvedConflicts: resolved, ...derived };
    });
  },

  // --------------------------------------------------------------------------
  // Pending Operations Flushing
  // --------------------------------------------------------------------------
  flushPendingOperations: async (replicaKey) => {
    const state = get();
    const replica = state[replicaKey];

    if (!replica.effectiveOnline || !syncClient.isConnected) return;

    try {
      const pending = await getPendingOperations(replica.id);
      if (!pending || pending.length === 0) return;

      const validOps = pending.map((item) => ({
        opId: item.opId || item.id,
        projectId: item.projectId || DEFAULT_PROJECT_ID,
        entityId: item.entityId,
        type: item.type,
        payload: item.payload,
        replicaId: item.replicaId || replica.id,
        clientSeq: item.clientSeq || 1,
        serverSeq: null,
        lamportTime: item.lamportTime || 1,
        versionVector: item.versionVector || { [replica.id]: 1 },
        timestamp: item.timestamp || Date.now(),
      }));

      await syncClient.pushOperations(validOps);
    } catch (err) {
      console.warn(`[NexusSync] Error flushing pending ops for ${replica.id}:`, err.message);
    }
  },

  // --------------------------------------------------------------------------
  // Real Browser Network Event Listener Action
  // --------------------------------------------------------------------------
  setBrowserOnlineStatus: (isOnline) => {
    set((state) => {
      const replicaA = {
        ...state.replicaA,
        effectiveOnline: isOnline && state.replicaA.isSimulatedOnline,
      };
      const replicaB = {
        ...state.replicaB,
        effectiveOnline: isOnline && state.replicaB.isSimulatedOnline,
      };

      const derived = deriveTruthfulDialState(replicaA, replicaB, state.conflicts);

      return {
        isBrowserOnline: isOnline,
        replicaA,
        replicaB,
        ...derived,
      };
    });

    if (isOnline && syncClient.isConnected) {
      get().performHandshakesAndCatchup();
    }
  },

  // --------------------------------------------------------------------------
  // Simulated Replica Toggle
  // --------------------------------------------------------------------------
  toggleReplicaOnline: async (replicaKey) => {
    const state = get();
    const current = state[replicaKey];
    const nextSimulated = !current.isSimulatedOnline;
    const nextEffective = state.isBrowserOnline && nextSimulated;

    const updatedReplica = {
      ...current,
      isSimulatedOnline: nextSimulated,
      effectiveOnline: nextEffective,
    };

    const replicaA = replicaKey === 'replicaA' ? updatedReplica : state.replicaA;
    const replicaB = replicaKey === 'replicaB' ? updatedReplica : state.replicaB;

    const derived = deriveTruthfulDialState(replicaA, replicaB, state.conflicts);

    set({
      [replicaKey]: updatedReplica,
      ...derived,
    });

    // If replica healed / turned back online, flush its queued ops
    if (nextEffective && syncClient.isConnected) {
      await get().flushPendingOperations(replicaKey);
    }
  },

  // --------------------------------------------------------------------------
  // Local Task Mutations & Synchronization Pipeline
  // --------------------------------------------------------------------------
  updateTaskTitle: async (replicaKey, taskId, newTitle) => {
    const state = get();
    const replica = state[replicaKey];
    const existingTask = replica.tasks.find((t) => t.id === taskId);
    if (!existingTask) return;

    const nextClientSeq = (replica.clientSeq || 1) + 1;
    const nextLamport = (replica.lamportClock || 1) + 1;
    const nextVector = { ...(replica.versionVector || {}), [replica.id]: nextClientSeq };

    const updatedTask = {
      ...existingTask,
      title: newTitle,
      version: (existingTask.version || 1) + 1,
      syncStatus: 'PENDING_SYNC',
    };

    const updatedTasks = replica.tasks.map((t) => (t.id === taskId ? updatedTask : t));

    // Construct valid SyncOperation matching @nexussync/shared
    const op = {
      opId: `op_${replica.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      projectId: DEFAULT_PROJECT_ID,
      entityId: taskId,
      type: 'TASK_UPDATE_FIELD',
      payload: {
        entityId: taskId,
        field: 'title',
        oldValue: existingTask.title,
        newValue: newTitle,
      },
      replicaId: replica.id,
      clientSeq: nextClientSeq,
      serverSeq: null,
      lamportTime: nextLamport,
      versionVector: nextVector,
      timestamp: Date.now(),
    };

    try {
      await saveTaskLocally(replica.id, updatedTask);
      const localOpId = await queuePendingOperation(replica.id, op);
      const updatedPendingOps = [...replica.pendingOps, { ...op, localId: localOpId }];

      set((curr) => {
        const nextReplica = {
          ...curr[replicaKey],
          clientSeq: nextClientSeq,
          lamportClock: nextLamport,
          versionVector: nextVector,
          tasks: updatedTasks,
          pendingOps: updatedPendingOps,
        };

        const rA = replicaKey === 'replicaA' ? nextReplica : curr.replicaA;
        const rB = replicaKey === 'replicaB' ? nextReplica : curr.replicaB;
        const derived = deriveTruthfulDialState(rA, rB, curr.conflicts);

        return {
          [replicaKey]: nextReplica,
          ...derived,
        };
      });

      // If online and connected, push immediately
      if (replica.effectiveOnline && syncClient.isConnected) {
        syncClient.pushOperations([op]).catch((err) => {
          console.warn('[NexusSync] Push-ops queued for retry:', err.message);
        });
      }
    } catch (err) {
      console.error('Failed to persist task mutation in IndexedDB:', err);
    }
  },

  appendTask: async (replicaKey) => {
    const state = get();
    const replica = state[replicaKey];
    const newId = `card-${Date.now().toString(36).slice(-4)}`;

    const nextClientSeq = (replica.clientSeq || 1) + 1;
    const nextLamport = (replica.lamportClock || 1) + 1;
    const nextVector = { ...(replica.versionVector || {}), [replica.id]: nextClientSeq };

    const newTask = {
      id: newId,
      projectId: DEFAULT_PROJECT_ID,
      title: 'New local task checkpoint',
      category: 'Local Draft',
      priority: 'MEDIUM',
      dueDate: '2026-11-20',
      status: 'TODO',
      dependencies: [],
      version: 1,
      syncStatus: 'PENDING_SYNC',
      impactMeta: {
        downstreamCount: 0,
        riskLevel: 'LOW',
      },
    };

    const op = {
      opId: `op_${replica.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      projectId: DEFAULT_PROJECT_ID,
      entityId: newId,
      type: 'TASK_CREATE',
      payload: {
        entityId: newId,
        title: newTask.title,
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: newTask.dueDate,
        dependencies: [],
      },
      replicaId: replica.id,
      clientSeq: nextClientSeq,
      serverSeq: null,
      lamportTime: nextLamport,
      versionVector: nextVector,
      timestamp: Date.now(),
    };

    try {
      await saveTaskLocally(replica.id, newTask);
      const localOpId = await queuePendingOperation(replica.id, op);

      set((curr) => {
        const nextReplica = {
          ...curr[replicaKey],
          clientSeq: nextClientSeq,
          lamportClock: nextLamport,
          versionVector: nextVector,
          tasks: [...curr[replicaKey].tasks, newTask],
          pendingOps: [...curr[replicaKey].pendingOps, { ...op, localId: localOpId }],
        };

        const rA = replicaKey === 'replicaA' ? nextReplica : curr.replicaA;
        const rB = replicaKey === 'replicaB' ? nextReplica : curr.replicaB;
        const derived = deriveTruthfulDialState(rA, rB, curr.conflicts);

        return {
          [replicaKey]: nextReplica,
          ...derived,
        };
      });

      if (replica.effectiveOnline && syncClient.isConnected) {
        syncClient.pushOperations([op]).catch((err) => {
          console.warn('[NexusSync] Push-ops queued for retry:', err.message);
        });
      }
    } catch (err) {
      console.error('Failed to append task in IndexedDB:', err);
    }
  },

  // --------------------------------------------------------------------------
  // Navigation & Page Switching
  // --------------------------------------------------------------------------
  setActivePage: (page) => {
    if (typeof window !== 'undefined') {
      window.location.hash = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    set({ activePage: page });
  },

  // --------------------------------------------------------------------------
  // Theme Switching
  // --------------------------------------------------------------------------
  setTheme: (theme) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('nexussync_theme', theme);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme });
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },

  // --------------------------------------------------------------------------
  // Operator Auth & Session
  // --------------------------------------------------------------------------
  login: (userData) => {
    const isChief = (userData.role || '').toUpperCase().includes('CHIEF') ||
                    (userData.role || '').toUpperCase().includes('ARBITER') ||
                    userData.isAdmin === true;
    set({
      user: {
        id: userData.id || 'op_custom',
        name: userData.name || 'Station Operator',
        email: userData.email || 'operator@nexussync.org',
        role: userData.role || (isChief ? 'CHIEF OPERATOR' : 'PEER OPERATOR'),
        replicaId: userData.replicaId || 'r_operator_primary',
        region: userData.region || 'local-isolated (Enclave)',
        isAdmin: isChief,
        accessLevel: isChief ? 'TIER-0 ARBITER' : 'PEER QUORUM',
        authMode: 'LOCAL / DEMO',
        sessionType: 'LOCAL OPERATOR',
        ed25519Fingerprint: userData.ed25519Fingerprint || '7F8C·914B·22D1·D91A',
        isAuthenticated: true,
        sessionStartedAt: Date.now(),
      },
    });
  },

  signup: (userData) => {
    get().login(userData);
  },

  logout: () => {
    set({
      user: null,
    });
  },

  elevateToAdmin: () => {
    set((state) => {
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          isAdmin: true,
          role: 'CHIEF OPERATOR',
          accessLevel: 'TIER-0 ARBITER',
        },
      };
    });
  },

  // --------------------------------------------------------------------------
  // Conflict Resolver & AI Advisor Actions
  // --------------------------------------------------------------------------
  setResolutionStrategy: (strategy) => {
    set({ resolutionStrategy: strategy });
  },

  setSutureSelection: (field, branch) => {
    set((state) => ({
      sutureSelections: {
        ...state.sutureSelections,
        [field]: branch,
      },
    }));
  },

  requestConflictAdvice: async (conflictId) => {
    set({ advisorLoading: true, advisorError: null, advisorAnalysis: null });
    try {
      const res = await syncClient.fetchConflictAdvice(DEFAULT_PROJECT_ID, conflictId);
      if (res.success && res.data) {
        set({ advisorAnalysis: res.data, advisorLoading: false });
      } else {
        set({ advisorError: res.error || 'Failed to generate advice', advisorLoading: false });
      }
    } catch (err) {
      set({
        advisorError: err.message || 'AI Advisor service currently unavailable',
        advisorLoading: false,
      });
    }
  },

  adoptAdvisorSuggestion: (suggestion) => {
    if (!suggestion) return;
    const strat = suggestion.strategy;
    if (strat === 'CHOOSE_A') {
      set({ resolutionStrategy: 'lww' });
    } else if (strat === 'CHOOSE_B') {
      set({ resolutionStrategy: 'mvr' });
    } else {
      set({ resolutionStrategy: 'suture' });
    }
  },

  resolveConflict: async (conflictId) => {
    const state = get();
    const conflict = state.conflicts.find((c) => c.id === conflictId || c.conflictId === conflictId);
    if (!conflict) return;

    const remaining = state.conflicts.filter((c) => c.id !== conflictId && c.conflictId !== conflictId);
    const resolved = [...state.resolvedConflicts, { ...conflict, resolvedAt: Date.now(), strategy: state.resolutionStrategy }];

    // Map UI strategy to backend resolution strategy
    let mappedStrategy = 'CHOOSE_A';
    const fieldName = conflict.field || 'title';
    let chosenVal = conflict.branchA?.value !== undefined ? conflict.branchA.value : conflict.branchA?.[fieldName];

    if (state.resolutionStrategy === 'mvr') {
      mappedStrategy = 'CHOOSE_B';
      chosenVal = conflict.branchB?.value !== undefined ? conflict.branchB.value : conflict.branchB?.[fieldName];
    } else if (state.resolutionStrategy === 'suture') {
      mappedStrategy = 'MERGE_CUSTOM';
      const branchKey = state.sutureSelections[fieldName] || 'branchA';
      chosenVal = branchKey === 'branchA' ? conflict.branchA?.value : conflict.branchB?.value;
    }

    const resolvedFields = { [fieldName]: chosenVal };

    // Emit resolution to real backend if connected
    if (syncClient.isConnected) {
      try {
        await syncClient.resolveConflict({
          conflictId: conflict.conflictId || conflict.id,
          entityId: conflict.entityId || conflict.taskCardId,
          resolutionStrategy: mappedStrategy,
          resolvedFields,
          rememberDecision: true,
        });
      } catch (err) {
        console.warn('[NexusSync] Backend conflict resolution warning:', err.message);
      }
    }

    // Apply winning resolution to replica tasks
    const updateTaskFn = (tasks) => tasks.map((t) => (t.id === conflict.entityId ? { ...t, ...resolvedFields, isHeld: false } : t));
    const replicaA = { ...state.replicaA, tasks: updateTaskFn(state.replicaA.tasks) };
    const replicaB = { ...state.replicaB, tasks: updateTaskFn(state.replicaB.tasks) };

    const derived = deriveTruthfulDialState(replicaA, replicaB, remaining);

    set({
      replicaA,
      replicaB,
      conflicts: remaining,
      resolvedConflicts: resolved,
      advisorAnalysis: null,
      ...derived,
    });
  },

  // --------------------------------------------------------------------------
  // Convergence Lab & Chaos Simulator Actions
  // --------------------------------------------------------------------------
  setNetworkDriftMs: (ms) => {
    set((state) => ({
      networkDriftMs: ms,
      chaosEvents: [
        {
          id: `ev-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          type: 'LATENCY_DRIFT',
          desc: `Drift adjusted to ${ms}ms across mesh transport`,
          lamport: 14830 + Math.floor(Math.random() * 20),
        },
        ...state.chaosEvents.slice(0, 15),
      ],
    }));
  },

  toggleChaosFlag: (flagKey) => {
    set((state) => {
      const current = state.chaosFlags[flagKey];
      const nextFlags = { ...state.chaosFlags, [flagKey]: !current };
      const eventName = (!current ? 'ENGAGED: ' : 'DISENGAGED: ') + flagKey;
      return {
        chaosFlags: nextFlags,
        chaosEvents: [
          {
            id: `ev-${Date.now()}`,
            time: new Date().toLocaleTimeString(),
            type: 'FLAG_TOGGLE',
            desc: eventName,
            lamport: 14830 + Math.floor(Math.random() * 20),
          },
          ...state.chaosEvents.slice(0, 15),
        ],
      };
    });
  },

  triggerCatastrophe: (type) => {
    const time = new Date().toLocaleTimeString();
    let desc = '';
    if (type === 'duplicate_storm') desc = 'Synthetic Duplicate Storm (10k ops) flooded through mesh';
    else if (type === 'split_brain') desc = 'Bipartite split-brain partition severed Tokyo & London';
    else if (type === 'reorder_cascade') desc = 'Entropy shuffling of Lamport vectors triggered';
    else desc = `Scenario ${type} triggered`;

    set((state) => ({
      chaosEvents: [
        {
          id: `ev-${Date.now()}`,
          time,
          type: 'CATASTROPHE',
          desc,
          lamport: 14850 + Math.floor(Math.random() * 50),
        },
        ...state.chaosEvents.slice(0, 15),
      ],
    }));
  },

  // --------------------------------------------------------------------------
  // Vector Timeline Scrubber Actions
  // --------------------------------------------------------------------------
  setTimelineEpoch: (epoch) => {
    set({ timelineEpoch: Math.max(0, Math.min(14, epoch)) });
  },

  setSelectedOpId: (opId) => {
    set({ selectedOpId: opId });
  },

  setIsPlayingTimeline: (isPlaying) => {
    set({ isPlayingTimeline: isPlaying });
  },

  // --------------------------------------------------------------------------
  // Dial Override (for testing only)
  // --------------------------------------------------------------------------
  setDialState: (dialState) => {
    set({ dialState });
  },
}));
