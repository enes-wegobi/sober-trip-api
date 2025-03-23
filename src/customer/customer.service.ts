import { Injectable } from '@nestjs/common';
import { Trip, TripDocument } from '../trip/schemas/trip.schema';
import { TripStatus } from '../common/enums/trip-status.enum';
import { CreateTripDto } from '../trip/dto/create-trip.dto';
import { MapClient } from '../common/client/map.client';
import { TripGateway } from '../trip/trip.gateway';
import { TripException } from 'src/common/exceptions/trip.exception';
import { TripErrors } from 'src/common/exceptions/trip-errors';
import { TripInformationsDto } from 'src/trip/dto/trip-informations.dto';
import { UpdateTripDto } from 'src/trip/dto/update-trip.dto';
import { TripRateDto } from 'src/trip/dto/trip-rate.dto';
import { TripService } from 'src/trip/trip.service';

@Injectable()
export class CustomerService {
  constructor(
    private readonly tripService: TripService,
    private readonly mapClient: MapClient,
    private readonly tripGateway: TripGateway,
  ) {}

  async findTripInformations(tripData: CreateTripDto): Promise<TripInformationsDto> {
   return this.mapClient.getTripInformations(tripData);
  }

  async createTrip(tripData: CreateTripDto): Promise<Trip> {
    let savedTrip: TripDocument;
    const existenceTrip = await this.tripService.findLatestPendingByCustomerId(tripData.customerId);

    if(!existenceTrip){
      savedTrip = await this.tripService.createTrip(tripData);
    } else {
      savedTrip = existenceTrip;
    }


    const updatedTrip = this.mapClient.findDriver(savedTrip).then(async (driver) => {
      const updatedTrip = await this.updateTrip(savedTrip._id, {driverId: driver.driverId, status: TripStatus.WAITING});

      if (!updatedTrip) {
        throw new TripException(
            TripErrors.TRIP_COULD_NOT_FOUND.code,
            TripErrors.TRIP_COULD_NOT_FOUND.message,
          );
      }

      // WebSocket üzerinden front-end'e güncellenmiş trip bilgisi gönderiliyor.
      this.tripGateway.sendTripToDriver(updatedTrip);
      return updatedTrip;
    }).catch(err => {
              throw new TripException(
            TripErrors.SOCKET_ERROR.code,
            TripErrors.SOCKET_ERROR.message,
          );
    });

    return updatedTrip;
  }


  async updateTrip(_id: any, tripData: UpdateTripDto): Promise<TripDocument | null>{
    return await this.tripService.updatetrip(_id, tripData);
  }


  async cancelTrip(tripId: string) {
    const trip = await this.tripService.updatetrip(tripId, { driverId: '', status: TripStatus.CANCELLED})
    if(!trip) {
      throw new TripException(
        TripErrors.TRIP_COULD_NOT_FOUND.code,
        TripErrors.TRIP_COULD_NOT_FOUND.message,
      )
    }

    return trip;
  }

  async rateTrip(tripId: string, request: TripRateDto) {
    const trip = await this.tripService.updatetrip(tripId, request);
    if(!trip) {
      throw new TripException(
        TripErrors.TRIP_COULD_NOT_FOUND.code,
        TripErrors.TRIP_COULD_NOT_FOUND.message,
      )
    }

    return trip;
  }

    
}
