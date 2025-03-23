import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get<T>(key: string): T {
    const value = this.configService.get<T>(key);
    if (value === undefined) {
      throw new Error(`Configuration key "${key}" is missing`);
    }
    return value;
  }

  get port(): number {
    return this.get<number>('PORT');
  }

  get nodeEnv(): string {
    return this.get<string>('NODE_ENV');
  }

  get mongoUri(): string {
    return this.get<string>('MONGODB_URI');
  }

  get notificationApiUrl(): string {
    return this.get<string>('MAP_API_URL');
  }
}
