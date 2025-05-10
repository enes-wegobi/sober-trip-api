import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { MapsModule } from './common/clients/maps/maps.module';

@Module({
  imports: [ConfigModule, DatabaseModule, HealthModule, MapsModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
