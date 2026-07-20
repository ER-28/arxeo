import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private client: Minio.Client;
  private readonly logger = new Logger(MinioService.name);
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('minio.bucket')!;
    this.client = new Minio.Client({
      endPoint: this.config.get<string>('minio.endpoint')!,
      port: this.config.get<number>('minio.port'),
      useSSL: this.config.get<boolean>('minio.useSSL'),
      accessKey: this.config.get<string>('minio.accessKey')!,
      secretKey: this.config.get<string>('minio.secretKey')!,
    });
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  private async ensureBucket() {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket);
      this.logger.log(`Created bucket: ${this.bucket}`);
    } else {
      this.logger.log(`Bucket already exists: ${this.bucket}`);
    }
  }

  async uploadFile(
    objectName: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    await this.client.putObject(
      this.bucket,
      objectName,
      buffer,
      buffer.length,
      {
        'Content-Type': contentType,
      },
    );
    return objectName;
  }

  async getFileUrl(objectName: string): Promise<string> {
    return this.client.presignedGetObject(this.bucket, objectName);
  }

  async deleteFile(objectName: string): Promise<void> {
    await this.client.removeObject(this.bucket, objectName);
  }

  async getPresignedPutUrl(objectName: string, expiry = 3600): Promise<string> {
    return this.client.presignedPutObject(this.bucket, objectName, expiry);
  }
}
