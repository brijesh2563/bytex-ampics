import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  dbPath: string;
  corsOrigin: string | string[];
  serviceName: string;
  version: string;
}

const defaultDbPath = path.resolve(__dirname, '../../data/nexussync.db');

export const config: ServerConfig = {
  port: Number.parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  dbPath: process.env.DB_PATH || defaultDbPath,
  corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  serviceName: 'NexusSync Sync Coordinator',
  version: '0.1.0'
};
