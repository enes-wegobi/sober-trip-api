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

  async activateTrip(
    tripId: string,
  ): Promise<{ success: boolean; trip?: TripDocument; message?: string }> {
    // Find the trip
    const trip = await this.findTrip(tripId);
    if (!trip) {
      return { success: false, message: 'Trip not found' };
    }

    // Check if the trip can be activated
    const { canActivate, message } = await this.canActivateTrip(
      trip.customerId,
      trip.driverId,
    );
    if (!canActivate) {
      return { success: false, message };
    }

    // Determine the new status based on whether a driver is assigned
    const newStatus = trip.driverId
      ? TripStatus.APPROVED
      : TripStatus.WAITING_FOR_DRIVER;

    // Activate the trip
    const updatedTrip = await this.tripRepository.findByIdAndUpdate(tripId, {
      status: newStatus,
    });

    if (!updatedTrip) {
      return { success: false, message: 'Failed to update trip status' };
    }

    return { success: true, trip: updatedTrip };
  }

  async completeTrip(_id: string): Promise<TripDocument | null> {
    return this.tripRepository.findByIdAndUpdate(_id, {
      status: TripStatus.PAYMENT,
    });
  }

  async canActivateTrip(
    customerId: string,
    driverId: string,
  ): Promise<{ canActivate: boolean; message?: string }> {
    // Check if customer already has an active trip (WAITING_FOR_DRIVER status)
    const customerActiveTrip = await this.findActiveByCustomerId(customerId);
    if (customerActiveTrip) {
      return {
        canActivate: false,
        message: `Customer already has an active trip with ID: ${customerActiveTrip._id}`,
      };
    }

    // If driver is assigned, check if they already have an active trip (APPROVED status)
    if (driverId) {
      const driverActiveTrip = await this.findActiveByDriverId(driverId);
      if (driverActiveTrip) {
        return {
          canActivate: false,
          message: `Driver already has an active trip with ID: ${driverActiveTrip._id}`,
        };
      }
    }

    return { canActivate: true };
  }

  async callDrivers(
    tripId: string,
    customerId: string,
    driverIds: string[],
  ): Promise<{ success: boolean; trip?: TripDocument; message?: string }> {
    const trip = await this.findTrip(tripId);
    if (!trip) {
      return { success: false, message: 'Trip not found' };
    }

    const customerActiveTrip = await this.findActiveByCustomerId(customerId);
    if (
      customerActiveTrip &&
      customerActiveTrip._id &&
      customerActiveTrip._id.toString() !== tripId
    ) {
      return {
        success: false,
        message: `Customer already has an active trip with ID: ${customerActiveTrip._id}`,
      };
    }

    const currentRetryCount = trip.callRetryCount || 0;
    const newRetryCount = currentRetryCount + 1;

    const updateData: UpdateTripDto = {
      status: TripStatus.WAITING_FOR_DRIVER,
      calledDriverIds: driverIds,
      customerId: customerId,
      callStartTime: new Date(),
      callRetryCount: newRetryCount,
    };

    const updatedTrip = await this.tripRepository.findByIdAndUpdate(
      tripId,
      updateData,
    );

    if (!updatedTrip) {
      return { success: false, message: 'Failed to update trip status' };
    }

    return { success: true, trip: updatedTrip };
  }

  async rejectDriver(
    tripId: string,
    driverId: string,
  ): Promise<{ success: boolean; trip?: TripDocument; message?: string }> {
    // Find the trip
    const trip = await this.findTrip(tripId);
    if (!trip) {
      return { success: false, message: 'Trip not found' };
    }

    // Get current rejectedDriverIds or initialize empty array
    const rejectedDriverIds = trip.rejectedDriverIds || [];

    // Add the driver ID to rejectedDriverIds if not already present
    if (!rejectedDriverIds.includes(driverId)) {
      rejectedDriverIds.push(driverId);
    }

    // Update the trip
    const updatedTrip = await this.tripRepository.findByIdAndUpdate(tripId, {
      rejectedDriverIds,
    });

    if (!updatedTrip) {
      return { success: false, message: 'Failed to update trip' };
    }

    return { success: true, trip: updatedTrip };
  }

  async cancelTrip(
    userId: string,
    userType: string,
  ): Promise<{ success: boolean; trip?: TripDocument; message?: string }> {
    let trip: TripDocument | null;

    // Find the active trip based on user type
    if (userType === 'customer') {
      trip = await this.findActiveByCustomerId(userId);
    } else if (userType === 'driver') {
      trip = await this.findActiveByDriverId(userId);
    } else {
      return { success: false, message: 'Invalid user type' };
    }

    // Check if an active trip was found
    if (!trip) {
      return { 
        success: false, 
        message: `No active trip found for ${userType} with ID: ${userId}` 
      };
    }

    // Update the trip status to CANCELLED
    const updatedTrip = await this.tripRepository.findByIdAndUpdate(
      trip._id,
      { status: TripStatus.CANCELLED },
    );

    if (!updatedTrip) {
      return { success: false, message: 'Failed to cancel trip' };
    }

    return { success: true, trip: updatedTrip };
  }
}
