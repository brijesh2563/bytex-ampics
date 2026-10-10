import http from 'node:http';
import express, { type Express } from 'express';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config.js';
import { initDatabase, closeDatabase } from './db/database.js';
import { healthRouter } from './routes/health.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

export function createApp(): Express {
  const app = express();

  // Basic middleware
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  // Mount API routes
  app.use('/api/v1', healthRouter);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export function createServer(): {
  app: Express;
  httpServer: http.Server;
  io: SocketIOServer;
} {
  // Ensure DB initialized
  initDatabase();

  const app = createApp();
  const httpServer = http.createServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST']
    }
  });

  // Socket.IO lifecycle logging (event handlers will be added in upcoming steps)
  io.on('connection', (socket) => {
    // Basic connection tracking
    socket.on('disconnect', () => {
      // Cleanup on disconnect
    });
  });

  return { app, httpServer, io };
}

export function startServer(): Promise<{
  httpServer: http.Server;
  io: SocketIOServer;
  port: number;
}> {
  return new Promise((resolve, reject) => {
    try {
      const { httpServer, io } = createServer();
      const port = config.port;

      httpServer.listen(port, () => {
        resolve({ httpServer, io, port });
      });

      httpServer.on('error', (err) => {
        reject(err);
      });

      // Graceful shutdown
      const shutdown = () => {
        io.close(() => {
          httpServer.close(() => {
            closeDatabase();
            process.exit(0);
          });
        });
      };

      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);
    } catch (error) {
      reject(error);
    }
  });
}

import { pathToFileURL } from 'node:url';

// Start if executed directly
if (
  process.env.NODE_ENV !== 'test' &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  startServer()
    .then(({ port }) => {
      console.log(`[NexusSync] Sync Coordinator running on http://localhost:${port}`);
    })
    .catch((err) => {
      console.error('[NexusSync] Fatal startup error:', err);
      process.exit(1);
    });
}

