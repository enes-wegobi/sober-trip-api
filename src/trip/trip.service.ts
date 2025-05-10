import { Injectable } from '@nestjs/common';
import { TripRepository } from './trip.repository';
import { CreateTripDto } from './dto/create-trip.dto';
import { TripDocument } from './schemas/trip.schema';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripStatus } from 'src/common/enums/trip-status.enum';

@Injectable()
export class TripService {
  constructor(private readonly tripRepository: TripRepository) {}

  async findTrip(tripId: string) {
    return this.tripRepository.findById(tripId);
  }

  async findLatestPendingByCustomerId(customerId: string) {
    return this.tripRepository.findLatestPendingByCustomerId(customerId);
  }

  async findActiveByCustomerId(customerId: string) {
    return this.tripRepository.findActiveByCustomerId(customerId);
  }

  async findActiveByDriverId(driverId: string) {
    return this.tripRepository.findActiveByDriverId(driverId);
  }

  async createTrip(tripData: CreateTripDto): Promise<TripDocument> {
    return this.tripRepository.createTrip(tripData);
  }

  async updatetrip(
    _id: any,
    tripData: UpdateTripDto,
  ): Promise<TripDocument | null> {
    return this.tripRepository.findByIdAndUpdate(_id, tripData);
  }

  async activateTrip(tripId: string): Promise<{ success: boolean; trip?: TripDocument; message?: string }> {
    // Find the trip
    const trip = await this.findTrip(tripId);
    if (!trip) {
      return { success: false, message: 'Trip not found' };
    }

    // Check if the trip can be activated
    const { canActivate, message } = await this.canActivateTrip(trip.customerId, trip.driverId);
    if (!canActivate) {
      return { success: false, message };
    }

    // Activate the trip
    const updatedTrip = await this.tripRepository.findByIdAndUpdate(tripId, {
      status: TripStatus.ACTIVE,
    });

    if (!updatedTrip) {
      return { success: false, message: 'Failed to update trip status' };
    }

    return { success: true, trip: updatedTrip };
  }

  async completeTrip(_id: string): Promise<TripDocument | null> {
    return this.tripRepository.findByIdAndUpdate(_id, {
      status: TripStatus.PAYMENT_PENDING,
    });
  }


  async canActivateTrip(customerId: string, driverId: string): Promise<{ canActivate: boolean; message?: string }> {
    // Check if customer already has an active trip
    const customerActiveTrip = await this.findActiveByCustomerId(customerId);
    if (customerActiveTrip) {
      return { 
        canActivate: false, 
        message: `Customer already has an active trip with ID: ${customerActiveTrip._id}` 
      };
    }

    // Check if driver already has an active trip
    const driverActiveTrip = await this.findActiveByDriverId(driverId);
    if (driverActiveTrip) {
      return { 
        canActivate: false, 
        message: `Driver already has an active trip with ID: ${driverActiveTrip._id}` 
      };
    }

    return { canActivate: true };
  }
}
