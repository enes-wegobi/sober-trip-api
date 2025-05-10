import { Controller, Post, Body } from '@nestjs/common';
import { TripService } from './trip.service';
import { MapsService } from '../common/clients/maps/maps.service';
import { EstimateTripDto } from './dto/estimate-trip.dto';
import { ConfigService } from '../config/config.service';
import { TripStatus } from '../common/enums/trip-status.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

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
  @ApiResponse({
    status: 200,
    description: 'Trip estimated successfully',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        trip: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '60a1b2c3d4e5f6a7b8c9d0e1' },
            customerId: { type: 'string', example: '60a1b2c3d4e5f6a7b8c9d0e2' },
            estimatedDistance: { type: 'number', example: 5000 },
            estimatedDuration: { type: 'number', example: 1200 },
            estimatedCost: { type: 'number', example: 20 },
            status: { type: 'string', example: 'DRAFT' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request or failed to calculate distance',
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Failed to calculate distance' },
      },
    },
  })
  @Post('estimate')
  async estimateTrip(@Body() estimateTripDto: EstimateTripDto) {
    // Get distance matrix from Maps service
    const distanceMatrix = await this.mapsService.getDistanceMatrix(
      estimateTripDto.routePoints,
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
      route: estimateTripDto.routePoints,
      estimatedDistance: distanceMatrix.distance.value,
      estimatedDuration: distanceMatrix.duration.value,
      estimatedCost,
    });

    return {
      success: true,
      trip: {
        id: trip._id,
        customerId: trip.customerId,
        route: trip.route,
        estimatedDistance: trip.estimatedDistance,
        estimatedDuration: trip.estimatedDuration,
        estimatedCost: trip.estimatedCost,
        status: trip.status,
      },
    };
  }
}
