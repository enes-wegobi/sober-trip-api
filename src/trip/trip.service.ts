import { Injectable, Logger } from '@nestjs/common';
import { TripRepository } from './trip.repository';
import { CreateTripDto } from './dto/create-trip.dto';
import { TripDocument } from './schemas/trip.schema';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripStatus } from 'src/common/enums/trip-status.enum';
import { LockService } from '../common/lock/lock.service';
import { TripErrors } from '../exceptions/trip-errors';
import { TripStateService } from './trip-state.service';

@Injectable()
export class TripService {
  private readonly logger = new Logger(TripService.name);

  constructor(
    private readonly tripRepository: TripRepository,
    private readonly lockService: LockService,
    private readonly tripStateService: TripStateService,
  ) {}

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

  async activateTrip(
    tripId: string,
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

        const { canActivate, message } = await this.canActivateTrip(
          trip.customerId,
          trip.driverId,
        );
        if (!canActivate) {
          return { success: false, message };
        }

        const newStatus = trip.driverId
          ? TripStatus.APPROVED
          : TripStatus.WAITING_FOR_DRIVER;

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

        const updatedTrip = await this.tripRepository.findByIdAndUpdate(
          tripId,
          {
            status: newStatus,
          },
        );

        if (!updatedTrip) {
          return { success: false, message: 'Failed to update trip status' };
        }

        return { success: true, trip: updatedTrip };
      },
      TripErrors.TRIP_LOCKED.message,
    );
  }

  async completeTrip(
    tripId: string,
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

        const transitionValidation = this.tripStateService.canTransition(
          trip.status,
          TripStatus.PAYMENT,
        );
        if (!transitionValidation.valid) {
          return {
            success: false,
            message:
              transitionValidation.message ||
              TripErrors.TRIP_INVALID_STATUS.message,
          };
        }

        const updatedTrip = await this.tripRepository.findByIdAndUpdate(
          tripId,
          {
            status: TripStatus.PAYMENT,
          },
        );

        if (!updatedTrip) {
          return { success: false, message: 'Failed to complete trip' };
        }

        return { success: true, trip: updatedTrip };
      },
      TripErrors.TRIP_LOCKED.message,
    );
  }

  async canActivateTrip(
    customerId: string,
    driverId: string,
  ): Promise<{ canActivate: boolean; message?: string }> {
    const customerActiveTrip = await this.findActiveByCustomerId(customerId);
    if (customerActiveTrip) {
      return {
        canActivate: false,
        message: `Customer already has an active trip with ID: ${customerActiveTrip.id}`,
      };
    }

    if (driverId) {
      const driverActiveTrip = await this.findActiveByDriverId(driverId);
      if (driverActiveTrip) {
        return {
          canActivate: false,
          message: `Driver already has an active trip with ID: ${driverActiveTrip.id}`,
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
    // Execute the operation with a lock
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

        const statusValidation = this.tripStateService.validateStatus(
          trip.status,
          TripStatus.DRAFT,
        );
        if (!statusValidation.valid) {
          return {
            success: false,
            message:
              statusValidation.message ||
              TripErrors.TRIP_INVALID_STATUS.message,
          };
        }

        const customerActiveTrip =
          await this.findActiveByCustomerId(customerId);
        if (
          customerActiveTrip &&
          customerActiveTrip.id &&
          customerActiveTrip.id !== tripId
        ) {
          return {
            success: false,
            message: `Customer already has an active trip with ID: ${customerActiveTrip.id}`,
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
      },
      TripErrors.TRIP_LOCKED.message,
    );
  }

  async rejectDriver(
    tripId: string,
    driverId: string,
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

        const statusValidation = this.tripStateService.validateStatus(
          trip.status,
          TripStatus.WAITING_FOR_DRIVER,
        );
        if (!statusValidation.valid) {
          return {
            success: false,
            message:
              statusValidation.message ||
              TripErrors.TRIP_INVALID_STATUS.message,
          };
        }

        const rejectedDriverIds = trip.rejectedDriverIds || [];

        if (!rejectedDriverIds.includes(driverId)) {
          rejectedDriverIds.push(driverId);
        }

        const updatedTrip = await this.tripRepository.findByIdAndUpdate(
          tripId,
          {
            rejectedDriverIds,
          },
        );

        if (!updatedTrip) {
          return { success: false, message: 'Failed to update trip' };
        }

        return { success: true, trip: updatedTrip };
      },
      TripErrors.TRIP_LOCKED.message,
    );
  }

  async cancelTrip(
    userId: string,
    userType: string,
  ): Promise<{ success: boolean; trip?: TripDocument; message?: string }> {
    let trip: TripDocument | null;

    if (userType === 'customer') {
      trip = await this.findActiveByCustomerId(userId);
    } else if (userType === 'driver') {
      trip = await this.findActiveByDriverId(userId);
    } else {
      return { success: false, message: 'Invalid user type' };
    }

    if (!trip) {
      return {
        success: false,
        message: `No active trip found for ${userType} with ID: ${userId}`,
      };
    }

    return this.lockService.executeWithLock<{
      success: boolean;
      trip?: TripDocument;
      message?: string;
    }>(
      `trip:${trip.id}`,
      async () => {
        const freshTrip = await this.findTrip(trip.id);
        if (!freshTrip) {
          return { success: false, message: TripErrors.TRIP_NOT_FOUND.message };
        }

        const transitionValidation = this.tripStateService.canTransition(
          freshTrip.status,
          TripStatus.CANCELLED,
        );
        if (!transitionValidation.valid) {
          return {
            success: false,
            message:
              transitionValidation.message ||
              `Cannot cancel trip in ${freshTrip.status} status`,
          };
        }
        const updatedTrip = await this.tripRepository.findByIdAndUpdate(
          freshTrip.id,
          {
            status: TripStatus.CANCELLED,
          },
        );

        if (!updatedTrip) {
          return { success: false, message: 'Failed to cancel trip' };
        }

        return { success: true, trip: updatedTrip };
      },
      TripErrors.TRIP_LOCKED.message,
    );
  }
}
