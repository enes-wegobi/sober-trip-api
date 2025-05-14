import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class RedisService {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.valkeyHost,
      port: this.configService.valkeyPort,
      password: this.configService.valkeyPassword,
      username: this.configService.valkeyUsername, // If provided
      tls: this.configService.valkeyTls ? {} : undefined,
    });

    // Log connection events
    this.client.on('error', (err) => {
      this.logger.error('Valkey DB connection error:', err);
    });

    this.client.on('connect', () => {
      this.logger.log('Valkey DB connection successful');
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    if (ttl) {
      return (await this.client.set(key, value, 'PX', ttl)) === 'OK';
    }
    return (await this.client.set(key, value)) === 'OK';
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async pttl(key: string): Promise<number> {
    return this.client.pttl(key);
  }
}
