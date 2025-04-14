import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CreateTripDto } from '../trip/dto/create-trip.dto';
import { CustomerService } from './customer.service';
import { TripRateDto } from 'src/trip/dto/trip-rate.dto';

@ApiTags('Customer')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}
  //todo customers last trips paginated
  @Post('trip/confirm')
  @ApiOperation({
    summary:
      'Trip onaylama: Trip verileri DB’ye kaydedilir ve şoför arama süreci başlar.',
  })
  async confirmTrip(@Body() createTripDto: CreateTripDto) {
    const trip = await this.customerService.createTrip(createTripDto);
    return trip;
  }

  @Post('trip/cancel/:tripId')
  @ApiOperation({
    summary: 'Trip iptali: Trip verisi alınır ve iptal işlemi yapılır.',
  })
  @ApiQuery({ name: 'tripId', required: true, type: String })
  async cancelTrip(@Param('tripId') tripId: string) {
    return await this.customerService.cancelTrip(tripId);
  }

  @Post('trip/rate/:tripId')
  @ApiOperation({
    summary: 'Trip iptali: Trip verisi alınır ve iptal işlemi yapılır.',
  })
  @ApiQuery({ name: 'tripId', required: true, type: String })
  async rateTrip(
    @Param('tripId') tripId: string,
    @Body() tripRateDto: TripRateDto,
  ) {
    return await this.customerService.rateTrip(tripId, tripRateDto);
  }
}
