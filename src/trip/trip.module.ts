import { Module } from '@nestjs/common';
import { TripRepository } from './trip.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Trip, TripSchema } from './schemas/trip.schema';
import { TripService } from './trip.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
  ],
  providers: [TripService, TripRepository],
  controllers: [],
  exports: [TripService],
})
export class TripModule {}
