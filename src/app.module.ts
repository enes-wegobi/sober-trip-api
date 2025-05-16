import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { MapsModule } from './common/clients/maps/maps.module';
import { TripModule } from './trip/trip.module';
import { ClientsModule } from './common/clients/clients.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    HealthModule,
    MapsModule,
    TripModule,
    ClientsModule,
  ],
})
export class AppModule {}
