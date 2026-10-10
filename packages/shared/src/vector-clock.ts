/**
 * NexusSync Vector Clock Utility
 * Formally handles causality comparisons, dominance, concurrency, and merging.
 */

import type { VersionVector, ReplicaId } from './types.js';

export type VectorRelation = 'DOMINATES' | 'PRECEDES' | 'CONCURRENT' | 'IDENTICAL';

/**
 * Compare two version vectors:
 * - 'IDENTICAL': v1 == v2 across all entries
 * - 'DOMINATES': v1 >= v2 for all entries, and v1 > v2 for at least one
 * - 'PRECEDES': v1 <= v2 for all entries, and v1 < v2 for at least one
 * - 'CONCURRENT': neither dominates the other (concurrent divergence)
 */
export function compareVectors(v1: VersionVector, v2: VersionVector): VectorRelation {
  const allKeys = new Set([...Object.keys(v1), ...Object.keys(v2)]);
  let v1Greater = false;
  let v2Greater = false;

  for (const key of allKeys) {
    const val1 = v1[key] ?? 0;
    const val2 = v2[key] ?? 0;

    if (val1 > val2) {
      v1Greater = true;
    } else if (val2 > val1) {
      v2Greater = true;
    }
  }

  if (v1Greater && v2Greater) {
    return 'CONCURRENT';
  }
  if (v1Greater) {
    return 'DOMINATES';
  }
  if (v2Greater) {
    return 'PRECEDES';
  }
  return 'IDENTICAL';
}

/**
 * Returns true if v1 causally dominates v2 (v1 > v2)
 */
export function dominates(v1: VersionVector, v2: VersionVector): boolean {
  return compareVectors(v1, v2) === 'DOMINATES';
}

/**
 * Returns true if v1 causally precedes v2 (v1 < v2)
 */
export function precedes(v1: VersionVector, v2: VersionVector): boolean {
  return compareVectors(v1, v2) === 'PRECEDES';
}

/**
 * Returns true if v1 and v2 are concurrent (v1 || v2)
 */
export function isConcurrent(v1: VersionVector, v2: VersionVector): boolean {
  return compareVectors(v1, v2) === 'CONCURRENT';
}

/**
 * Increments the entry for replicaId by 1, returning a new immutable VersionVector
 */
export function incrementVector(v: VersionVector, replicaId: ReplicaId): VersionVector {
  const next = { ...v };
  next[replicaId] = (next[replicaId] ?? 0) + 1;
  return next;
}

/**
 * Merges two version vectors by taking the component-wise maximum
 */
export function mergeVectors(v1: VersionVector, v2: VersionVector): VersionVector {
  const merged: VersionVector = {};
  const allKeys = new Set([...Object.keys(v1), ...Object.keys(v2)]);

  for (const key of allKeys) {
    merged[key] = Math.max(v1[key] ?? 0, v2[key] ?? 0);
  }

  return merged;
}

/**
 * Creates a shallow copy of a version vector
 */
export function cloneVector(v: VersionVector): VersionVector {
  return { ...v };
}
