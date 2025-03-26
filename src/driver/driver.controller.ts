import { Body, Controller, Post } from '@nestjs/common';
import { DriverService } from './driver.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Driver')
@Controller('driver')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post('trip/accept')
  @ApiOperation({
    summary:
      'Şoför trip’i kabul eder ve trip status waiting olarak güncellenir.',
  })
  async acceptTrip(@Body() body: any) {
    // body içerisinde tripId ve şoförId gibi bilgiler gelecek
    const result = await this.driverService.acceptTrip(
      body.tripId,
      body.driverId,
    );
    return result;
  }

  @Post('trip/reject')
  @ApiOperation({
    summary: 'Şoför trip’i red eder ve trip status pending olarak güncellenir.',
  })
  async rejectTrip(@Body() body: any) {
    // body içerisinde tripId ve şoförId gibi bilgiler gelecek
    const result = await this.driverService.rejectTrip(
      body.tripId,
      body.driverId,
    );
    return result;
  }

  @Post('trip/update-status')
  @ApiOperation({
    summary:
      'Trip durum güncellemeleri (ör. yola çıktı, alım noktasına ulaştı vb.) için kullanılır.',
  })
  async updateTripStatus(@Body() body: any) {
    // body içerisinde tripId ve güncellenecek status bilgisi gelecek
    const result = await this.driverService.updateTripStatus(
      body.tripId,
      body.status,
    );
    return result;
  }
}
