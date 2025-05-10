import { Injectable } from '@nestjs/common';
import { Trip, TripDocument } from '../trip/schemas/trip.schema';
import { TripStatus } from '../common/enums/trip-status.enum';
import { TripException } from 'src/common/exceptions/trip.exception';
import { TripErrors } from 'src/common/exceptions/trip-errors';
import { TripService } from 'src/trip/trip.service';
import { MapClient } from 'src/common/client/map.client';
import { UpdateTripDto } from 'src/trip/dto/update-trip.dto';
import { NotificationClient } from 'src/common/client/notification.client';

@Injectable()
export class DriverService {
  constructor(
    private readonly tripService: TripService,
    private readonly mapClient: MapClient,
    private readonly notificationClient: NotificationClient,
  ) {}

  async acceptTrip(tripId: string, driverId: string): Promise<Trip> {
    //tripin statusu kontrol
    //lock koyulabilir
    const trip = await this.tripService.updatetrip(tripId, {
      driverId,
      status: TripStatus.ACCEPTED,
    });
    if (!trip) {
      throw new TripException(
        TripErrors.TRIP_COULD_NOT_FOUND.code,
        TripErrors.TRIP_COULD_NOT_FOUND.message,
      );
    }

    return trip;
  }

  async rejectTrip(tripId: string, driverId: string) {
    //TODO: driver Id yi filter kısmına ekle ki bir dahaki aramada o da çıkmasın

    const trip = await this.tripService.findTrip(tripId);
    if (!trip) {
      throw new TripException(
        TripErrors.TRIP_COULD_NOT_FOUND.code,
        TripErrors.TRIP_COULD_NOT_FOUND.message,
      );
    }
    const updatedTrip = this.mapClient
      .findDriver(trip)
      .then(async (driver) => {
        const updatedTrip = await this.updateTrip(trip._id, {
          driverId: driver.driverId,
          status: TripStatus.WAITING,
        });

        if (!updatedTrip) {
          throw new TripException(
            TripErrors.TRIP_COULD_NOT_FOUND.code,
            TripErrors.TRIP_COULD_NOT_FOUND.message,
          );
        }

        this.notificationClient.sendTripNotificationToCustomer(
          updatedTrip.customerId,
          updatedTrip,
        );
        return updatedTrip;
      })
      .catch((err) => {
        throw new TripException(
          TripErrors.SOCKET_ERROR.code,
          TripErrors.SOCKET_ERROR.message,
        );
      });

    return updatedTrip;
  }

  async updateTrip(
    _id: any,
    tripData: UpdateTripDto,
  ): Promise<TripDocument | null> {
    return await this.tripService.updatetrip(_id, tripData);
  }

  async updateTripStatus(tripId: string, status: TripStatus): Promise<Trip> {
    const trip = await this.tripService.updatetrip(tripId, { status });
    if (!trip) {
      throw new TripException(
        TripErrors.TRIP_COULD_NOT_FOUND.code,
        TripErrors.TRIP_COULD_NOT_FOUND.message,
      );
    }
    this.notificationClient.sendTripNotificationToCustomer(
      trip.customerId,
      trip,
    );
    return trip;
  }

  async completeTrip(tripId: string): Promise<TripDocument | null> {
    const trip = await this.tripService.completeTrip(tripId);
    if (!trip)
      throw new TripException(
        TripErrors.TRIP_COULD_NOT_FOUND.code,
        TripErrors.TRIP_COULD_NOT_FOUND.message,
      );
    this.notificationClient.sendTripNotificationToCustomer(
      trip.customerId,
      trip,
    );
    return trip;
  }
}
