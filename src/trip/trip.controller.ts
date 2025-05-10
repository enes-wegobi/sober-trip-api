import { Controller, Post, Body } from '@nestjs/common';
import { TripService } from './trip.service';
import { MapsService } from '../common/clients/maps/maps.service';
import { EstimateTripDto } from './dto/estimate-trip.dto';
import { ConfigService } from '../config/config.service';
import { TripStatus } from '../common/enums/trip-status.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';

@Controller('trips')
export class TripController {
  constructor(
    private readonly tripService: TripService,
    private readonly mapsService: MapsService,
    private readonly configService: ConfigService,
  ) {}

  @Post('estimate')
  async estimateTrip(@Body() estimateTripDto: EstimateTripDto) {
    // Get distance matrix from Maps service
    const distanceMatrix = await this.mapsService.getDistanceMatrix(
      estimateTripDto.routePoints,
    );

    if (!distanceMatrix.success || !distanceMatrix.duration || !distanceMatrix.distance) {
      return {
        success: false,
        message: distanceMatrix.message || 'Failed to calculate distance',
      };
    }

    // Calculate estimated cost based on duration
    const durationInMinutes = distanceMatrix.duration.value / 60;
    const costPerMinute = this.configService.tripCostPerMinute;
    const estimatedCost = durationInMinutes * costPerMinute;

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
