import { Injectable, Logger } from '@nestjs/common';
import { TripRepository } from './trip.repository';
import { CreateTripDto } from './dto/create-trip.dto';
import { TripDocument } from './schemas/trip.schema';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripStatus } from '../common/enums/trip-status.enum';
import { LockService } from '../common/lock/lock.service';
import { TripErrors } from '../exceptions/trip-errors';
import { TripStateService } from './trip-state.service';
import { CustomersClient } from 'src/common/clients/customer/customers.client';
import { DriversClient } from 'src/common/clients/driver/drivers.client';

@Injectable()
export class TripService {
  private readonly logger = new Logger(TripService.name);

  constructor(
    private readonly tripRepository: TripRepository,
    private readonly lockService: LockService,
    private readonly tripStateService: TripStateService,
    private readonly customersClient: CustomersClient,
    private readonly driversClient: DriversClient,
  ) {}

  async findTrip(tripId: string) {
    return this.tripRepository.findById(tripId);
  }

  async findLatestPendingByCustomerId(customerId: string) {
    return this.tripRepository.findLatestPendingByCustomerId(customerId);
  }

  async findActiveByCustomerId(customerId: string) {
    const customer = await this.customersClient.findOne(customerId, [
      'activeTrip',
    ]);
    if (!customer.activeTrip) {
      return {
        success: false,
        message: 'No active trip found for this customer',
      };
    }
    const trip = await this.findTrip(customer.activeTrip);

    if (!trip) {
      return {
        success: false,
        message: 'No active trip found for this customer',
      };
    }

    return {
      success: true,
      trip,
    };
  }

  async findActiveByDriverId(driverId: string) {
    const driver = await this.driversClient.findOne(driverId, ['activeTrip']);
    if (!driver.activeTrip) {
      return {
        success: false,
        message: 'No active trip found for this driver',
      };
    }
    const trip = await this.findTrip(driver.activeTrip);

    if (!trip) {
      return {
        success: false,
        message: 'No active trip found for this driver',
      };
    }

    return {
      success: true,
      trip,
    };
  }

  async createTrip(
    tripData: CreateTripDto,
    customerId: string,
  ): Promise<TripDocument> {
    const customer = await this.customersClient.findOne(customerId, [
      'name',
      'surname',
      'rate',
      'vehicle.transmissionType',
      'vehicle.licensePlate',
      'photoUrl',
    ]);
    const trip = {
      ...tripData,
      customer: {
        id: customer._id,
        name: customer.name,
        surname: customer.surname,
        rate: customer.rate,
        Vehicle: {
          transmissionType: customer.vehicle.transmissionType,
          licensePlate: customer.vehicle.licensePlate,
        },
        photoUrl: customer.photoUrl,
      },
    };
    return this.tripRepository.createTrip(trip);
  }

  async updateTrip(
    tripId: string,
    tripData: UpdateTripDto,
  ): Promise<{ success: boolean; trip?: TripDocument; message?: string }> {
    return this.lockService.executeWithLock<{
      success: boolean;
      trip?: TripDocument;
      message?: string;
    }>(
      `trip:${tripId}`,
      async () => {
        const trip = await this.findTrip(tripId);
        if (!trip) {
          return { success: false, message: TripErrors.TRIP_NOT_FOUND.message };
        }

        if (tripData.status && tripData.status !== trip.status) {
          const transitionValidation = this.tripStateService.canTransition(
            trip.status,
            tripData.status,
          );
          if (!transitionValidation.valid) {
            return {
              success: false,
              message:
                transitionValidation.message ||
                TripErrors.TRIP_INVALID_STATUS.message,
            };
          }
        }

        const updatedTrip = await this.tripRepository.findByIdAndUpdate(
          tripId,
          tripData,
        );

        if (!updatedTrip) {
          return { success: false, message: 'Failed to update trip' };
        }

        return { success: true, trip: updatedTrip };
      },
      TripErrors.TRIP_LOCKED.message,
    );
  }

