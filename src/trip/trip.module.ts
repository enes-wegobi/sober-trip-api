import { Module } from "@nestjs/common";
import { TripRepository } from "./trip.repository";
import { MongooseModule } from "@nestjs/mongoose";
import { Trip, TripSchema } from "./schemas/trip.schema";
import { TripService } from "./trip.service";
import { TripGateway } from "./trip.gateway";

@Module({
    imports: [
      MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
    ],
    providers: [TripService, TripRepository, TripGateway],
    controllers: [],
    exports: [TripService, TripGateway],
  })
  export class TripModule {}
  