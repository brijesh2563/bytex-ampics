import { create } from 'zustand';
import {
  saveTaskLocally,
  seedTasksIfEmpty,
  queuePendingOperation,
  getPendingOperations,
} from '../core/idb';

/**
 * Initial local demo/seed tasks.
 * Clearly marked as local seed data, NOT server truth.
 */
export const SEED_TASKS = [
  {
    id: 'card-1',
    title: 'Formalize state-based convergence proof',
    category: 'CRDT Contract',
    priority: 'HIGH',
    dueDate: 'Oct 28',
    status: 'TODO',
    dependencies: [],
    version: 14,
    syncStatus: 'SYNCED_INITIAL',
    impactMeta: {
      downstreamCount: 1,
      riskLevel: 'LOW',
    },
  },
  {
    id: 'card-2',
    title: 'Produce 200 physical observatory badges',
    category: 'High Priority',
    priority: 'CRITICAL',
    dueDate: 'Nov 04',
    status: 'IN_PROGRESS',
    dependencies: ['card-1'],
    version: 14,
    syncStatus: 'SYNCED_INITIAL',
    impactMeta: {
      downstreamCount: 0,
      riskLevel: 'MEDIUM',
    },
  },
  {
    id: 'card-3',
    title: 'Run simulated 10k-op packet drop storm',
    category: 'Engine Review',
    priority: 'MEDIUM',
    dueDate: 'Nov 12',
    status: 'TODO',
    dependencies: [],
    version: 14,
    syncStatus: 'SYNCED_INITIAL',
    impactMeta: {
      downstreamCount: 0,
      riskLevel: 'LOW',
    },
  },
];

/**
 * Derives the truthful dial state based strictly on real frontend metrics.
 * Rule:
 * - If any replica is offline or has unacknowledged pending operations -> DIVERGING
 * - If active conflicts exist -> CONFLICT
 * - If online, zero pending operations, and no conflicts -> SYNCED
 */