  async callDrivers(
    tripId: string,
    customerId: string,
    driverIds: string[],
  ): Promise<{ success: boolean; trip?: TripDocument; message?: string }> {
    const trip = await this.findTrip(tripId);
    if (!trip) {
      return { success: false, message: TripErrors.TRIP_NOT_FOUND.message };
    }

    const statusValidation = this.tripStateService.validateMultipleStatuses(
      trip.status,
      [TripStatus.DRAFT, TripStatus.DRIVER_NOT_FOUND],
    );
    if (!statusValidation.valid) {
      return {
        success: false,
        message:
          statusValidation.message || TripErrors.TRIP_INVALID_STATUS.message,
      };
    }

    const customerActiveTripResult =
      await this.findActiveByCustomerId(customerId);
    if (
      customerActiveTripResult.trip &&
      customerActiveTripResult.trip._id &&
      customerActiveTripResult.trip._id !== tripId
    ) {
      return {
        success: false,
        message: `Customer already has an active trip with ID: ${customerActiveTripResult.trip._id}`,
      };
    }

    const currentRetryCount = trip.callRetryCount || 0;
    const newRetryCount = currentRetryCount + 1;

    const transitionValidation = this.tripStateService.canTransition(
      trip.status,
      TripStatus.WAITING_FOR_DRIVER,
    );
    if (!transitionValidation.valid) {
      return {
        success: false,
        message:
          transitionValidation.message ||
          TripErrors.TRIP_INVALID_STATUS.message,
      };
    }

    const updateData: UpdateTripDto = {
      status: TripStatus.WAITING_FOR_DRIVER,
      calledDriverIds: driverIds,
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
    await this.customersClient.setActiveTrip(customerId, {
      tripId: updatedTrip._id,
    });
    return { success: true, trip: updatedTrip };
  }

  async rejectDriver(
    tripId: string,
    driverId: string,
  ): Promise<{ success: boolean; trip?: TripDocument; message?: string }> {
    const trip = await this.findTrip(tripId);
    if (!trip) {
      return { success: false, message: TripErrors.TRIP_NOT_FOUND.message };
    }

    const statusValidation = this.tripStateService.validateStatus(
      trip.status,
      TripStatus.WAITING_FOR_DRIVER,
    );
    if (!statusValidation.valid) {
      return {
        success: false,
        message:
          statusValidation.message || TripErrors.TRIP_INVALID_STATUS.message,
      };
    }

    const rejectedDriverIds = trip.rejectedDriverIds || [];

    if (!rejectedDriverIds.includes(driverId)) {
      rejectedDriverIds.push(driverId);
    }

    // Check if all called drivers are now rejected
    let newStatus = trip.status;
    if (trip.calledDriverIds && trip.calledDriverIds.length > 0) {
      const allDriversRejected = trip.calledDriverIds.every((id) =>
        rejectedDriverIds.includes(id),
      );

      if (allDriversRejected) {
        newStatus = TripStatus.DRIVER_NOT_FOUND;
      }
    }

    const updatedTrip = await this.tripRepository.findByIdAndUpdate(tripId, {
      rejectedDriverIds,
      status: newStatus,
    });

    if (!updatedTrip) {
      return { success: false, message: 'Failed to update trip' };
    }

    return { success: true, trip: updatedTrip };
  }

  async approveTrip(
    tripId: string,
    driverId: string,
  ): Promise<{ success: boolean; trip?: TripDocument; message?: string }> {
    const trip = await this.findTrip(tripId);
    if (!trip) {
      return { success: false, message: TripErrors.TRIP_NOT_FOUND.message };
    }
    const driver = await this.driversClient.findOne(driverId, [
      'name',
      'surname',
      'rate',
      'photoUrl',
    ]);
    const transitionValidation = this.tripStateService.canTransition(
      trip.status,
      TripStatus.APPROVED,
    );
    if (!transitionValidation.valid) {
      return {
        success: false,
        message:
          transitionValidation.message ||
          TripErrors.TRIP_INVALID_STATUS.message,
      };
    }

    const driverActiveTripResult = await this.findActiveByDriverId(driverId);
    if (driverActiveTripResult.trip) {
      return {
        success: false,
        message: `Driver already has an active trip with ID: ${driverActiveTripResult.trip._id}`,
      };
    }

    const updatedTrip = await this.tripRepository.findByIdAndUpdate(tripId, {
      driver: {
        id: driver._id,
        name: driver.name,
        surname: driver.surname,
        photoUrl: driver.photoUrl,
        rate: driver.rate,
      },
      status: TripStatus.APPROVED,
    });

    if (!updatedTrip) {
      return { success: false, message: 'Failed to approve trip' };
    }
    await this.driversClient.setActiveTrip(driverId, {
      tripId: updatedTrip._id,
    });

    return { success: true, trip: updatedTrip };
  }

  /**
   * Update trip status
   * @param tripId Trip ID
   * @param newStatus New status to set
   * @returns Object with success flag, updated trip, and optional message
   */
  async updateTripStatus(
    tripId: string,
    newStatus: TripStatus,
  ): Promise<{ success: boolean; trip?: TripDocument; message?: string }> {
    const trip = await this.findTrip(tripId);
    if (!trip) {
      return { success: false, message: TripErrors.TRIP_NOT_FOUND.message };
    }

    // Only allow transitions to the specific statuses we want
    if (
      ![
        TripStatus.DRIVER_ON_WAY_TO_PICKUP,
        TripStatus.ARRIVED_AT_PICKUP,
        TripStatus.TRIP_IN_PROGRESS,
      ].includes(newStatus)
    ) {
      return {
        success: false,
        message: `Cannot update to status ${newStatus}. Only DRIVER_ON_WAY_TO_PICKUP, ARRIVED_AT_PICKUP, and TRIP_IN_PROGRESS are allowed.`,
      };
    }

    // Validate the status transition
    const transitionValidation = this.tripStateService.canTransition(
      trip.status,
      newStatus,
    );
    if (!transitionValidation.valid) {
      return {
        success: false,
        message:
          transitionValidation.message ||
          TripErrors.TRIP_INVALID_STATUS.message,
      };
    }

    // Update the trip status
    const updatedTrip = await this.tripRepository.findByIdAndUpdate(tripId, {
      status: newStatus,
    });

    if (!updatedTrip) {
      return { success: false, message: 'Failed to update trip status' };
    }

    return { success: true, trip: updatedTrip };
  }
}
