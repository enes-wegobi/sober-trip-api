import { Module } from '@nestjs/common';
import { TripRepository } from './trip.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Trip, TripSchema } from './schemas/trip.schema';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { MapsModule } from '../common/clients/maps/maps.module';
import { ConfigModule } from '../config/config.module';
import { LockModule } from '../common/lock/lock.module';
import { TripStateService } from './trip-state.service';
import { ClientsModule } from 'src/common/clients/clients.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
    MapsModule,
    ConfigModule,
    LockModule,
    ClientsModule,
  ],
  providers: [TripService, TripRepository, TripStateService],
  controllers: [TripController],
  exports: [TripService],
})
export class TripModule {}
