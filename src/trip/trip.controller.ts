import { Controller, Post, Body, Param, Get, Query } from '@nestjs/common';
import { TripService } from './trip.service';
import { MapsService } from '../common/clients/maps/maps.service';
import { EstimateTripDto } from './dto/estimate-trip.dto';
import { CallDriversDto } from './dto/call-drivers.dto';
import { RejectDriverDto } from './dto/reject-driver.dto';
import { CancelTripDto } from './dto/cancel-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { ConfigService } from '../config/config.service';
import { TripStatus } from '../common/enums/trip-status.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('trips')
@Controller('trips')
export class TripController {
  constructor(
    private readonly tripService: TripService,
    private readonly mapsService: MapsService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Estimate trip cost and distance' })
  @ApiBody({ type: EstimateTripDto })
  @Post('estimate')
  async estimateTrip(@Body() estimateTripDto: EstimateTripDto) {
    // Get distance matrix from Maps service
    const distanceMatrix = await this.mapsService.getDistanceMatrix(
      estimateTripDto.route,
    );

    if (
      !distanceMatrix.success ||
      !distanceMatrix.duration ||
      !distanceMatrix.distance
    ) {
      return {
        success: false,
        message: distanceMatrix.message || 'Failed to calculate distance',
      };
    }

    // Calculate estimated cost based on duration
    const durationInMinutes = distanceMatrix.duration.value / 60;
    const costPerMinute = this.configService.tripCostPerMinute;
    const estimatedCost =
      Math.round(durationInMinutes * costPerMinute * 100) / 100;

    // Create a trip record
    const trip = await this.tripService.createTrip({
      customerId: estimateTripDto.customerId,
      status: TripStatus.DRAFT,
      paymentStatus: PaymentStatus.UNPAID,
      route: estimateTripDto.route,
      estimatedDistance: distanceMatrix.distance.value,
      estimatedDuration: distanceMatrix.duration.value,
      estimatedCost,
    });

    return {
      success: true,
      trip: trip,
    };
  }

  @ApiOperation({ summary: 'Call drivers for a trip' })
  @ApiBody({ type: CallDriversDto })
  @Post(':tripId/request-driver')
  async callDrivers(
    @Param('tripId') tripId: string,
    @Body() callDriversDto: CallDriversDto,
  ) {
    const result = await this.tripService.callDrivers(
      tripId,
      callDriversDto.customerId,
      callDriversDto.driverIds,
    );

    if (!result.success || !result.trip) {
      return {
        success: false,
        message: result.message || 'Failed to call drivers',
      };
    }

    return result;
  }

  @ApiOperation({ summary: 'Reject driver for a trip' })
  @ApiBody({ type: RejectDriverDto })
  @Post('reject-driver')
  async rejectDriver(@Body() rejectDriverDto: RejectDriverDto) {
    const result = await this.tripService.rejectDriver(
      rejectDriverDto.tripId,
      rejectDriverDto.driverId,
    );

    if (!result.success || !result.trip) {
      return {
        success: false,
        message: result.message || 'Failed to reject driver',
      };
    }

    return {
      success: true,
      trip: result.trip,
    };
  }

  @ApiOperation({ summary: 'Cancel an active trip' })
  @ApiBody({ type: CancelTripDto })
  @Post('cancel')
  async cancelTrip(@Body() cancelTripDto: CancelTripDto) {
    const result = await this.tripService.cancelTrip(
      cancelTripDto.userId,
      cancelTripDto.userType,
    );

    if (!result.success || !result.trip) {
      return {
        success: false,
        message: result.message || 'Failed to cancel trip',
      };
    }

    return {
      success: true,
      trip: result.trip,
    };
  }

  @ApiOperation({ summary: 'Get trip by ID' })
  @ApiParam({ name: 'tripId', description: 'Trip ID' })
  @Get(':tripId')
  async getTrip(@Param('tripId') tripId: string) {
    const trip = await this.tripService.findTrip(tripId);

    if (!trip) {
      return {
        success: false,
        message: 'Trip not found',
      };
    }

    return {
      success: true,
      trip,
    };
  }

  @ApiOperation({ summary: 'Update trip' })
  @ApiParam({ name: 'tripId', description: 'Trip ID' })
  @ApiBody({ type: UpdateTripDto })
  @Post(':tripId/update')
  async updateTrip(
    @Param('tripId') tripId: string,
    @Body() updateTripDto: UpdateTripDto,
  ) {
    const result = await this.tripService.updateTrip(tripId, updateTripDto);

    if (!result.success || !result.trip) {
      return {
        success: false,
        message: result.message || 'Failed to update trip',
      };
    }

    return {
      success: true,
      trip: result.trip,
    };
  }

  @ApiOperation({ summary: 'Complete trip (move to payment)' })
  @ApiParam({ name: 'tripId', description: 'Trip ID' })
  @Post(':tripId/complete')
  async completeTrip(@Param('tripId') tripId: string) {
    const result = await this.tripService.completeTrip(tripId);

    if (!result.success || !result.trip) {
      return {
        success: false,
        message: result.message || 'Failed to complete trip',
      };
    }

    return {
      success: true,
      trip: result.trip,
    };
  }

  @ApiOperation({ summary: 'Activate trip' })
  @ApiParam({ name: 'tripId', description: 'Trip ID' })
  @Post(':tripId/activate')
  async activateTrip(@Param('tripId') tripId: string) {
    const result = await this.tripService.activateTrip(tripId);

    if (!result.success || !result.trip) {
      return {
        success: false,
        message: result.message || 'Failed to activate trip',
      };
    }

    return {
      success: true,
      trip: result.trip,
    };
  }

  @ApiOperation({ summary: 'Approve trip with driver' })
  @ApiParam({ name: 'tripId', description: 'Trip ID' })
  @ApiBody({ type: Object, schema: { properties: { driverId: { type: 'string' } } } })
  @Post(':tripId/approve')
  async approveTrip(
    @Param('tripId') tripId: string,
    @Body('driverId') driverId: string,
  ) {
    const result = await this.tripService.approveTrip(tripId, driverId);

    if (!result.success || !result.trip) {
      return {
        success: false,
        message: result.message || 'Failed to approve trip',
      };
    }

    return {
      success: true,
      trip: result.trip,
    };
  }
}
