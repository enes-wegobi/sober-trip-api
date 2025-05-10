import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { CustomerController } from './customer/customer.controller';
import { DriverController } from './driver/driver.controller';
import { MapClient } from './common/client/map.client';
import { CustomerModule } from './customer/customer.module';
import { DriverModule } from './driver/driver.module';
import { NotificationClient } from './common/client/notification.client';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule,
    CustomerModule,
    DriverModule,
    DatabaseModule,
    HealthModule,
  ],
  controllers: [CustomerController, DriverController],
  providers: [MapClient, NotificationClient],
  exports: [MapClient],
})
export class AppModule {}
