import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class LockService {
  private readonly logger = new Logger(LockService.name);
  private readonly lockPrefix = 'trip:lock:';

  constructor(private readonly redisService: RedisService) {}

  /**
   * Acquires a lock for the given key
   * @param key The key to lock
   * @param ttl The time-to-live for the lock in milliseconds (default: 30 seconds)
   * @param retries Number of retries if lock acquisition fails (default: 1)
   * @param retryDelay Delay between retries in milliseconds (default: 200ms)
   * @returns True if the lock was acquired, false otherwise
   */
  async acquireLock(
    key: string,
    ttl: number = 30000,
    retries: number = 1,
    retryDelay: number = 200,
  ): Promise<boolean> {
    const lockKey = `${this.lockPrefix}${key}`;
    let attempt = 0;

    while (attempt < retries) {
      const result = await this.redisService
        .getClient()
        .set(lockKey, Date.now().toString(), 'PX', ttl, 'NX');

      if (result === 'OK') {
        this.logger.debug(`Lock acquired for key: ${key}`);
        return true;
      }

      attempt++;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }

    this.logger.debug(
      `Failed to acquire lock for key: ${key} after ${retries} attempts`,
    );
    return false;
  }

  /**
   * Releases a lock for the given key
   * @param key The key to unlock
   * @returns True if the lock was released, false otherwise
   */
  async releaseLock(key: string): Promise<boolean> {
    const lockKey = `${this.lockPrefix}${key}`;
    const result = await this.redisService.getClient().del(lockKey);

    const released = result === 1;
    this.logger.debug(
      `Lock ${released ? 'released' : 'release failed'} for key: ${key}`,
    );
    return released;
  }

  /**
   * Gets the remaining time-to-live for a lock
   * @param key The key to check
   * @returns The remaining TTL in milliseconds, or -1 if the key does not exist, or -2 if the key exists but has no TTL
   */
  async getLockTTL(key: string): Promise<number> {
    const lockKey = `${this.lockPrefix}${key}`;
    return this.redisService.getClient().pttl(lockKey);
  }

  /**
   * Executes an operation with a lock
   * @param key The key to lock
   * @param operation The operation to execute while the lock is held
   * @param errorMessage Optional custom error message if lock acquisition fails
   * @param ttl The time-to-live for the lock in milliseconds (default: 30 seconds)
   * @param retries Number of retries if lock acquisition fails (default: 1)
   * @param retryDelay Delay between retries in milliseconds (default: 200ms)
   * @returns The result of the operation, or an error object if lock acquisition fails
   */
  async executeWithLock<T>(
    key: string,
    operation: () => Promise<T>,
    errorMessage?: string,
    ttl: number = 30000,
    retries: number = 1,
    retryDelay: number = 200,
  ): Promise<{ success: boolean; result?: T; message?: string }> {
    // Try to acquire a lock
    const lockAcquired = await this.acquireLock(key, ttl, retries, retryDelay);
    if (!lockAcquired) {
      this.logger.warn(`Failed to acquire lock for key: ${key}`);
      return {
        success: false,
        message: errorMessage || `Failed to acquire lock for key: ${key}`,
      };
    }

    try {
      // Execute the operation
      const result = await operation();
      return { success: true, result };
    } catch (error) {
      this.logger.error(
        `Error executing operation with lock for key: ${key}`,
        error,
      );
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      // Always release the lock, even if an error occurred
      await this.releaseLock(key);
      this.logger.debug(`Released lock for key: ${key}`);
    }
  }
}
