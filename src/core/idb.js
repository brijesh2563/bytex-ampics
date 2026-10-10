import { openDB } from 'idb';

const DB_NAME = 'nexussync_db';
const DB_VERSION = 1;

/**
 * Initializes and upgrades the NexusSync IndexedDB local database.
 * Stores:
 * - 'tasks': task entities per replica partition
 * - 'pending_ops': unacknowledged operations queued locally while offline or awaiting sync
 * - 'sync_meta': replica sync metadata (lastKnownServerSeq, lamportClock)
 */

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 1. Tasks store
      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'storageKey' });
        taskStore.createIndex('replicaId', 'replicaId', { unique: false });
        taskStore.createIndex('id', 'id', { unique: false });
      }

      // 2. Pending operations queue
      if (!db.objectStoreNames.contains('pending_ops')) {
        const opStore = db.createObjectStore('pending_ops', {
          keyPath: 'localId',
          autoIncrement: true,
        });
        opStore.createIndex('replicaId', 'replicaId', { unique: false });
        opStore.createIndex('opId', 'id', { unique: false });
      }

      // 3. Sync metadata
      if (!db.objectStoreNames.contains('sync_meta')) {
        db.createObjectStore('sync_meta', { keyPath: 'key' });
      }
    },
  });
}

/**
 * Reads all tasks for a specific replica partition from IndexedDB.
 * @param {string} replicaId
 * @returns {Promise<Array>}
 */
export async function getTasksForReplica(replicaId) {
  const db = await getDB();
  const tx = db.transaction('tasks', 'readonly');
  const index = tx.store.index('replicaId');
  return index.getAll(replicaId);
}

/**
 * Upserts a task into local IndexedDB storage.
 * @param {string} replicaId
 * @param {Object} task
 */
export async function saveTaskLocally(replicaId, task) {
  const db = await getDB();
  const storageKey = `${replicaId}:${task.id}`;
  await db.put('tasks', {
    ...task,
    storageKey,
    replicaId,
    updatedAt: Date.now(),
  });
}

/**
 * Batch saves initial seed tasks for a replica if none exist yet.
 * @param {string} replicaId
 * @param {Array} initialTasks
 */
export async function seedTasksIfEmpty(replicaId, initialTasks) {
  const db = await getDB();
  const existing = await getTasksForReplica(replicaId);
  if (existing.length === 0) {
    const tx = db.transaction('tasks', 'readwrite');
    for (const task of initialTasks) {
      await tx.store.put({
        ...task,
        storageKey: `${replicaId}:${task.id}`,
        replicaId,
        updatedAt: Date.now(),
      });
    }
    await tx.done;
    return initialTasks;
  }
  return existing;
}

/**
 * Appends an operation to the local pending queue in IndexedDB.
 * This marks the change as PENDING_SYNC.
 * @param {string} replicaId
 * @param {Object} operation
 */
export async function queuePendingOperation(replicaId, operation) {
  const db = await getDB();
  return db.add('pending_ops', {
    ...operation,
    replicaId,
    queuedAt: Date.now(),
    status: 'PENDING_SYNC',
  });
}

/**
 * Retrieves all unacknowledged pending operations for a replica.
 * @param {string} replicaId
 * @returns {Promise<Array>}
 */
export async function getPendingOperations(replicaId) {
  const db = await getDB();
  const tx = db.transaction('pending_ops', 'readonly');
  const index = tx.store.index('replicaId');
  return index.getAll(replicaId);
}

/**
 * Clears or removes a pending operation once officially confirmed by server.
 * @param {number} localId
 */
export async function removePendingOperation(localId) {
  const db = await getDB();
  return db.delete('pending_ops', localId);
}

/**
 * Removes an operation by its unique opId.
 * @param {string} replicaId
 * @param {string} opId
 */
export async function removePendingOperationByOpId(replicaId, opId) {
  const db = await getDB();
  const tx = db.transaction('pending_ops', 'readwrite');
  const index = tx.store.index('replicaId');
  const ops = await index.getAll(replicaId);
  for (const op of ops) {
    if (op.opId === opId || op.id === opId) {
      await tx.store.delete(op.localId);
    }
  }
  await tx.done;
}

/**
 * Clears all pending operations for a replica.
 * @param {string} replicaId
 */
export async function clearPendingOperations(replicaId) {
  const db = await getDB();
  const tx = db.transaction('pending_ops', 'readwrite');
  const index = tx.store.index('replicaId');
  const ops = await index.getAll(replicaId);
  for (const op of ops) {
    await tx.store.delete(op.localId);
  }
  await tx.done;
}


/**
 * Sets a key-value pair in sync metadata.
 * @param {string} key
 * @param {any} value
 */
export async function setSyncMeta(key, value) {
  const db = await getDB();
  return db.put('sync_meta', { key, value, updatedAt: Date.now() });
}

/**
 * Gets a value from sync metadata.
 * @param {string} key
 */
export async function getSyncMeta(key) {
  const db = await getDB();
  const entry = await db.get('sync_meta', key);
  return entry ? entry.value : null;
}
