import { create } from 'zustand';

/**
 * @typedef {'SYNCED' | 'DIVERGING' | 'CONFLICT' | 'CONVERGING' | 'LOCKED'} DialState
 */

export const useSyncStore = create((set, get) => ({
  // Replicas State
  replicaA: {
    id: 'r_aarav-lap',
    name: "Aarav's laptop",
    isOnline: true,
    version: 14,
    queuedOps: 0,
    stateHash: '9f3a1c8e',
  },
  replicaB: {
    id: 'r_meera-ph',
    name: "Meera's phone",
    isOnline: true,
    version: 14,
    queuedOps: 0,
    stateHash: '9f3a1c8e',
  },

  // Dial & Engine State
  dialState: 'SYNCED',
  driftOps: 0,
  conflictSegmentAngle: 45, // Degrees for visual conflict sector
  stateHash: '9f3a1c8e',
  isHashMatching: true,
  failingInvariant: null,

  // Active conflict stashes (for phase 1 mock preview and future phases)
  conflicts: [],

  // Actions
  setDialState: (dialState) => {
    let driftOps = get().driftOps;
    let isHashMatching = true;
    let failingInvariant = null;

    if (dialState === 'DIVERGING') {
      driftOps = 3;
      isHashMatching = false;
    } else if (dialState === 'CONFLICT') {
      driftOps = 2;
      isHashMatching = false;
      failingInvariant = 'Status marked DONE while dependency "Approve final design" is TODO';
    } else if (dialState === 'SYNCED') {
      driftOps = 0;
      isHashMatching = true;
    } else if (dialState === 'LOCKED') {
      driftOps = 0;
      isHashMatching = true;
    }

    set({ dialState, driftOps, isHashMatching, failingInvariant });
  },

  toggleOnline: (replicaKey) => {
    set((state) => {
      const current = state[replicaKey];
      const updatedOnline = !current.isOnline;
      const updated = { ...current, isOnline: updatedOnline };

      let nextDialState = state.dialState;
      if (!updatedOnline) {
        nextDialState = 'DIVERGING';
      } else if (state.replicaA.isOnline && state.replicaB.isOnline) {
        nextDialState = 'CONVERGING';
      }

      return {
        [replicaKey]: updated,
        dialState: nextDialState,
        driftOps: !updatedOnline ? 3 : 0,
      };
    });
  },

  setDrift: (driftOps) => {
    set({
      driftOps,
      dialState: driftOps > 0 ? 'DIVERGING' : 'SYNCED',
    });
  },

  triggerConflictScenario: () => {
    set({
      dialState: 'CONFLICT',
      driftOps: 2,
      isHashMatching: false,
      failingInvariant: 'Concurrent edit on due date & unmet dependency',
    });
  },

  triggerConvergenceLock: () => {
    set({ dialState: 'CONVERGING' });
    setTimeout(() => {
      set({
        dialState: 'LOCKED',
        driftOps: 0,
        isHashMatching: true,
        failingInvariant: null,
      });
    }, 1400);
  },

  resetSynced: () => {
    set({
      dialState: 'SYNCED',
      driftOps: 0,
      isHashMatching: true,
      failingInvariant: null,
      replicaA: { ...get().replicaA, isOnline: true, queuedOps: 0 },
      replicaB: { ...get().replicaB, isOnline: true, queuedOps: 0 },
    });
  },
}));
