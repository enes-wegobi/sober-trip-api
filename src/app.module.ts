import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { CustomerController } from './customer/customer.controller';
import { DriverController } from './driver/driver.controller';
import { MapClient } from './common/client/map.client';
import { TripModule } from './trip/trip.module';
import { CustomerModule } from './customer/customer.module';
import { DriverModule } from './driver/driver.module';
import { TripGateway } from './trip/trip.gateway';

@Module({
  imports: [
    ConfigModule,
    CustomerModule,
    DriverModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.mongoUri,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [CustomerController, DriverController],
  providers: [MapClient, TripGateway],
  exports: [MapClient]
})
export class AppModule {}
