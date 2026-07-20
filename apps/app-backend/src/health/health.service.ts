import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MinioService } from '../minio/minio.service';

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  services: {
    mongodb: ServiceHealth;
    redis: ServiceHealth;
    minio: ServiceHealth;
  };
}

interface ServiceHealth {
  status: 'up' | 'down';
  latencyMs?: number;
  error?: string;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly minioService: MinioService,
  ) {}

  async check(): Promise<HealthStatus> {
    const [mongodb, minio] = await Promise.all([
      this.checkMongo(),
      this.checkMinio(),
    ]);

    // Redis check done inline since we may not have Redis injectable yet
    const redis: ServiceHealth = await this.checkRedis();

    const allHealthy =
      mongodb.status === 'up' && redis.status === 'up' && minio.status === 'up';

    return {
      status: allHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: { mongodb, redis, minio },
    };
  }

  private async checkMongo(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      const readyState = this.mongoConnection.readyState;
      if (readyState !== 1) {
        return { status: 'down', error: `readyState: ${readyState}` };
      }
      await this.mongoConnection.db!.admin().ping();
      return { status: 'up', latencyMs: Date.now() - start };
    } catch (error: any) {
      return { status: 'down', error: error.message, latencyMs: Date.now() - start };
    }
  }

  private async checkRedis(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      // Simple ping via the mongoose connection is not possible,
      // use native driver or skip if not injectable
      // For now, check if the process can reach the redis port
      const net = await import('net');
      const port = parseInt(process.env.REDIS_PORT || '6379', 10);
      const host = process.env.REDIS_HOST || 'localhost';

      return await new Promise<ServiceHealth>((resolve) => {
        const socket = net.createConnection(port, host);
        const timeout = setTimeout(() => {
          socket.destroy();
          resolve({ status: 'down', error: 'Connection timeout', latencyMs: Date.now() - start });
        }, 2000);

        socket.on('connect', () => {
          clearTimeout(timeout);
          socket.destroy();
          resolve({ status: 'up', latencyMs: Date.now() - start });
        });

        socket.on('error', (err: any) => {
          clearTimeout(timeout);
          socket.destroy();
          resolve({ status: 'down', error: err.message, latencyMs: Date.now() - start });
        });
      });
    } catch (error: any) {
      return { status: 'down', error: error.message, latencyMs: Date.now() - start };
    }
  }

  private async checkMinio(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      // Use the MinIO client to list buckets as a health check
      const minioClient = (this.minioService as any).client;
      await minioClient.listBuckets();
      return { status: 'up', latencyMs: Date.now() - start };
    } catch (error: any) {
      return { status: 'down', error: error.message, latencyMs: Date.now() - start };
    }
  }
}