function deriveTruthfulDialState(replicaA, replicaB, conflicts = []) {
  const isOnlineA = replicaA.effectiveOnline;
  const isOnlineB = replicaB.effectiveOnline;
  const pendingCount = (replicaA.pendingOps?.length || 0) + (replicaB.pendingOps?.length || 0);

  if (conflicts.length > 0) {
    return {
      dialState: 'CONFLICT',
      driftOps: pendingCount,
      failingInvariant: 'Semantic conflict detected on active replica state',
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

  // Replicas State
  replicaA: {
    id: 'r_aarav-lap',
    name: "Aarav's Laptop (Replica A)",
    partition: 'active_ops_partition_a',
    isSimulatedOnline: true,
    effectiveOnline: true,
    version: 14,
    tasks: [],
    pendingOps: [],
  },
  replicaB: {
    id: 'r_meera-ph',
    name: "Meera's Phone (Replica B)",
    partition: 'active_ops_partition_b',
    isSimulatedOnline: true,
    effectiveOnline: true,
    version: 14,
    tasks: [],
    pendingOps: [],
  },

  // Active Conflicts
  conflicts: [],

  // Truthful Dial Parameters
  dialState: 'SYNCED',
  driftOps: 0,
  stateHash: '9f3a1c8e',
  isHashMatching: true,
  failingInvariant: null,

  // --------------------------------------------------------------------------
  // Initialization & IndexedDB Restoration
  // --------------------------------------------------------------------------
  initWorkspace: async () => {
    if (get().isInitialized) return;

    try {
      // 1. Seed or restore tasks from IndexedDB for Replica A
      const tasksA = await seedTasksIfEmpty('r_aarav-lap', SEED_TASKS);
      const pendingOpsA = await getPendingOperations('r_aarav-lap');

      // 2. Seed or restore tasks from IndexedDB for Replica B
      const tasksB = await seedTasksIfEmpty('r_meera-ph', SEED_TASKS);
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
    } catch (err) {
      console.error('Failed to initialize IndexedDB workspace:', err);
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
  },

  // --------------------------------------------------------------------------
  // Simulated Replica Toggle
  // --------------------------------------------------------------------------
  toggleReplicaOnline: (replicaKey) => {
    set((state) => {
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

      return {
        [replicaKey]: updatedReplica,
        ...derived,
      };
    });
  },

  // --------------------------------------------------------------------------
  // Local Task Mutations & IndexedDB Persistence (P0)
  // --------------------------------------------------------------------------
  updateTaskTitle: async (replicaKey, taskId, newTitle) => {
    const state = get();
    const replica = state[replicaKey];
    const existingTask = replica.tasks.find((t) => t.id === taskId);
    if (!existingTask) return;

    const updatedTask = {
      ...existingTask,
      title: newTitle,
      syncStatus: 'PENDING_SYNC', // Visibly tagged as pending local change
    };

    // Update in-memory tasks
    const updatedTasks = replica.tasks.map((t) => (t.id === taskId ? updatedTask : t));

    // Construct local pending operation
    const op = {
      id: `${replica.id}:op_${Date.now().toString(36)}`,
      type: 'TASK_UPDATE_FIELD',
      documentId: 'doc_workspace_main',
      payload: {
        taskId,
        field: 'title',
        oldValue: existingTask.title,
        newValue: newTitle,
      },
      meta: {
        replicaId: replica.id,
        baseVersion: existingTask.version,
        timestamp: Date.now(),
      },
    };

    // Persist task and operation to IndexedDB
    try {
      await saveTaskLocally(replica.id, updatedTask);
      const localOpId = await queuePendingOperation(replica.id, op);
      const updatedPendingOps = [...replica.pendingOps, { ...op, localId: localOpId }];

      set((curr) => {
        const nextReplica = {
          ...curr[replicaKey],
          tasks: updatedTasks,
          pendingOps: updatedPendingOps,
        };

        const replicaA = replicaKey === 'replicaA' ? nextReplica : curr.replicaA;
        const replicaB = replicaKey === 'replicaB' ? nextReplica : curr.replicaB;

        const derived = deriveTruthfulDialState(replicaA, replicaB, curr.conflicts);

        return {
          [replicaKey]: nextReplica,
          ...derived,
        };
      });
    } catch (err) {
      console.error('Failed to persist task mutation in IndexedDB:', err);
    }
  },

  appendTask: async (replicaKey) => {
    const state = get();
    const replica = state[replicaKey];
    const newId = `card-${Date.now().toString(36).slice(-4)}`;

    const newTask = {
      id: newId,
      title: 'New local task checkpoint',
      category: 'Local Draft',
      priority: 'MEDIUM',
      dueDate: 'Open Date',
      status: 'TODO',
      dependencies: [],
      version: replica.version,
      syncStatus: 'PENDING_SYNC',
      impactMeta: {
        downstreamCount: 0,
        riskLevel: 'LOW',
      },
    };

    const op = {
      id: `${replica.id}:op_${Date.now().toString(36)}`,
      type: 'TASK_CREATE',
      documentId: 'doc_workspace_main',
      payload: newTask,
      meta: {
        replicaId: replica.id,
        baseVersion: replica.version,
        timestamp: Date.now(),
      },
    };

    try {
      await saveTaskLocally(replica.id, newTask);
      const localOpId = await queuePendingOperation(replica.id, op);

      set((curr) => {
        const nextReplica = {
          ...curr[replicaKey],
          tasks: [...curr[replicaKey].tasks, newTask],
          pendingOps: [...curr[replicaKey].pendingOps, { ...op, localId: localOpId }],
        };

        const replicaA = replicaKey === 'replicaA' ? nextReplica : curr.replicaA;
        const replicaB = replicaKey === 'replicaB' ? nextReplica : curr.replicaB;

        const derived = deriveTruthfulDialState(replicaA, replicaB, curr.conflicts);

        return {
          [replicaKey]: nextReplica,
          ...derived,
        };
      });
    } catch (err) {
      console.error('Failed to append task in IndexedDB:', err);
    }
  },

  // --------------------------------------------------------------------------
  // Dial Override (for testing only)
  // --------------------------------------------------------------------------
  setDialState: (dialState) => {
    set({ dialState });
  },
}));
