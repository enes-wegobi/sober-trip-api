import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly redisService: RedisService) {}

  async check() {
    let valkeyStatus = 'ok';
    try {
      // Test Valkey connection with a simple PING command
      await this.redisService.getClient().ping();
      this.logger.log('Valkey connection check: OK');
    } catch (error) {
      valkeyStatus = 'error';
      this.logger.error('Valkey connection check failed:', error);
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: '1drive-trip-api',
      dependencies: {
        valkey: valkeyStatus,
      },
    };
  }

  async testValkeyConnection() {
    try {
      // Test Valkey connection with a simple PING command
      const pingResult = await this.redisService.getClient().ping();

      // Try to set and get a test value
      const testKey = 'test:connection:' + Date.now();
      const testValue = 'Connection test at ' + new Date().toISOString();

      await this.redisService.set(testKey, testValue, 60000); // TTL: 1 minute
      const retrievedValue = await this.redisService.get(testKey);

      // Clean up the test key
      await this.redisService.del(testKey);

      return {
        connected: true,
        ping: pingResult,
        valueTest: {
          success: retrievedValue === testValue,
          expected: testValue,
          received: retrievedValue,
        },
        message: 'Valkey connection is working properly!',
      };
    } catch (error) {
      this.logger.error('Valkey connection test failed:', error);
      return {
        connected: false,
        message: 'Valkey connection failed',
        error: error.message,
      };
    }
  }
}
