import type { DatabaseSync } from 'node:sqlite';
import {
  type SyncOperation,
  type OperationAcknowledgement,
  type ConflictRecord,
  type WorkspaceSnapshot,
  type TaskEntity,
  type VersionVector,
  type OperationType,
  isIdenticalOperation
} from '@nexussync/shared';
import { getDb } from './database.js';

export interface BatchIngestResult {
  acks: OperationAcknowledgement[];
  committedOps: SyncOperation[];
}

export class OperationsRepository {
  private db: DatabaseSync;

  constructor(db: DatabaseSync = getDb()) {
    this.db = db;
  }

  /**
   * Helper to execute a function inside an immediate SQLite transaction.
   */
  public runTransaction<T>(fn: () => T): T {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const result = fn();
      this.db.exec('COMMIT');
      return result;
    } catch (err) {
      try {
        this.db.exec('ROLLBACK');
      } catch {
        // Suppress secondary rollback errors
      }
      throw err;
    }
  }

  /**
   * Retrieves the current highest server sequence for a project.
   */
  public getHighestServerSeq(projectId: string): number {
    const row = this.db
      .prepare('SELECT last_server_seq FROM project_sequences WHERE project_id = ?')
      .get(projectId) as { last_server_seq: number } | undefined;

    if (row) {
      return row.last_server_seq;
    }

    // Fallback: Check operations table
    const opRow = this.db
      .prepare('SELECT COALESCE(MAX(server_seq), 0) AS max_seq FROM operations WHERE project_id = ?')
      .get(projectId) as { max_seq: number } | undefined;

    return opRow ? opRow.max_seq : 0;
  }

  /**
   * Fetches an operation by its unique opId.
   */
  public getOperationByOpId(opId: string): SyncOperation | null {
    const row = this.db
      .prepare('SELECT * FROM operations WHERE op_id = ?')
      .get(opId) as Record<string, unknown> | undefined;

    if (!row) return null;
    return this.mapRowToOperation(row);
  }

  /**
   * Fetches missed operations for a project with server_seq > afterSeq.
   * Results are strictly ordered by server_seq ASC and bounded by limit.
   */
  public getOperationsAfterSeq(projectId: string, afterSeq: number, limit = 100): SyncOperation[] {
    const rows = this.db
      .prepare(
        `SELECT * FROM operations 
         WHERE project_id = ? AND server_seq > ? 
         ORDER BY server_seq ASC 
         LIMIT ?`
      )
      .all(projectId, afterSeq, limit) as Record<string, unknown>[];

    return rows.map((r) => this.mapRowToOperation(r));
  }

  /**
   * Calculates the current known version vector for a project by aggregating replica client sequences.
   */
  public getProjectVersionVector(projectId: string): VersionVector {
    const rows = this.db
      .prepare(
        `SELECT replica_id, MAX(client_seq) AS max_client_seq 
         FROM operations 
         WHERE project_id = ? 
         GROUP BY replica_id`
      )
      .all(projectId) as { replica_id: string; max_client_seq: number }[];

    const vector: VersionVector = {};
    for (const row of rows) {
      vector[row.replica_id] = row.max_client_seq;
    }
    return vector;
  }

  /**
   * Retrieves active unresolved conflicts for a project.
   */
  public getUnresolvedConflicts(projectId: string): ConflictRecord[] {
    const rows = this.db
      .prepare("SELECT * FROM conflicts WHERE project_id = ? AND status = 'UNRESOLVED'")
      .all(projectId) as Record<string, unknown>[];

    return rows.map((r) => ({
      conflictId: r.conflict_id as string,
      projectId: r.project_id as string,
      entityId: r.entity_id as string,
      field: (r.field as any) || undefined,
      type: r.type as any,
      status: r.status as any,
      branchA: JSON.parse(r.branch_a as string),
      branchB: JSON.parse(r.branch_b as string),
      suggestedResolution: r.suggested_resolution ? JSON.parse(r.suggested_resolution as string) : undefined,
      resolvedAt: (r.resolved_at as string) || undefined,
      resolvedBy: (r.resolved_by as string) || undefined,
      winningValue: r.winning_value ? JSON.parse(r.winning_value as string) : undefined
    }));
  }

  /**
   * Ingests a batch of operations transactionally.
   * Ensures monotonic sequence allocation per project, handles duplicates idempotently,
   * detects conflicting opId reuse, and applies accepted changes to snapshot.
   */
  public ingestBatch(projectId: string, operations: SyncOperation[]): BatchIngestResult {
    return this.runTransaction(() => {
      const acks: OperationAcknowledgement[] = [];
      const committedOps: SyncOperation[] = [];

      // Ensure project_sequences entry exists
      let currentSeq = this.getHighestServerSeq(projectId);

      for (const op of operations) {
        // Enforce project scope
        if (op.projectId !== projectId) {
          acks.push({
            opId: op.opId,
            serverSeq: null,
            status: 'REJECTED',
            reason: `Cross-project scope mismatch: operation projectId '${op.projectId}' does not match target '${projectId}'`
          });
          continue;
        }

        // Check if opId already exists
        const existingOp = this.getOperationByOpId(op.opId);

        if (existingOp) {
          // Verify immutable content identity
          if (isIdenticalOperation(op, existingOp)) {
            // Idempotent retry: return duplicate acknowledgement with original serverSeq
            acks.push({
              opId: op.opId,
              serverSeq: existingOp.serverSeq,
              status: 'DUPLICATE_IGNORED'
            });
          } else {
            // Conflicting opId reuse with different payload/metadata: REJECT
            acks.push({
              opId: op.opId,
              serverSeq: null,
              status: 'REJECTED',
              reason: 'CONFLICTING_OP_ID: opId already exists with differing immutable content'
            });
          }
          continue;
        }

        // New valid operation: allocate next monotonic serverSeq
        currentSeq += 1;
        const committedOp: SyncOperation = {
          ...op,
          serverSeq: currentSeq
        };

        // Persist to operations table
        this.insertOperation(committedOp);

        // Update project_sequences
        this.updateProjectSequence(projectId, currentSeq);

        // Update document snapshot state
        this.applyToSnapshot(projectId, committedOp);

        acks.push({
          opId: committedOp.opId,
          serverSeq: currentSeq,
          status: 'ACCEPTED'
        });

        committedOps.push(committedOp);
      }

      return { acks, committedOps };
    });
  }

  /**
   * Retrieves or builds the workspace snapshot for a project.
   */
  public getWorkspaceSnapshot(projectId: string): WorkspaceSnapshot {
    const row = this.db
      .prepare('SELECT * FROM document_snapshots WHERE project_id = ?')
      .get(projectId) as Record<string, unknown> | undefined;

    const conflicts = this.getUnresolvedConflicts(projectId);
    const vector = this.getProjectVersionVector(projectId);
    const highestSeq = this.getHighestServerSeq(projectId);

    if (row && row.snapshot_data) {
      let tasks: TaskEntity[] = [];
      try {
        tasks = JSON.parse(row.snapshot_data as string);
      } catch {
        tasks = [];
      }
      return {
        projectId,
        serverSeq: (row.server_seq as number) || highestSeq,
        versionVector: vector,
        tasks: tasks.filter((t) => !t.isDeleted),
        unresolvedConflicts: conflicts
      };
    }

    // If no snapshot row yet, reconstruct from operations log
    const allOps = this.getOperationsAfterSeq(projectId, 0, 10000);
    const taskMap = new Map<string, TaskEntity>();

    for (const op of allOps) {
      this.reduceOperationToTaskMap(taskMap, op);
    }

    const tasks = Array.from(taskMap.values()).filter((t) => !t.isDeleted);

    return {
      projectId,
      serverSeq: highestSeq,
      versionVector: vector,
      tasks,
      unresolvedConflicts: conflicts
    };
  }

  // --- Private Helpers ---

  private insertOperation(op: SyncOperation): void {
    const stmt = this.db.prepare(`
      INSERT INTO operations (
        op_id, project_id, entity_id, type, payload,
        replica_id, client_seq, server_seq, lamport_time,
        version_vector, timestamp
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?
      )
    `);

    stmt.run(
      op.opId,
      op.projectId,
      op.entityId,
      op.type,
      JSON.stringify(op.payload),
      op.replicaId,
      op.clientSeq,
      op.serverSeq,
      op.lamportTime,
      JSON.stringify(op.versionVector),
      op.timestamp
    );
  }

  private updateProjectSequence(projectId: string, nextSeq: number): void {
    const stmt = this.db.prepare(`
      INSERT INTO project_sequences (project_id, last_server_seq, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(project_id) DO UPDATE SET
        last_server_seq = excluded.last_server_seq,
        updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(projectId, nextSeq);
  }

  private applyToSnapshot(projectId: string, op: SyncOperation): void {
    const snapshot = this.getWorkspaceSnapshot(projectId);
    const taskMap = new Map<string, TaskEntity>();
    for (const t of snapshot.tasks) {
      taskMap.set(t.id, t);
    }

    this.reduceOperationToTaskMap(taskMap, op);

    const updatedTasks = Array.from(taskMap.values());
    const stmt = this.db.prepare(`
      INSERT INTO document_snapshots (project_id, server_seq, version_vector, snapshot_data, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(project_id) DO UPDATE SET
        server_seq = excluded.server_seq,
        version_vector = excluded.version_vector,
        snapshot_data = excluded.snapshot_data,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      projectId,
      op.serverSeq,
      JSON.stringify(snapshot.versionVector),
      JSON.stringify(updatedTasks)
    );
  }

  private reduceOperationToTaskMap(taskMap: Map<string, TaskEntity>, op: SyncOperation): void {
    const now = new Date(op.timestamp).toISOString();

    switch (op.type) {
      case 'TASK_CREATE': {
        const payload = op.payload as any;
        taskMap.set(op.entityId, {
          id: op.entityId,
          projectId: op.projectId,
          title: payload.title || 'Untitled',
          description: payload.description || '',
          status: payload.status || 'TODO',
          priority: payload.priority || 'MEDIUM',
          dueDate: payload.dueDate || null,
          dependencies: Array.isArray(payload.dependencies) ? payload.dependencies : [],
          version: 1,
          updatedAt: now,
          isDeleted: false
        });
        break;
      }

      case 'TASK_UPDATE_FIELD': {
        const task = taskMap.get(op.entityId);
        if (task) {
          const payload = op.payload as any;
          (task as any)[payload.field] = payload.newValue;
          task.version += 1;
          task.updatedAt = now;
        }
        break;
      }

      case 'TASK_DELETE': {
        const task = taskMap.get(op.entityId);
        if (task) {
          task.isDeleted = true;
          task.version += 1;
          task.updatedAt = now;
        }
        break;
      }

      case 'DEPENDENCY_ADD': {
        const task = taskMap.get(op.entityId);
        const payload = op.payload as any;
        if (task && payload.dependsOnTaskId && !task.dependencies.includes(payload.dependsOnTaskId)) {
          task.dependencies.push(payload.dependsOnTaskId);
          task.version += 1;
          task.updatedAt = now;
        }
        break;
      }

      case 'DEPENDENCY_REMOVE': {
        const task = taskMap.get(op.entityId);
        const payload = op.payload as any;
        if (task && payload.dependsOnTaskId) {
          task.dependencies = task.dependencies.filter((d) => d !== payload.dependsOnTaskId);
          task.version += 1;
          task.updatedAt = now;
        }
        break;
      }
    }
  }

  private mapRowToOperation(r: Record<string, unknown>): SyncOperation {
    return {
      opId: r.op_id as string,
      projectId: r.project_id as string,
      entityId: r.entity_id as string,
      type: r.type as OperationType,
      payload: JSON.parse(r.payload as string),
      replicaId: r.replica_id as string,
      clientSeq: r.client_seq as number,
      serverSeq: r.server_seq as number | null,
      lamportTime: r.lamport_time as number,
      versionVector: JSON.parse(r.version_vector as string),
      timestamp: r.timestamp as number
    };
  }
}
