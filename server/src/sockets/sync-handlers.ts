import type { Server as SocketIOServer, Socket } from 'socket.io';
import {
  type ClientToServerEvents,
  type ServerToClientEvents,
  type InterServerEvents,
  type SocketData,
  type SyncHandshake,
  type SyncCatchup,
  type SyncError,
  validateHandshake,
  validateBatch,
  validateSyncOperation
} from '@nexussync/shared';
import { OperationsRepository } from '../db/operations-repository.js';

export function getProjectRoom(projectId: string): string {
  return `project:${projectId}`;
}

export function registerSyncHandlers(
  io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  repo: OperationsRepository = new OperationsRepository()
): void {
  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
    // 1. Handshake Handler
    socket.on('client:handshake', (data: SyncHandshake, callback) => {
      const validation = validateHandshake(data);

      if (!validation.valid) {
        const error: SyncError = {
          code: 'INVALID_HANDSHAKE',
          message: validation.error || 'Invalid handshake payload',
          timestamp: new Date().toISOString()
        };
        socket.emit('server:error', error);
        if (typeof callback === 'function') {
          callback({ error });
        }
        return;
      }

      // Associate socket with project room
      const room = getProjectRoom(data.projectId);
      socket.join(room);
      socket.data.replicaId = data.replicaId;
      socket.data.projectId = data.projectId;

      // Fetch catch-up operations
      try {
        const currentServerSeq = repo.getHighestServerSeq(data.projectId);
        const currentVector = repo.getProjectVersionVector(data.projectId);
        const missedOps = repo.getOperationsAfterSeq(data.projectId, data.lastServerSeq, 100);
        const unresolvedConflicts = repo.getUnresolvedConflicts(data.projectId);

        const catchup: SyncCatchup = {
          currentServerSeq,
          currentVector,
          missedOps,
          unresolvedConflicts
        };

        socket.emit('server:catchup', catchup);

        if (typeof callback === 'function') {
          callback(catchup);
        }
      } catch (err) {
        const error: SyncError = {
          code: 'HANDSHAKE_QUERY_FAILED',
          message: err instanceof Error ? err.message : 'Failed to query catch-up state',
          timestamp: new Date().toISOString()
        };
        socket.emit('server:error', error);
        if (typeof callback === 'function') {
          callback({ error });
        }
      }
    });

    // 2. Operation Submission Pipeline
    socket.on('client:push-ops', (data, callback) => {
      // Validate batch container
      const batchValidation = validateBatch(data?.operations);
      if (!batchValidation.valid) {
        const error: SyncError = {
          code: 'INVALID_BATCH',
          message: batchValidation.error || 'Invalid batch payload',
          timestamp: new Date().toISOString()
        };
        socket.emit('server:error', error);
        if (typeof callback === 'function') {
          callback({ error });
        }
        return;
      }

      const operations = data.operations;
      const targetProjectId = socket.data.projectId || operations[0].projectId;

      // Validate each operation in batch
      for (const op of operations) {
        const opValidation = validateSyncOperation(op);
        if (!opValidation.valid) {
          const error: SyncError = {
            code: 'MALFORMED_OPERATION',
            message: `Operation '${op?.opId || 'unknown'}' validation failed: ${opValidation.error}`,
            opId: op?.opId,
            timestamp: new Date().toISOString()
          };
          socket.emit('server:error', error);
          if (typeof callback === 'function') {
            callback({ error });
          }
          return;
        }
      }

      // Ingest operations transactionally
      try {
        const { acks, committedOps } = repo.ingestBatch(targetProjectId, operations);

        // Acknowledge back to submitter
        socket.emit('server:ack-ops', { acks });
        if (typeof callback === 'function') {
          callback({ acks });
        }

        // Broadcast committed operations to all other peers in the project room
        if (committedOps.length > 0) {
          socket.to(getProjectRoom(targetProjectId)).emit('server:broadcast-ops', {
            operations: committedOps
          });
        }
      } catch (err) {
        const error: SyncError = {
          code: 'INGESTION_TRANSACTION_FAILED',
          message: err instanceof Error ? err.message : 'Database transaction failure during operation ingestion',
          timestamp: new Date().toISOString()
        };
        socket.emit('server:error', error);
        if (typeof callback === 'function') {
          callback({ error });
        }
      }
    });

    // Disconnect cleanup
    socket.on('disconnect', () => {
      // Room departure handled automatically by Socket.IO
    });
  });
}
