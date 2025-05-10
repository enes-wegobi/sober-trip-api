import { Module } from '@nestjs/common';
import { TripRepository } from './trip.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Trip, TripSchema } from './schemas/trip.schema';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { MapsModule } from '../common/clients/maps/maps.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
    MapsModule,
    ConfigModule,
  ],
  providers: [TripService, TripRepository],
  controllers: [TripController],
  exports: [TripService],
})
export class TripModule {}
