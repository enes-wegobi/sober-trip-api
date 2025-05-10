import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './env.validation';

@Injectable()
export class ConfigService {
  constructor(
    private configService: NestConfigService<EnvironmentVariables, true>,
  ) {}

  get port(): number {
    return this.configService.get('PORT', { infer: true });
  }

  get nodeEnv(): EnvironmentVariables['NODE_ENV'] {
    return this.configService.get('NODE_ENV', { infer: true });
  }

  get mongoUri(): string {
    return this.configService.get('MONGODB_URI', { infer: true });
  }

  get corsOrigin(): string {
    return this.configService.get('CORS_ORIGIN', { infer: true });
  }

  get mongoUser(): string {
    return this.configService.get('MONGODB_USER', { infer: true });
  }

  get mongoPassword(): string {
    return this.configService.get('MONGODB_PASSWORD', { infer: true });
  }

  get googleMapsApiKey(): string {
    return this.configService.get('GOOGLE_MAPS_API_KEY', { infer: true });
  }

  get tripCostPerMinute(): number {
    return this.configService.get('TRIP_COST_PER_MINUTE', { infer: true });
  }

  /*
  Example client
  get notificationApiUrl(): string {
    return this.configService.get('NOTIFICATION_API_URL', { infer: true });
  }
  */
}
